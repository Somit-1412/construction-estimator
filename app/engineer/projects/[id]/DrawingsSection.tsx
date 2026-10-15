"use client";

import { useState } from "react";

type Drawing = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
};

type DrawingsSectionProps = {
  projectId: string;
  initialDrawings: Drawing[];
};

export default function DrawingsSection({
  initialDrawings,
}: DrawingsSectionProps) {
  const [drawings] = useState<Drawing[]>(initialDrawings);
  const [openingDrawingId, setOpeningDrawingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleViewDrawing(drawingId: string) {
    setOpeningDrawingId(drawingId);
    setError("");

    try {
      const response = await fetch(
        `/api/drawings/${drawingId}/url`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to open drawing.",
        );
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to open drawing.",
      );
    } finally {
      setOpeningDrawingId(null);
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div>
        <h3 className="font-medium text-white">
          Drawings
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          Drawings submitted by the client for engineer review.
        </p>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-5">
        {drawings.length === 0 ? (
          <div className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-5">
            <p className="text-sm text-zinc-500">
              No drawings have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {drawings.map((drawing) => (
              <div
                key={drawing.id}
                className="flex items-center justify-between gap-4 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {drawing.originalName}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {formatFileSize(drawing.sizeBytes)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleViewDrawing(drawing.id)
                  }
                  disabled={
                    openingDrawingId === drawing.id
                  }
                  className="shrink-0 rounded-md border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {openingDrawingId === drawing.id
                    ? "Opening..."
                    : "View Drawing"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
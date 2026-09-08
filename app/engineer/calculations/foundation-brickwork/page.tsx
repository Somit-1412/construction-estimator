import FoundationBrickworkSection from "@/components/FoundationBrickworkSection";

export default function FoundationBrickworkPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Foundation & Plinth Brickwork
        </h1>
        <p className="mt-2 text-zinc-400">
          Calculate foundation and plinth brickwork quantities.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <FoundationBrickworkSection />
      </div>
    </div>
  );
}
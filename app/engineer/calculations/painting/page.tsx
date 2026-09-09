import PaintingSection from "@/components/PaintingSection";

export default function PaintingPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Painting
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate painting quantities based on plastered surface areas.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <PaintingSection />
      </div>
    </div>
  );
}
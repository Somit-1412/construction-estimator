import SlabSection from "@/components/SlabSection";

export default function SlabsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Slabs
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate slab concrete and structural quantities.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <SlabSection />
      </div>
    </div>
  );
}
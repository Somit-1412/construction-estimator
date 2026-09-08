import SlabShutteringSection from "@/components/SlabShutteringSection";

export default function SlabShutteringPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Slab Shuttering
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate slab shuttering and centering quantities.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <SlabShutteringSection />
      </div>
    </div>
  );
}
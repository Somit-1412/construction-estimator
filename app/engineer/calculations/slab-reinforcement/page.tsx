import SlabReinforcementSection from "@/components/SlabReinforcementSection";

export default function SlabReinforcementPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Slab Reinforcement
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate slab reinforcement quantities for the project.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <SlabReinforcementSection />
      </div>
    </div>
  );
}
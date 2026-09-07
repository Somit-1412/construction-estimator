import BeamConcreteSection from "@/components/BeamConcreteSection";

export default function BeamsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Beams
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate beam concrete, reinforcement and shuttering quantities.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <BeamConcreteSection />
      </div>
    </div>
  );
}
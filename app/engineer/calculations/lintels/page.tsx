import LintelConcreteSection from "@/components/LintelConcreteSection";
import LintelReinforcementSection from "@/components/LintelReinforcementSection";
import LintelShutteringSection from "@/components/LintelShutteringSection";

export default function LintelsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Lintels
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate lintel concrete, reinforcement and shuttering quantities.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <LintelConcreteSection />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <LintelReinforcementSection />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <LintelShutteringSection />
        </div>
      </div>
    </div>
  );
}
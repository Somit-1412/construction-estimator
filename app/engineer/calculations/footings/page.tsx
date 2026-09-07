import FootingSection from "@/components/FootingSection";
import FootingReinforcementSection from "@/components/FootingReinforcementSection";
import FootingShutteringSection from "@/components/FootingShutteringSection";

export default function FootingsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Footings
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate footing concrete, reinforcement and shuttering.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <FootingSection />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <FootingReinforcementSection />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <FootingShutteringSection />
        </div>
      </div>
    </div>
  );
}
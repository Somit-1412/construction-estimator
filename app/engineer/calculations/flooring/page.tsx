import FlooringSection from "@/components/FlooringSection";

export default function FlooringPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Flooring
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate flooring areas, tile quantities, and flooring materials.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <FlooringSection />
      </div>
    </div>
  );
}
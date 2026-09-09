import VentilatorsSection from "@/components/VentilatorsSection";

export default function VentilatorsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Ventilators
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate ventilator opening areas for quantity estimation and deductions.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <VentilatorsSection />
      </div>
    </div>
  );
}
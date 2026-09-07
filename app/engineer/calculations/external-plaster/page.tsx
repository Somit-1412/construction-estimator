import ExternalPlasterSection from "@/components/ExternalPlasterSection";

export default function ExternalPlasterPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          External Plaster
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate external wall plaster quantities.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <ExternalPlasterSection />
      </div>
    </div>
  );
}
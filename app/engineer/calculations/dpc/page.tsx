import DPCSection from "@/components/DPCSection";

export default function DPCPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          DPC
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate damp-proof course quantities.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <DPCSection />
      </div>
    </div>
  );
}
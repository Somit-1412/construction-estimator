import FillingSection from "@/components/FillingSection";

export default function FillingPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Filling
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate earth and plinth filling quantities.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <FillingSection />
      </div>
    </div>
  );
}
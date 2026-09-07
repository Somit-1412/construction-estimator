import ColumnConcreteSection from "@/components/ColumnConcreteSection";

export default function ColumnsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Columns
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate column concrete and shuttering quantities.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <ColumnConcreteSection />
      </div>
    </div>
  );
}
import ExcavationSection from "@/components/ExcavationSection";

export default function ExcavationPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Excavation
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate earthwork excavation quantities for the project.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <ExcavationSection />
      </div>
    </div>
  );
}
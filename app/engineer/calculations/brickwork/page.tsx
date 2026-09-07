import BrickworkSection from "@/components/BrickworkSection";

export default function BrickworkPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Brickwork
        </h1>

        <p className="mt-2 text-zinc-400">
          Calculate brickwork quantities and deductions.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <BrickworkSection />
      </div>
    </div>
  );
}
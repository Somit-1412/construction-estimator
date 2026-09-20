import Link from "next/link";
import { notFound } from "next/navigation";

import { CalculationType } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

type Module = {
  type: CalculationType;
  title: string;
  description: string;
  route: string;
};

type Category = { title: string; description: string; modules: Module[] };

const categories: Category[] = [
  {
    title: "Foundation",
    description: "Foundation and below-plinth quantity calculations.",
    modules: [
      { type: "EXCAVATION", title: "Excavation", description: "Earthwork excavation quantities.", route: "excavation" },
      { type: "PCC", title: "PCC", description: "Plain cement concrete quantities.", route: "pcc" },
      { type: "FOOTING", title: "Footings", description: "Footing concrete, reinforcement and shuttering.", route: "footing" },
      { type: "FOOTING_REINFORCEMENT", title: "Footing Reinforcement", description: "Footing reinforcement steel quantities.", route: "footing-reinforcement" },
      { type: "FOOTING_SHUTTERING", title: "Footing Shuttering", description: "Footing shuttering quantities.", route: "footing-shuttering" },
    ],
  },
  {
    title: "Structure",
    description: "RCC structural member calculations.",
    modules: [
      { type: "COLUMN_CONCRETE", title: "Columns", description: "Column concrete and shuttering quantities.", route: "column-concrete" },
      { type: "COLUMN_SHUTTERING", title: "Column Shuttering", description: "Column shuttering quantities.", route: "column-shuttering" },
      { type: "BEAM_CONCRETE", title: "Beams", description: "Beam concrete, reinforcement and shuttering quantities.", route: "beam-concrete" },
      { type: "BEAM_REINFORCEMENT", title: "Beam Reinforcement", description: "Beam reinforcement quantities.", route: "beam-reinforcement" },
      { type: "BEAM_BBS", title: "Beam BBS", description: "Beam bar bending schedule quantities.", route: "beam-bbs" },
      { type: "BEAM_SHUTTERING", title: "Beam Shuttering", description: "Beam shuttering quantities.", route: "beam-shuttering" },
      { type: "SLAB_CONCRETE", title: "Slabs", description: "Slab concrete quantities.", route: "slab-concrete" },
      { type: "SLAB_REINFORCEMENT", title: "Slab Reinforcement", description: "Slab reinforcement steel quantities.", route: "slab-reinforcement" },
      { type: "SLAB_SHUTTERING", title: "Slab Shuttering", description: "Slab shuttering quantities.", route: "slab-shuttering" },
    ],
  },
  {
    title: "Masonry",
    description: "Wall and masonry-related calculations.",
    modules: [
      { type: "FOUNDATION_PLINTH_BRICKWORK", title: "Foundation & Plinth Brickwork", description: "Foundation and plinth masonry quantities.", route: "foundation-plinth-brickwork" },
      { type: "BRICKWORK", title: "Brickwork", description: "Superstructure brickwork quantities and deductions.", route: "brickwork" },
      { type: "DPC", title: "DPC", description: "Damp-proof course quantities.", route: "dpc" },
    ],
  },
  {
    title: "Openings",
    description: "Building opening quantities.",
    modules: [
      { type: "DOORS", title: "Doors", description: "Door opening quantities.", route: "doors" },
      { type: "WINDOWS", title: "Windows", description: "Window opening quantities.", route: "windows" },
      { type: "VENTILATORS", title: "Ventilators", description: "Ventilator opening quantities.", route: "ventilators" },
      { type: "LINTEL", title: "Lintels", description: "Lintel concrete, reinforcement and shuttering.", route: "lintel" },
      { type: "LINTEL_REINFORCEMENT", title: "Lintel Reinforcement", description: "Lintel reinforcement quantities.", route: "lintel-reinforcement" },
      { type: "LINTEL_SHUTTERING", title: "Lintel Shuttering", description: "Lintel shuttering quantities.", route: "lintel-shuttering" },
    ],
  },
  {
    title: "Plaster & Finishing",
    description: "Plastering, flooring and finishing calculations.",
    modules: [
      { type: "INTERNAL_PLASTER", title: "Internal Plaster", description: "Internal plaster quantities and deductions.", route: "internal-plaster" },
      { type: "EXTERNAL_PLASTER", title: "External Plaster", description: "External plaster quantities.", route: "external-plaster" },
      { type: "FLOORING", title: "Flooring", description: "Flooring area quantities.", route: "flooring" },
      { type: "FLOORING_MATERIALS", title: "Flooring Materials", description: "Tiles, cement and sand requirements.", route: "flooring-materials" },
      { type: "PAINTING", title: "Painting", description: "Painting area quantities.", route: "painting" },
    ],
  },
  {
    title: "Other Works",
    description: "Additional construction quantity calculations.",
    modules: [
      { type: "FILLING", title: "Filling", description: "Filling quantities.", route: "filling" },
    ],
  },
];

export default async function ProjectCalculationsPage({ params }: Props) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { calculations: { select: { type: true, calculatedAt: true, updatedAt: true } } },
  });
  if (!project) notFound();

  const saved = new Map(project.calculations.map((item) => [item.type, item]));

  return (
    <div className="space-y-10">
      <div>
        <Link href={`/engineer/projects/${project.id}`} className="text-sm text-zinc-400 transition hover:text-white">← Back to Project</Link>
        <div className="mt-6">
          <p className="text-sm text-zinc-500">{project.projectName}</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Calculations</h1>
          <p className="mt-2 text-sm text-zinc-400">Project-specific quantity calculations. Changes are saved automatically.</p>
        </div>
      </div>

      {categories.map((category) => (
        <section key={category.title}>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">{category.title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{category.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {category.modules.map((module) => {
              const calculation = saved.get(module.type);
              return (
                <Link
                  key={module.type}
                  href={`/engineer/projects/${project.id}/calculations/${module.route}`}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-600 hover:bg-zinc-850"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-medium text-white">{module.title}</h3>
                    {calculation && <span className="shrink-0 rounded-full border border-emerald-900/60 bg-emerald-950/30 px-2.5 py-1 text-xs text-emerald-400">Saved</span>}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{module.description}</p>
                  <p className="mt-5 text-sm font-medium text-zinc-400">Open calculation →</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

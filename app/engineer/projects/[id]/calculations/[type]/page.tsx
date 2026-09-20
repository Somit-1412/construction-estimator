import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import BeamConcreteSection from "@/components/BeamConcreteSection";
import BrickworkSection from "@/components/BrickworkSection";
import CalculationPersistence, {
  type CalculationInputs,
} from "@/components/CalculationPersistence";
import ColumnConcreteSection from "@/components/ColumnConcreteSection";
import DoorsSection from "@/components/DoorsSection";
import DPCSection from "@/components/DPCSection";
import ExcavationSection from "@/components/ExcavationSection";
import ExternalPlasterSection from "@/components/ExternalPlasterSection";
import FillingSection from "@/components/FillingSection";
import FlooringSection from "@/components/FlooringSection";
import FootingReinforcementSection from "@/components/FootingReinforcementSection";
import FootingSection from "@/components/FootingSection";
import FootingShutteringSection from "@/components/FootingShutteringSection";
import FoundationBrickworkSection from "@/components/FoundationBrickworkSection";
import InternalPlasterSection from "@/components/InternalPlasterSection";
import LintelConcreteSection from "@/components/LintelConcreteSection";
import LintelReinforcementSection from "@/components/LintelReinforcementSection";
import LintelShutteringSection from "@/components/LintelShutteringSection";
import PaintingSection from "@/components/PaintingSection";
import PCCSection from "@/components/PCCSection";
import SlabReinforcementSection from "@/components/SlabReinforcementSection";
import SlabSection from "@/components/SlabSection";
import SlabShutteringSection from "@/components/SlabShutteringSection";
import VentilatorsSection from "@/components/VentilatorsSection";
import WindowsSection from "@/components/WindowsSection";
import { CalculationType } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string; type: string }> };

type ModuleDefinition = {
  title: string;
  description: string;
  render: () => ReactNode;
};


const slugToType: Record<string, CalculationType> = {
  excavation: "EXCAVATION", pcc: "PCC", footing: "FOOTING",
  "footing-reinforcement": "FOOTING_REINFORCEMENT", "footing-shuttering": "FOOTING_SHUTTERING",
  "column-concrete": "COLUMN_CONCRETE", "column-shuttering": "COLUMN_SHUTTERING",
  "beam-concrete": "BEAM_CONCRETE", "beam-reinforcement": "BEAM_REINFORCEMENT", "beam-bbs": "BEAM_BBS", "beam-shuttering": "BEAM_SHUTTERING",
  "slab-concrete": "SLAB_CONCRETE", "slab-reinforcement": "SLAB_REINFORCEMENT", "slab-shuttering": "SLAB_SHUTTERING",
  brickwork: "BRICKWORK", "foundation-plinth-brickwork": "FOUNDATION_PLINTH_BRICKWORK", dpc: "DPC",
  lintel: "LINTEL", "lintel-reinforcement": "LINTEL_REINFORCEMENT", "lintel-shuttering": "LINTEL_SHUTTERING",
  doors: "DOORS", windows: "WINDOWS", ventilators: "VENTILATORS",
  "internal-plaster": "INTERNAL_PLASTER", "external-plaster": "EXTERNAL_PLASTER",
  flooring: "FLOORING", "flooring-materials": "FLOORING_MATERIALS", painting: "PAINTING", filling: "FILLING",
};

const definitions: Record<CalculationType, ModuleDefinition> = {
  EXCAVATION: { title: "Excavation", description: "Project-specific excavation quantity calculation.", render: () => <ExcavationSection /> },
  PCC: { title: "PCC", description: "Project-specific plain cement concrete calculation.", render: () => <PCCSection /> },
  FOOTING: { title: "Footings", description: "Project-specific footing concrete, reinforcement and shuttering.", render: () => <div className="space-y-6"><FootingSection /><FootingReinforcementSection /><FootingShutteringSection /></div> },
  FOOTING_REINFORCEMENT: { title: "Footing Reinforcement", description: "Project-specific footing reinforcement calculation.", render: () => <FootingReinforcementSection /> },
  FOOTING_SHUTTERING: { title: "Footing Shuttering", description: "Project-specific footing shuttering calculation.", render: () => <FootingShutteringSection /> },
  COLUMN_CONCRETE: { title: "Columns", description: "Project-specific column concrete and shuttering calculation.", render: () => <ColumnConcreteSection /> },
  COLUMN_SHUTTERING: { title: "Column Shuttering", description: "Project-specific column shuttering calculation.", render: () => <ColumnConcreteSection /> },
  BEAM_CONCRETE: { title: "Beams", description: "Project-specific beam concrete, reinforcement and shuttering.", render: () => <BeamConcreteSection /> },
  BEAM_REINFORCEMENT: { title: "Beam Reinforcement", description: "Project-specific beam reinforcement calculation.", render: () => <BeamConcreteSection /> },
  BEAM_BBS: { title: "Beam BBS", description: "Project-specific beam bar bending schedule inputs and quantities.", render: () => <BeamConcreteSection /> },
  BEAM_SHUTTERING: { title: "Beam Shuttering", description: "Project-specific beam shuttering calculation.", render: () => <BeamConcreteSection /> },
  SLAB_CONCRETE: { title: "Slabs", description: "Project-specific slab concrete calculation.", render: () => <SlabSection /> },
  SLAB_REINFORCEMENT: { title: "Slab Reinforcement", description: "Project-specific slab reinforcement calculation.", render: () => <SlabReinforcementSection /> },
  SLAB_SHUTTERING: { title: "Slab Shuttering", description: "Project-specific slab shuttering calculation.", render: () => <SlabShutteringSection /> },
  BRICKWORK: { title: "Brickwork", description: "Project-specific superstructure brickwork calculation.", render: () => <BrickworkSection /> },
  FOUNDATION_PLINTH_BRICKWORK: { title: "Foundation & Plinth Brickwork", description: "Project-specific foundation and plinth masonry calculation.", render: () => <FoundationBrickworkSection /> },
  DPC: { title: "DPC", description: "Project-specific damp-proof course calculation.", render: () => <DPCSection /> },
  LINTEL: { title: "Lintels", description: "Project-specific lintel concrete, reinforcement and shuttering.", render: () => <div className="space-y-6"><LintelConcreteSection /><LintelReinforcementSection /><LintelShutteringSection /></div> },
  LINTEL_REINFORCEMENT: { title: "Lintel Reinforcement", description: "Project-specific lintel reinforcement calculation.", render: () => <LintelReinforcementSection /> },
  LINTEL_SHUTTERING: { title: "Lintel Shuttering", description: "Project-specific lintel shuttering calculation.", render: () => <LintelShutteringSection /> },
  DOORS: { title: "Doors", description: "Project-specific door opening calculation.", render: () => <DoorsSection /> },
  WINDOWS: { title: "Windows", description: "Project-specific window opening calculation.", render: () => <WindowsSection /> },
  VENTILATORS: { title: "Ventilators", description: "Project-specific ventilator opening calculation.", render: () => <VentilatorsSection /> },
  INTERNAL_PLASTER: { title: "Internal Plaster", description: "Project-specific internal plaster calculation.", render: () => <InternalPlasterSection /> },
  EXTERNAL_PLASTER: { title: "External Plaster", description: "Project-specific external plaster calculation.", render: () => <ExternalPlasterSection /> },
  FLOORING: { title: "Flooring", description: "Project-specific flooring area and material calculation.", render: () => <FlooringSection /> },
  FLOORING_MATERIALS: { title: "Flooring Materials", description: "Project-specific tile, cement and sand calculation.", render: () => <FlooringSection /> },
  PAINTING: { title: "Painting", description: "Project-specific painting area calculation.", render: () => <PaintingSection /> },
  FILLING: { title: "Filling", description: "Project-specific filling quantity calculation.", render: () => <FillingSection /> },
};

export default async function ProjectCalculationPage({ params }: PageProps) {
  const { id, type } = await params;
  const calculationType = slugToType[type];
  if (!calculationType) notFound();
  const definition = definitions[calculationType];

  const project = await prisma.project.findUnique({ where: { id }, select: { id: true, projectName: true } });
  if (!project) notFound();

  const calculation = await prisma.calculation.findUnique({
    where: { projectId_type: { projectId: project.id, type: calculationType } },
    select: { inputs: true, calculatedAt: true },
  });

  const initialInputs = calculation?.inputs && typeof calculation.inputs === "object"
    ? (calculation.inputs as CalculationInputs)
    : {};

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/engineer/projects/${project.id}/calculations`} className="text-sm text-zinc-400 transition hover:text-white">← Back to Calculations</Link>
        <div className="mt-5">
          <p className="text-sm text-zinc-500">{project.projectName}</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">{definition.title}</h1>
          <p className="mt-2 text-sm text-zinc-400">{definition.description}</p>
          {calculation?.calculatedAt && <p className="mt-2 text-xs text-emerald-400">Saved {calculation.calculatedAt.toLocaleString()}</p>}
        </div>
      </div>

      <CalculationPersistence projectId={project.id} type={calculationType} initialInputs={initialInputs}>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">{definition.render()}</div>
      </CalculationPersistence>
    </div>
  );
}

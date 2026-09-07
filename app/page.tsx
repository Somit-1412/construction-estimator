import BeamConcreteSection from "@/components/BeamConcreteSection";
import BrickworkSection from "@/components/BrickworkSection";
import ColumnConcreteSection from "@/components/ColumnConcreteSection";
import DPCSection from "@/components/DPCSection";
import ExcavationSection from "@/components/ExcavationSection";
import ExternalPlasterSection from "@/components/ExternalPlasterSection";
import InternalPlasterSection from "@/components/InternalPlasterSection";
import PCCSection from "@/components/PCCSection";
import SlabSection from "@/components/SlabSection";

export default function Home() {
  return (
    <main>
      <ExcavationSection />
      <ColumnConcreteSection />
      <PCCSection />
      <BeamConcreteSection />
      <BrickworkSection />
      <DPCSection />
      <InternalPlasterSection />
      <ExternalPlasterSection />
      <SlabSection />
    </main>
  );
}
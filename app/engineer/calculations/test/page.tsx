import BeamConcreteSection from "@/components/BeamConcreteSection";
import BrickworkSection from "@/components/BrickworkSection";
import ColumnConcreteSection from "@/components/ColumnConcreteSection";
import DPCSection from "@/components/DPCSection";
import ExcavationSection from "@/components/ExcavationSection";
import ExternalPlasterSection from "@/components/ExternalPlasterSection";
import FootingReinforcementSection from "@/components/FootingReinforcementSection";
import FootingSection from "@/components/FootingSection";
import FootingShutteringSection from "@/components/FootingShutteringSection";
import InternalPlasterSection from "@/components/InternalPlasterSection";
import PCCSection from "@/components/PCCSection";
import SlabSection from "@/components/SlabSection";

export default function TestCalculationsPage() {
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
      <FootingSection />
      <FootingReinforcementSection />
      <FootingShutteringSection />
    </main>
  );
}
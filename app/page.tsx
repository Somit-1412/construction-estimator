import BeamConcreteSection from "@/components/BeamConcreteSection";
import BrickworkSection from "@/components/BrickworkSection";
import ColumnConcreteSection from "@/components/ColumnConcreteSection";
import ExcavationSection from "@/components/ExcavationSection";
import PCCSection from "@/components/PCCSection";

export default function Home() {
  return (
    <main>
      <ExcavationSection />
      <ColumnConcreteSection />
      <PCCSection />
      <BeamConcreteSection />
      <BrickworkSection />
    </main>
  );
}
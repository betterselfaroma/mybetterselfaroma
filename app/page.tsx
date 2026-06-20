import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SafetyStrip from "@/components/SafetyStrip";
import WhyNotOrdinary from "@/components/WhyNotOrdinary";
import AromaLibrary from "@/components/AromaLibrary";
import Packages from "@/components/Packages";
import UpgradeBar from "@/components/UpgradeBar";
import Process from "@/components/Process";
import Ritual from "@/components/Ritual";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SafetyStrip />
        <WhyNotOrdinary />
        <AromaLibrary />
        <Packages />
        <UpgradeBar />
        <Process />
        <Ritual />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SafetyStrip from "@/components/SafetyStrip";
import WhatYouSee from "@/components/WhatYouSee";
import Process from "@/components/Process";
import Packages from "@/components/Packages";
import UpgradeBar from "@/components/UpgradeBar";
import LowerThreeCards from "@/components/LowerThreeCards";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <SafetyStrip />
        <WhatYouSee />
        <Process />
        <Packages />
        <UpgradeBar />
        <LowerThreeCards />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

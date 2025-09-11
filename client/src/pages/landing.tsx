import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import DashboardTabs from "@/components/dashboard-tabs";
import CtaSection from "@/components/cta-section";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DashboardTabs />
      <CtaSection />
      <Footer />
    </div>
  );
}

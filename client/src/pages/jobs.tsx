import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import JobsSection from "@/components/jobs-section";

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-background" data-testid="jobs-page">
      <Navbar />
      <JobsSection />
      <Footer />
    </div>
  );
}
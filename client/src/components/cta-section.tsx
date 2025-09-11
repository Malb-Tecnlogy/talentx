import { Button } from "@/components/ui/button";
import { Rocket, Calendar } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-accent" data-testid="cta-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-primary-foreground mb-6" data-testid="text-cta-title">
          Ready to Transform Your Team?
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto" data-testid="text-cta-description">
          Join thousands of companies already building exceptional products with Latin American talent through TalentX.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-background text-foreground px-8 py-4 text-lg font-semibold hover:bg-background/90 transition-all shadow-lg"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-start-hiring"
          >
            <Rocket className="mr-2" size={20} />
            Start Hiring
          </Button>
          <Button 
            variant="outline"
            className="border border-primary-foreground/20 text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary-foreground/10 transition-all bg-transparent"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-schedule-demo"
          >
            <Calendar className="mr-2" size={20} />
            Schedule Demo
          </Button>
        </div>
      </div>
    </section>
  );
}

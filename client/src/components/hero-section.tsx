import { Button } from "@/components/ui/button";
import { Search, Briefcase } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20" data-testid="hero-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-foreground leading-tight" data-testid="text-hero-title">
                Connect with Top-Tier <span className="text-primary">Latin American</span> Tech Talent
              </h1>
              <p className="text-xl text-muted-foreground mt-6" data-testid="text-hero-description">
                TalentX bridges the gap between global companies and exceptional tech professionals from Latin America. Build your dream team with our AI-powered matching platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-primary text-primary-foreground px-8 py-4 text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-find-talent"
              >
                <Search className="mr-2" size={20} />
                Find Talent
              </Button>
              <Button 
                variant="outline" 
                className="border border-border text-foreground px-8 py-4 text-lg font-semibold hover:bg-muted transition-all"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-find-work"
              >
                <Briefcase className="mr-2" size={20} />
                Find Work
              </Button>
            </div>
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground" data-testid="text-stat-professionals">5,000+</div>
                <div className="text-sm text-muted-foreground">Verified Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground" data-testid="text-stat-companies">500+</div>
                <div className="text-sm text-muted-foreground">Global Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground" data-testid="text-stat-success-rate">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
          <div className="lg:pl-12">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Diverse team of Latin American tech professionals collaborating" 
              className="rounded-2xl shadow-2xl w-full h-auto" 
              data-testid="img-hero"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

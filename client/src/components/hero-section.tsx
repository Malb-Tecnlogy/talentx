import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section 
      className="relative min-h-[600px] bg-cover bg-center bg-no-repeat flex items-center" 
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800')`
      }}
      data-testid="hero-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight" data-testid="text-hero-title">
            Conectando talentos <br />
            às melhores <span className="text-blue-400">oportunidades</span>
          </h1>
          <p className="text-lg text-blue-300 font-medium" data-testid="text-hero-hashtag">
            #0066CC
          </p>
          <div className="pt-4">
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-comece-agora"
            >
              Comece Agora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

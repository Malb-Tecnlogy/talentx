import { Button } from "@/components/ui/button";
import logoImage from "@assets/logo_1757610303323.png";

export default function Navbar() {
  return (
    <nav className="bg-slate-800 sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="TalentX Logo" 
                className="h-8 w-auto"
                data-testid="logo"
              />
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#" className="text-white/80 hover:text-white transition-colors" data-testid="link-home">Home</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors" data-testid="link-empresas">Empresas</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors" data-testid="link-candidatos">Candidatos</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors" data-testid="link-sobre">Sobre</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-contato"
            >
              Contato
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

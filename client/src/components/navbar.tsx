import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Rocket className="text-primary-foreground" size={16} />
              </div>
              <span className="text-xl font-bold text-foreground" data-testid="text-brand">TalentX</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-find-talent">Find Talent</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-find-work">Find Work</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">About</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-enterprise">Enterprise</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Log In
            </Button>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-signup"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

import { Rocket } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Rocket className="text-primary-foreground" size={16} />
              </div>
              <span className="text-xl font-bold text-card-foreground" data-testid="text-footer-brand">TalentX</span>
            </div>
            <p className="text-muted-foreground" data-testid="text-footer-description">
              Connecting global companies with exceptional Latin American tech talent.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">For Companies</h4>
            <div className="space-y-2 text-muted-foreground">
              <p><a href="#" className="hover:text-foreground transition-colors" data-testid="link-find-talent">Find Talent</a></p>
              <p><a href="#" className="hover:text-foreground transition-colors" data-testid="link-enterprise">Enterprise Solutions</a></p>
              <p><a href="#" className="hover:text-foreground transition-colors" data-testid="link-success-stories">Success Stories</a></p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">For Professionals</h4>
            <div className="space-y-2 text-muted-foreground">
              <p><a href="#" className="hover:text-foreground transition-colors" data-testid="link-find-work">Find Work</a></p>
              <p><a href="#" className="hover:text-foreground transition-colors" data-testid="link-build-profile">Build Profile</a></p>
              <p><a href="#" className="hover:text-foreground transition-colors" data-testid="link-resources">Resources</a></p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Company</h4>
            <div className="space-y-2 text-muted-foreground">
              <p><a href="#" className="hover:text-foreground transition-colors" data-testid="link-about">About</a></p>
              <p><a href="#" className="hover:text-foreground transition-colors" data-testid="link-privacy">Privacy Policy</a></p>
              <p><a href="#" className="hover:text-foreground transition-colors" data-testid="link-terms">Terms of Service</a></p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p data-testid="text-copyright">
            &copy; 2024 TalentX. All rights reserved. LGPD/GDPR compliant.
          </p>
        </div>
      </div>
    </footer>
  );
}

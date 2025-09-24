import { Rocket } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Rocket className="text-primary-foreground" size={16} />
              </div>
              <span className="text-xl font-bold text-card-foreground" data-testid="text-footer-brand">MaGenX</span>
            </div>
            <p className="text-muted-foreground" data-testid="text-footer-description">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">{t('footer.forCompanies')}</h4>
            <div className="space-y-2 text-muted-foreground">
              <p><a href="/company" className="hover:text-foreground transition-colors" data-testid="link-find-talent">{t('footer.findTalent')}</a></p>
              <p><a href="/company" className="hover:text-foreground transition-colors" data-testid="link-enterprise">{t('footer.enterprise')}</a></p>
              <p><a href="/company" className="hover:text-foreground transition-colors" data-testid="link-success-stories">{t('footer.successStories')}</a></p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">{t('footer.forProfessionals')}</h4>
            <div className="space-y-2 text-muted-foreground">
              <p><a href="/professional" className="hover:text-foreground transition-colors" data-testid="link-find-work">{t('footer.findWork')}</a></p>
              <p><a href="/professional" className="hover:text-foreground transition-colors" data-testid="link-build-profile">{t('footer.buildProfile')}</a></p>
              <p><a href="/professional" className="hover:text-foreground transition-colors" data-testid="link-resources">{t('footer.resources')}</a></p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">{t('footer.company')}</h4>
            <div className="space-y-2 text-muted-foreground">
              <p><a href="/about" className="hover:text-foreground transition-colors" data-testid="link-about">{t('nav.about')}</a></p>
              <p><a href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">{t('footer.privacy')}</a></p>
              <p><a href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">{t('footer.terms')}</a></p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p data-testid="text-copyright">
            &copy; 2024 MaGenX. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}

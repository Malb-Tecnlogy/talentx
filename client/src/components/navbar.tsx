import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoImage from "@assets/image (1)_1758753116840.png";
import { useLanguage } from "@/contexts/language-context";
import LanguageSelector from "@/components/language-selector";

export default function Navbar() {
  const { t } = useLanguage();
  
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center space-x-3 md:space-x-8">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity" data-testid="link-logo">
              <img 
                src={logoImage} 
                alt="MaGenX Logo" 
                className="w-[953px] h-[262px] max-w-[140px] max-h-[38px] md:max-w-[210px] md:max-h-[57px] object-contain"
                data-testid="logo"
              />
            </Link>
            <div className="flex space-x-3 md:space-x-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm md:text-base" data-testid="link-about">{t('nav.about')}</Link>
              <Link href="/jobs" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm md:text-base" data-testid="link-jobs">{t('nav.jobs')}</Link>
              <Link href="/find-talent" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm md:text-base" data-testid="link-find-talent">{t('nav.findTalent')}</Link>
              <Link href="/find-work" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm md:text-base" data-testid="link-find-work">{t('nav.findWork')}</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm md:text-base" data-testid="link-contact">{t('nav.contact')}</Link>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <LanguageSelector />
            <Button 
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium text-sm md:text-base px-2 md:px-4"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-login"
            >
              {t('nav.login')}
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-6 py-2 rounded-full font-medium text-sm md:text-base"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-signup"
            >
              {t('nav.signup')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

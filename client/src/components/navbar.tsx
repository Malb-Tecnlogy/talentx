import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import logoImage from "@assets/image (1)_1758753116840.png";
import { useLanguage } from "@/contexts/language-context";
import LanguageSelector from "@/components/language-selector";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity" data-testid="link-logo">
            <img 
              src={logoImage} 
              alt="MaGenX Logo" 
              className="w-[953px] h-[262px] max-w-[140px] max-h-[38px] md:max-w-[180px] md:max-h-[49px] object-contain"
              data-testid="logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium" data-testid="link-about">{t('nav.about')}</Link>
            <Link href="/jobs" className="text-gray-600 hover:text-gray-900 transition-colors font-medium" data-testid="link-jobs">{t('nav.jobs')}</Link>
            <Link href="/find-talent" className="text-gray-600 hover:text-gray-900 transition-colors font-medium" data-testid="link-find-talent">{t('nav.findTalent')}</Link>
            <Link href="/find-work" className="text-gray-600 hover:text-gray-900 transition-colors font-medium" data-testid="link-find-work">{t('nav.findWork')}</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium" data-testid="link-contact">{t('nav.contact')}</Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSelector />
            <Button 
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-login"
            >
              {t('nav.login')}
            </Button>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-signup"
            >
              {t('nav.signup')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <LanguageSelector />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col space-y-6 mt-8">
                  <Link 
                    href="/about" 
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors" 
                    onClick={() => setIsOpen(false)}
                    data-testid="link-mobile-about"
                  >
                    {t('nav.about')}
                  </Link>
                  <Link 
                    href="/jobs" 
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors" 
                    onClick={() => setIsOpen(false)}
                    data-testid="link-mobile-jobs"
                  >
                    {t('nav.jobs')}
                  </Link>
                  <Link 
                    href="/find-talent" 
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors" 
                    onClick={() => setIsOpen(false)}
                    data-testid="link-mobile-find-talent"
                  >
                    {t('nav.findTalent')}
                  </Link>
                  <Link 
                    href="/find-work" 
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors" 
                    onClick={() => setIsOpen(false)}
                    data-testid="link-mobile-find-work"
                  >
                    {t('nav.findWork')}
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors" 
                    onClick={() => setIsOpen(false)}
                    data-testid="link-mobile-contact"
                  >
                    {t('nav.contact')}
                  </Link>
                  <div className="border-t pt-6 space-y-4">
                    <Button 
                      variant="outline"
                      className="w-full font-medium"
                      onClick={() => {
                        setIsOpen(false);
                        window.location.href = "/auth";
                      }}
                      data-testid="button-mobile-login"
                    >
                      {t('nav.login')}
                    </Button>
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
                      onClick={() => {
                        setIsOpen(false);
                        window.location.href = "/auth";
                      }}
                      data-testid="button-mobile-signup"
                    >
                      {t('nav.signup')}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

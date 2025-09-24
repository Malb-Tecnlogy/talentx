import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'pt-br';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Navbar
  'nav.about': { en: 'About', 'pt-br': 'Sobre' },
  'nav.jobs': { en: 'Jobs', 'pt-br': 'Vagas' },
  'nav.findTalent': { en: 'Find Talent', 'pt-br': 'Encontrar Talentos' },
  'nav.findWork': { en: 'Find Work', 'pt-br': 'Encontrar Trabalho' },
  'nav.login': { en: 'Log In', 'pt-br': 'Entrar' },
  'nav.signup': { en: 'Sign Up', 'pt-br': 'Cadastrar' },
  
  // Home page
  'home.title': { en: 'Connect with Top Latin American Tech Talent', 'pt-br': 'Conecte-se com os Melhores Talentos de TI da América Latina' },
  'home.subtitle': { en: 'Access vetted professionals from Brazil and Latin America, offering timezone advantages, cultural alignment, and exceptional skills for your next project.', 'pt-br': 'Acesse profissionais qualificados do Brasil e América Latina, oferecendo vantagens de fuso horário, alinhamento cultural e habilidades excepcionais para seu próximo projeto.' },
  'home.getStarted': { en: 'Get Started', 'pt-br': 'Começar' },
  'home.learnMore': { en: 'Learn More', 'pt-br': 'Saiba Mais' },
  
  // Brazil advantages section
  'advantages.title': { en: 'Why Choose Brazilian Talent?', 'pt-br': 'Por que Escolher Talentos Brasileiros?' },
  'advantages.subtitle': { en: 'Brazil offers unique advantages that give you a real competitive edge', 'pt-br': 'O Brasil oferece vantagens únicas que lhe dão uma verdadeira vantagem competitiva' },
  'advantages.timezone.title': { en: 'Timezone Advantage', 'pt-br': 'Vantagem de Fuso Horário' },
  'advantages.timezone.desc': { en: 'Near-shore to the US, enabling real-time collaboration and seamless communication during business hours.', 'pt-br': 'Próximo aos EUA, permitindo colaboração em tempo real e comunicação fluida durante o horário comercial.' },
  'advantages.cultural.title': { en: 'Cultural Fit', 'pt-br': 'Adequação Cultural' },
  'advantages.cultural.desc': { en: 'Greater alignment with Western business practices, making integration smoother and more effective.', 'pt-br': 'Maior alinhamento com práticas comerciais ocidentais, tornando a integração mais suave e eficaz.' },
  'advantages.reliability.title': { en: 'Reliability', 'pt-br': 'Confiabilidade' },
  'advantages.reliability.desc': { en: 'Faster response times and seamless communication ensure your projects stay on track.', 'pt-br': 'Tempos de resposta mais rápidos e comunicação fluida garantem que seus projetos permaneçam no caminho certo.' },
  'advantages.talent.title': { en: 'Skilled Talent', 'pt-br': 'Talentos Qualificados' },
  'advantages.talent.desc': { en: 'Access to highly qualified professionals with world-class technical expertise and innovation mindset.', 'pt-br': 'Acesso a profissionais altamente qualificados com expertise técnica de classe mundial e mentalidade inovadora.' },
  'advantages.compliance.title': { en: 'Compliance', 'pt-br': 'Conformidade' },
  'advantages.compliance.desc': { en: 'Stronger adaptation to US and international regulations, ensuring smooth business operations.', 'pt-br': 'Maior adaptação a regulamentações americanas e internacionais, garantindo operações comerciais suaves.' },
  'advantages.conclusion': { en: 'With Brazil, you get talent + time alignment + trust — a real competitive edge.', 'pt-br': 'Com o Brasil, você obtém talento + alinhamento de tempo + confiança — uma verdadeira vantagem competitiva.' },
  
  // Auth page
  'auth.login.title': { en: 'Welcome back', 'pt-br': 'Bem-vindo de volta' },
  'auth.login.subtitle': { en: 'Login to MaGenX', 'pt-br': 'Entrar no MaGenX' },
  'auth.register.title': { en: 'Create account', 'pt-br': 'Criar conta' },
  'auth.register.subtitle': { en: 'Join MaGenX to connect with opportunities', 'pt-br': 'Junte-se ao MaGenX para se conectar com oportunidades' },
  'auth.welcome.title': { en: 'Welcome to MaGenX', 'pt-br': 'Bem-vindo ao MaGenX' },
  'auth.welcome.subtitle': { en: 'The premier platform connecting global companies with top Latin American tech talent.', 'pt-br': 'A plataforma líder conectando empresas globais com os melhores talentos de TI da América Latina.' },
  
  // About page
  'about.title': { en: 'About MaGenX', 'pt-br': 'Sobre o MaGenX' },
  'about.subtitle': { en: 'Connecting Global Companies with Latin American Tech Excellence', 'pt-br': 'Conectando Empresas Globais com a Excelência em TI da América Latina' },
  
  // Footer
  'footer.description': { en: 'MaGenX connects companies with top Latin American tech talent, offering timezone advantages and cultural alignment.', 'pt-br': 'MaGenX conecta empresas com os melhores talentos de TI da América Latina, oferecendo vantagens de fuso horário e alinhamento cultural.' },
  'footer.company': { en: 'Company', 'pt-br': 'Empresa' },
  'footer.support': { en: 'Support', 'pt-br': 'Suporte' },
  'footer.legal': { en: 'Legal', 'pt-br': 'Legal' },
  'footer.privacy': { en: 'Privacy Policy', 'pt-br': 'Política de Privacidade' },
  'footer.terms': { en: 'Terms of Service', 'pt-br': 'Termos de Serviço' },
  'footer.contact': { en: 'Contact', 'pt-br': 'Contato' },
  'footer.help': { en: 'Help Center', 'pt-br': 'Central de Ajuda' },
  'footer.rights': { en: 'All rights reserved.', 'pt-br': 'Todos os direitos reservados.' },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt-br')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
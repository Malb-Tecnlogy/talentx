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
  
  // Features section
  'features.title': { en: 'Why Choose MaGenX?', 'pt-br': 'Por que Escolher MaGenX?' },
  'features.description': { en: 'Our platform revolutionizes nearshore outsourcing with cutting-edge technology and human expertise.', 'pt-br': 'Nossa plataforma revoluciona o outsourcing nearshore com tecnologia de ponta e expertise humana.' },
  'features.ai.title': { en: 'AI-Powered Matching', 'pt-br': 'Correspondência com IA' },
  'features.ai.desc': { en: 'Advanced algorithms analyze skills, experience, and project requirements to find perfect matches in minutes, not weeks.', 'pt-br': 'Algoritmos avançados analisam habilidades, experiência e requisitos do projeto para encontrar correspondências perfeitas em minutos, não semanas.' },
  'features.verified.title': { en: 'Verified Professionals', 'pt-br': 'Profissionais Verificados' },
  'features.verified.desc': { en: 'Every talent goes through rigorous screening including technical assessments, background checks, and portfolio reviews.', 'pt-br': 'Cada talento passa por uma triagem rigorosa incluindo avaliações técnicas, verificação de antecedentes e análise de portfólio.' },
  'features.communication.title': { en: 'Seamless Communication', 'pt-br': 'Comunicação Perfeita' },
  'features.communication.desc': { en: 'Built-in messaging, video calls, and project management tools keep everyone aligned and productive.', 'pt-br': 'Mensagens integradas, videochamadas e ferramentas de gestão de projetos mantêm todos alinhados e produtivos.' },
  'features.payments.title': { en: 'Secure Payments', 'pt-br': 'Pagamentos Seguros' },
  'features.payments.desc': { en: 'Automated escrow system, milestone-based payments, and compliance with international financial regulations.', 'pt-br': 'Sistema de custódia automatizado, pagamentos baseados em marcos e conformidade com regulamentações financeiras internacionais.' },
  'features.cultural.title': { en: 'Cultural Alignment', 'pt-br': 'Alinhamento Cultural' },
  'features.cultural.desc': { en: 'Latin American professionals in overlapping time zones with strong English proficiency and cultural compatibility.', 'pt-br': 'Profissionais latino-americanos em fusos horários sobrepostos com forte proficiência em inglês e compatibilidade cultural.' },
  'features.compliance.title': { en: 'Full Compliance', 'pt-br': 'Conformidade Total' },
  'features.compliance.desc': { en: 'LGPD/GDPR compliant data handling, employment law adherence, and comprehensive contract management.', 'pt-br': 'Tratamento de dados conforme LGPD/GDPR, aderência à legislação trabalhista e gestão abrangente de contratos.' },

  // CTA section
  'cta.title': { en: 'Ready to Transform Your Team?', 'pt-br': 'Pronto para Transformar Sua Equipe?' },
  'cta.description': { en: 'Join thousands of companies already building exceptional products with Latin American talent through MaGenX.', 'pt-br': 'Junte-se a milhares de empresas que já estão construindo produtos excepcionais com talentos latino-americanos através do MaGenX.' },
  'cta.startHiring': { en: 'Start Hiring', 'pt-br': 'Começar a Contratar' },
  'cta.scheduleDemo': { en: 'Schedule Demo', 'pt-br': 'Agendar Demo' },

  // Jobs section
  'jobs.title': { en: 'Latest Job Opportunities', 'pt-br': 'Últimas Oportunidades de Trabalho' },
  'jobs.description': { en: 'Explore exciting opportunities with top companies looking for Latin American tech talent.', 'pt-br': 'Explore oportunidades empolgantes com empresas de primeira linha procurando talentos de TI latino-americanos.' },
  'jobs.searchPlaceholder': { en: 'Search jobs by title, skills, or company...', 'pt-br': 'Pesquisar vagas por título, habilidades ou empresa...' },
  'jobs.allTypes': { en: 'All Types', 'pt-br': 'Todos os Tipos' },
  'jobs.fullTime': { en: 'Full Time', 'pt-br': 'Tempo Integral' },
  'jobs.partTime': { en: 'Part Time', 'pt-br': 'Meio Período' },
  'jobs.contract': { en: 'Contract', 'pt-br': 'Contrato' },
  'jobs.remote': { en: 'Remote', 'pt-br': 'Remoto' },
  'jobs.location': { en: 'Location', 'pt-br': 'Localização' },
  'jobs.experience': { en: 'Experience', 'pt-br': 'Experiência' },
  'jobs.salary': { en: 'Salary', 'pt-br': 'Salário' },
  'jobs.apply': { en: 'Apply Now', 'pt-br': 'Candidatar-se Agora' },
  'jobs.viewAll': { en: 'View All Jobs', 'pt-br': 'Ver Todas as Vagas' },
  'jobs.noResults': { en: 'No jobs found matching your criteria.', 'pt-br': 'Nenhuma vaga encontrada que corresponda aos seus critérios.' },
  'jobs.loading': { en: 'Loading jobs...', 'pt-br': 'Carregando vagas...' },

  // Footer section
  'footer.description': { en: 'Connecting global companies with exceptional Latin American tech talent.', 'pt-br': 'Conectando empresas globais com talentos excepcionais de TI da América Latina.' },
  'footer.forCompanies': { en: 'For Companies', 'pt-br': 'Para Empresas' },
  'footer.findTalent': { en: 'Find Talent', 'pt-br': 'Encontrar Talentos' },
  'footer.enterprise': { en: 'Enterprise Solutions', 'pt-br': 'Soluções Empresariais' },
  'footer.successStories': { en: 'Success Stories', 'pt-br': 'Histórias de Sucesso' },
  'footer.forProfessionals': { en: 'For Professionals', 'pt-br': 'Para Profissionais' },
  'footer.findWork': { en: 'Find Work', 'pt-br': 'Encontrar Trabalho' },
  'footer.buildProfile': { en: 'Build Profile', 'pt-br': 'Criar Perfil' },
  'footer.resources': { en: 'Resources', 'pt-br': 'Recursos' },
  'footer.company': { en: 'Company', 'pt-br': 'Empresa' },
  'footer.privacy': { en: 'Privacy Policy', 'pt-br': 'Política de Privacidade' },
  'footer.terms': { en: 'Terms of Service', 'pt-br': 'Termos de Serviço' },
  'footer.copyright': { en: 'All rights reserved. LGPD/GDPR compliant.', 'pt-br': 'Todos os direitos reservados. Conforme LGPD/GDPR.' },
  
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
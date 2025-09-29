import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'pt-br' | 'es';

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
  'nav.about': { en: 'About', 'pt-br': 'Sobre', es: 'Acerca de' },
  'nav.jobs': { en: 'Jobs', 'pt-br': 'Vagas', es: 'Empleos' },
  'nav.findTalent': { en: 'Find Talent', 'pt-br': 'Encontrar Talentos', es: 'Encontrar Talento' },
  'nav.findWork': { en: 'Find Work', 'pt-br': 'Encontrar Trabalho', es: 'Encontrar Trabajo' },
  'nav.login': { en: 'Log In', 'pt-br': 'Entrar', es: 'Iniciar Sesión' },
  'nav.signup': { en: 'Sign Up', 'pt-br': 'Cadastrar', es: 'Registrarse' },
  
  // Home page
  'home.title': { en: 'Connect with Top Latin American Tech Talent', 'pt-br': 'Conecte-se com os Melhores Talentos de TI da América Latina', es: 'Conecta con el Mejor Talento Tecnológico de Latinoamérica' },
  'home.subtitle': { en: 'Access vetted professionals from Brazil and Latin America, offering timezone advantages, cultural alignment, and exceptional skills for your next project.', 'pt-br': 'Acesse profissionais qualificados do Brasil e América Latina, oferecendo vantagens de fuso horário, alinhamento cultural e habilidades excepcionais para seu próximo projeto.', es: 'Accede a profesionales calificados de Brasil y Latinoamérica, ofreciendo ventajas de zona horaria, alineación cultural y habilidades excepcionales para tu próximo proyecto.' },
  'home.getStarted': { en: 'Get Started', 'pt-br': 'Começar', es: 'Comenzar' },
  'home.learnMore': { en: 'Learn More', 'pt-br': 'Saiba Mais', es: 'Saber Más' },
  
  // Brazil advantages section
  'advantages.title': { en: 'Why Choose Brazilian Talent?', 'pt-br': 'Por que Escolher Talentos Brasileiros?', es: '¿Por qué Elegir Talento Brasileño?' },
  'advantages.subtitle': { en: 'Brazil offers unique advantages that give you a real competitive edge', 'pt-br': 'O Brasil oferece vantagens únicas que lhe dão uma verdadeira vantagem competitiva', es: 'Brasil ofrece ventajas únicas que te dan una verdadera ventaja competitiva' },
  'advantages.timezone.title': { en: 'Timezone Advantage', 'pt-br': 'Vantagem de Fuso Horário', es: 'Ventaja de Zona Horaria' },
  'advantages.timezone.desc': { en: 'Near-shore to the US, enabling real-time collaboration and seamless communication during business hours.', 'pt-br': 'Próximo aos EUA, permitindo colaboração em tempo real e comunicação fluida durante o horário comercial.', es: 'Cerca de EE.UU., permitiendo colaboración en tiempo real y comunicación fluida durante horas laborales.' },
  'advantages.cultural.title': { en: 'Cultural Fit', 'pt-br': 'Adequação Cultural', es: 'Ajuste Cultural' },
  'advantages.cultural.desc': { en: 'Greater alignment with Western business practices, making integration smoother and more effective.', 'pt-br': 'Maior alinhamento com práticas comerciais ocidentais, tornando a integração mais suave e eficaz.', es: 'Mayor alineación con prácticas comerciales occidentales, haciendo la integración más suave y efectiva.' },
  'advantages.reliability.title': { en: 'Reliability', 'pt-br': 'Confiabilidade', es: 'Confiabilidad' },
  'advantages.reliability.desc': { en: 'Faster response times and seamless communication ensure your projects stay on track.', 'pt-br': 'Tempos de resposta mais rápidos e comunicação fluida garantem que seus projetos permaneçam no caminho certo.', es: 'Tiempos de respuesta más rápidos y comunicación fluida aseguran que tus proyectos se mantengan en el camino correcto.' },
  'advantages.talent.title': { en: 'Skilled Talent', 'pt-br': 'Talentos Qualificados', es: 'Talento Calificado' },
  'advantages.talent.desc': { en: 'Access to highly qualified professionals with world-class technical expertise and innovation mindset.', 'pt-br': 'Acesso a profissionais altamente qualificados com expertise técnica de classe mundial e mentalidade inovadora.', es: 'Acceso a profesionales altamente calificados con expertise técnica de clase mundial y mentalidad innovadora.' },
  'advantages.compliance.title': { en: 'Compliance', 'pt-br': 'Conformidade', es: 'Cumplimiento' },
  'advantages.compliance.desc': { en: 'Stronger adaptation to US and international regulations, ensuring smooth business operations.', 'pt-br': 'Maior adaptação a regulamentações americanas e internacionais, garantindo operações comerciais suaves.', es: 'Mayor adaptación a regulaciones estadounidenses e internacionales, asegurando operaciones comerciales fluidas.' },
  'advantages.conclusion': { en: 'With Brazil, you get talent + time alignment + trust — a real competitive edge.', 'pt-br': 'Com o Brasil, você obtém talento + alinhamento de tempo + confiança — uma verdadeira vantagem competitiva.', es: 'Con Brasil, obtienes talento + alineación de tiempo + confianza — una verdadera ventaja competitiva.' },
  
  // Features section
  'features.title': { en: 'Why Choose MaGenX?', 'pt-br': 'Por que Escolher MaGenX?', es: '¿Por qué Elegir MaGenX?' },
  'features.description': { en: 'Our platform revolutionizes nearshore outsourcing with cutting-edge technology and human expertise.', 'pt-br': 'Nossa plataforma revoluciona o outsourcing nearshore com tecnologia de ponta e expertise humana.', es: 'Nuestra plataforma revoluciona el outsourcing nearshore con tecnología de punta y expertise humano.' },
  'features.ai.title': { en: 'AI-Powered Matching', 'pt-br': 'Correspondência com IA', es: 'Matching con IA' },
  'features.ai.desc': { en: 'Advanced algorithms analyze skills, experience, and project requirements to find perfect matches in minutes, not weeks.', 'pt-br': 'Algoritmos avançados analisam habilidades, experiência e requisitos do projeto para encontrar correspondências perfeitas em minutos, não semanas.', es: 'Algoritmos avanzados analizan habilidades, experiencia y requisitos del proyecto para encontrar coincidencias perfectas en minutos, no semanas.' },
  'features.verified.title': { en: 'Verified Professionals', 'pt-br': 'Profissionais Verificados', es: 'Profesionales Verificados' },
  'features.verified.desc': { en: 'Every talent goes through rigorous screening including technical assessments, background checks, and portfolio reviews.', 'pt-br': 'Cada talento passa por uma triagem rigorosa incluindo avaliações técnicas, verificação de antecedentes e análise de portfólio.', es: 'Cada talento pasa por una evaluación rigurosa incluyendo evaluaciones técnicas, verificación de antecedentes y revisión de portafolio.' },
  'features.communication.title': { en: 'Seamless Communication', 'pt-br': 'Comunicação Perfeita', es: 'Comunicación Perfecta' },
  'features.communication.desc': { en: 'Built-in messaging, video calls, and project management tools keep everyone aligned and productive.', 'pt-br': 'Mensagens integradas, videochamadas e ferramentas de gestão de projetos mantêm todos alinhados e produtivos.', es: 'Mensajería integrada, videollamadas y herramientas de gestión de proyectos mantienen a todos alineados y productivos.' },
  'features.payments.title': { en: 'Secure Payments', 'pt-br': 'Pagamentos Seguros', es: 'Pagos Seguros' },
  'features.payments.desc': { en: 'Automated escrow system, milestone-based payments, and compliance with international financial regulations.', 'pt-br': 'Sistema de custódia automatizado, pagamentos baseados em marcos e conformidade com regulamentações financeiras internacionais.', es: 'Sistema de custodia automatizado, pagos basados en hitos y cumplimiento con regulaciones financieras internacionales.' },
  'features.cultural.title': { en: 'Cultural Alignment', 'pt-br': 'Alinhamento Cultural', es: 'Alineación Cultural' },
  'features.cultural.desc': { en: 'Latin American professionals in overlapping time zones with strong English proficiency and cultural compatibility.', 'pt-br': 'Profissionais latino-americanos em fusos horários sobrepostos com forte proficiência em inglês e compatibilidade cultural.', es: 'Profesionales latinoamericanos en zonas horarias superpuestas con fuerte competencia en inglés y compatibilidad cultural.' },
  'features.compliance.title': { en: 'Full Compliance', 'pt-br': 'Conformidade Total', es: 'Cumplimiento Total' },
  'features.compliance.desc': { en: 'LGPD/GDPR compliant data handling, employment law adherence, and comprehensive contract management.', 'pt-br': 'Tratamento de dados conforme LGPD/GDPR, aderência à legislação trabalhista e gestão abrangente de contratos.', es: 'Manejo de datos conforme LGPD/GDPR, adherencia a la ley laboral y gestión integral de contratos.' },

  // CTA section
  'cta.title': { en: 'Ready to Transform Your Team?', 'pt-br': 'Pronto para Transformar Sua Equipe?', es: '¿Listo para Transformar tu Equipo?' },
  'cta.description': { en: 'Join thousands of companies already building exceptional products with Latin American talent through MaGenX.', 'pt-br': 'Junte-se a milhares de empresas que já estão construindo produtos excepcionais com talentos latino-americanos através do MaGenX.', es: 'Únete a miles de empresas que ya están construyendo productos excepcionales con talento latinoamericano a través de MaGenX.' },
  'cta.startHiring': { en: 'Start Hiring', 'pt-br': 'Começar a Contratar', es: 'Comenzar a Contratar' },
  'cta.scheduleDemo': { en: 'Schedule Demo', 'pt-br': 'Agendar Demo', es: 'Programar Demo' },

  // Jobs section
  'jobs.title': { en: 'Latest Job Opportunities', 'pt-br': 'Últimas Oportunidades de Trabalho', es: 'Últimas Oportunidades de Empleo' },
  'jobs.description': { en: 'Explore exciting opportunities with top companies looking for Latin American tech talent.', 'pt-br': 'Explore oportunidades empolgantes com empresas de primeira linha procurando talentos de TI latino-americanos.', es: 'Explora oportunidades emocionantes con empresas top buscando talento tecnológico latinoamericano.' },
  'jobs.searchPlaceholder': { en: 'Search jobs by title, skills, or company...', 'pt-br': 'Pesquisar vagas por título, habilidades ou empresa...', es: 'Buscar empleos por título, habilidades o empresa...' },
  'jobs.allTypes': { en: 'All Types', 'pt-br': 'Todos os Tipos', es: 'Todos los Tipos' },
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
  'footer.findTalent': { en: 'Find Talent', 'pt-br': 'Encontrar Talentos', es: 'Encontrar Talento' },
  'footer.enterprise': { en: 'Enterprise Solutions', 'pt-br': 'Soluções Empresariais' },
  'footer.successStories': { en: 'Success Stories', 'pt-br': 'Histórias de Sucesso' },
  'footer.forProfessionals': { en: 'For Professionals', 'pt-br': 'Para Profissionais' },
  'footer.findWork': { en: 'Find Work', 'pt-br': 'Encontrar Trabalho', es: 'Encontrar Trabajo' },
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

  // Find Talent page (for companies)
  'findTalent.title': { en: 'Find Top Latin American Tech Talent', 'pt-br': 'Encontre os Melhores Talentos de TI da América Latina', es: 'Encuentra el Mejor Talento Tecnológico de Latinoamérica' },
  'findTalent.subtitle': { en: 'Connect with pre-vetted professionals who are ready to transform your business', 'pt-br': 'Conecte-se com profissionais pré-selecionados prontos para transformar seu negócio', es: 'Conecta con profesionales pre-seleccionados listos para transformar tu negocio' },
  'findTalent.journey.title': { en: 'Your Hiring Journey', 'pt-br': 'Sua Jornada de Contratação', es: 'Tu Jornada de Contratación' },
  'findTalent.step1.title': { en: 'Tell Us Your Needs', 'pt-br': 'Conte-nos Suas Necessidades' },
  'findTalent.step1.desc': { en: 'Define your project requirements, technical skills needed, and team preferences through our detailed intake form.', 'pt-br': 'Defina os requisitos do seu projeto, habilidades técnicas necessárias e preferências da equipe através do nosso formulário detalhado.' },
  'findTalent.step2.title': { en: 'AI-Powered Matching', 'pt-br': 'Correspondência com IA' },
  'findTalent.step2.desc': { en: 'Our intelligent algorithm analyzes your requirements and matches you with the most suitable professionals from our talent pool.', 'pt-br': 'Nosso algoritmo inteligente analisa seus requisitos e combina você com os profissionais mais adequados do nosso banco de talentos.' },
  'findTalent.step3.title': { en: 'Interview & Select', 'pt-br': 'Entreviste e Selecione' },
  'findTalent.step3.desc': { en: 'Review candidate profiles, conduct interviews, and choose the perfect fit for your team with our built-in communication tools.', 'pt-br': 'Revise perfis de candidatos, conduza entrevistas e escolha o ajuste perfeito para sua equipe com nossas ferramentas de comunicação integradas.' },
  'findTalent.step4.title': { en: 'Start Working', 'pt-br': 'Comece a Trabalhar' },
  'findTalent.step4.desc': { en: 'Onboard your new team members and start building with integrated project management and secure payment systems.', 'pt-br': 'Integre seus novos membros da equipe e comece a construir com gerenciamento de projetos integrado e sistemas de pagamento seguros.' },
  'findTalent.benefits.title': { en: 'Why Companies Choose MaGenX', 'pt-br': 'Por que Empresas Escolhem MaGenX' },
  'findTalent.benefit1.title': { en: 'Pre-Vetted Talent', 'pt-br': 'Talentos Pré-Selecionados' },
  'findTalent.benefit1.desc': { en: 'Every professional goes through rigorous technical assessments and background verification.', 'pt-br': 'Todo profissional passa por avaliações técnicas rigorosas e verificação de antecedentes.' },
  'findTalent.benefit2.title': { en: 'Timezone Advantage', 'pt-br': 'Vantagem de Fuso Horário' },
  'findTalent.benefit2.desc': { en: 'Work with professionals in similar time zones for real-time collaboration and faster project delivery.', 'pt-br': 'Trabalhe com profissionais em fusos horários similares para colaboração em tempo real e entrega mais rápida de projetos.' },
  'findTalent.benefit3.title': { en: 'Full Compliance', 'pt-br': 'Conformidade Total' },
  'findTalent.benefit3.desc': { en: 'We handle all legal, tax, and HR complexities so you can focus on what matters most.', 'pt-br': 'Cuidamos de todas as complexidades legais, fiscais e de RH para que você possa focar no que mais importa.' },
  'findTalent.getStarted': { en: 'Start Hiring Now', 'pt-br': 'Comece a Contratar Agora' },

  // Find Work page (for professionals)
  'findWork.title': { en: 'Find Your Dream Tech Job', 'pt-br': 'Encontre Seu Emprego dos Sonhos em TI' },
  'findWork.subtitle': { en: 'Join a global network of opportunities with top companies worldwide', 'pt-br': 'Junte-se a uma rede global de oportunidades com as melhores empresas do mundo' },
  'findWork.journey.title': { en: 'Your Career Journey', 'pt-br': 'Sua Jornada de Carreira' },
  'findWork.step1.title': { en: 'Create Your Profile', 'pt-br': 'Crie Seu Perfil' },
  'findWork.step1.desc': { en: 'Build a comprehensive profile showcasing your skills, experience, and portfolio. Our system highlights your strengths.', 'pt-br': 'Construa um perfil abrangente mostrando suas habilidades, experiência e portfólio. Nosso sistema destaca seus pontos fortes.' },
  'findWork.step2.title': { en: 'Get Discovered', 'pt-br': 'Seja Descoberto' },
  'findWork.step2.desc': { en: 'Our AI matches your profile with relevant opportunities. Companies can also discover and reach out to you directly.', 'pt-br': 'Nossa IA combina seu perfil com oportunidades relevantes. Empresas também podem descobri-lo e contatá-lo diretamente.' },
  'findWork.step3.title': { en: 'Interview Process', 'pt-br': 'Processo de Entrevista' },
  'findWork.step3.desc': { en: 'Participate in streamlined interview processes with built-in video calls and technical assessment tools.', 'pt-br': 'Participe de processos de entrevista simplificados com videochamadas integradas e ferramentas de avaliação técnica.' },
  'findWork.step4.title': { en: 'Secure Employment', 'pt-br': 'Emprego Seguro' },
  'findWork.step4.desc': { en: 'Enjoy secure contracts, timely payments, and ongoing support throughout your employment journey.', 'pt-br': 'Desfrute de contratos seguros, pagamentos pontuais e suporte contínuo durante sua jornada de emprego.' },
  'findWork.benefits.title': { en: 'Why Professionals Choose MaGenX', 'pt-br': 'Por que Profissionais Escolhem MaGenX' },
  'findWork.benefit1.title': { en: 'Global Opportunities', 'pt-br': 'Oportunidades Globais' },
  'findWork.benefit1.desc': { en: 'Access jobs from companies worldwide without leaving Latin America.', 'pt-br': 'Acesse vagas de empresas do mundo todo sem sair da América Latina.' },
  'findWork.benefit2.title': { en: 'Fair Compensation', 'pt-br': 'Compensação Justa' },
  'findWork.benefit2.desc': { en: 'Earn competitive international salaries with transparent payment processes.', 'pt-br': 'Ganhe salários internacionais competitivos com processos de pagamento transparentes.' },
  'findWork.benefit3.title': { en: 'Career Growth', 'pt-br': 'Crescimento de Carreira' },
  'findWork.benefit3.desc': { en: 'Develop your skills working with cutting-edge technologies and methodologies.', 'pt-br': 'Desenvolva suas habilidades trabalhando com tecnologias e metodologias de ponta.' },
  'findWork.getStarted': { en: 'Start Your Journey', 'pt-br': 'Comece Sua Jornada' },

  // Strategic shortcuts section
  'shortcuts.title': { en: 'Quick Access', 'pt-br': 'Acesso Rápido' },
  'shortcuts.services': { en: 'Our Services', 'pt-br': 'Nossos Serviços' },
  'shortcuts.cases': { en: 'Success Cases', 'pt-br': 'Casos de Sucesso' },
  'shortcuts.contact': { en: 'Contact Us', 'pt-br': 'Fale Conosco' },
  'shortcuts.hireTalent': { en: 'Hire Talent', 'pt-br': 'Contratar Talentos' },

  // Contact section
  'contact.title': { en: 'Ready to Hire Top Talent?', 'pt-br': 'Pronto para Contratar os Melhores Talentos?' },
  'contact.subtitle': { en: 'Get in touch with our team and discover how we can accelerate your projects', 'pt-br': 'Entre em contato com nossa equipe e descubra como podemos acelerar seus projetos' },
  'contact.cta': { en: 'I Want to Hire Talent', 'pt-br': 'Quero Contratar Talentos' },
  'contact.form.name': { en: 'Your Name', 'pt-br': 'Seu Nome' },
  'contact.form.email': { en: 'Company Email', 'pt-br': 'Email da Empresa' },
  'contact.form.company': { en: 'Company Name', 'pt-br': 'Nome da Empresa' },
  'contact.form.message': { en: 'Tell us about your project', 'pt-br': 'Conte-nos sobre seu projeto' },
  'contact.form.send': { en: 'Send Message', 'pt-br': 'Enviar Mensagem' },
  'contact.form.sending': { en: 'Sending...', 'pt-br': 'Enviando...' },

  // Why choose us section
  'whyChoose.title': { en: 'Why Choose MaGenX?', 'pt-br': 'Por que Escolher MaGenX?' },
  'whyChoose.subtitle': { en: 'Discover the competitive advantages that make us the preferred choice for global companies', 'pt-br': 'Descubra as vantagens competitivas que nos tornam a escolha preferida de empresas globais' },
  'whyChoose.reliability.title': { en: 'Proven Reliability', 'pt-br': 'Confiabilidade Comprovada' },
  'whyChoose.reliability.desc': { en: '98% client satisfaction rate with over 500 successful projects delivered across 50+ countries.', 'pt-br': '98% de satisfação do cliente com mais de 500 projetos bem-sucedidos entregues em mais de 50 países.' },
  'whyChoose.results.title': { en: 'Proven Results', 'pt-br': 'Resultados Comprovados' },
  'whyChoose.results.desc': { en: 'Our clients report 40% faster delivery times and 60% cost savings compared to traditional hiring.', 'pt-br': 'Nossos clientes relatam 40% de redução no tempo de entrega e 60% de economia de custos comparado à contratação tradicional.' },
  'whyChoose.expertise.title': { en: 'Technical Expertise', 'pt-br': 'Expertise Técnica' },
  'whyChoose.expertise.desc': { en: 'Rigorous vetting process ensures only the top 3% of Latin American developers join our platform.', 'pt-br': 'Processo rigoroso de seleção garante que apenas os 3% melhores desenvolvedores da América Latina se juntem à nossa plataforma.' },
  'whyChoose.support.title': { en: '24/7 Support', 'pt-br': 'Suporte 24/7' },
  'whyChoose.support.desc': { en: 'Dedicated account managers and round-the-clock support in English, Spanish, and Portuguese.', 'pt-br': 'Gerentes de conta dedicados e suporte 24 horas em inglês, espanhol e português.' },
  
  // Statistics labels
  'stats.satisfaction': { en: 'Client Satisfaction', 'pt-br': 'Satisfação do Cliente' },
  'stats.projects': { en: 'Projects Delivered', 'pt-br': 'Projetos Entregues' },
  'stats.countries': { en: 'Countries Served', 'pt-br': 'Países Atendidos' },
  'stats.savings': { en: 'Cost Savings', 'pt-br': 'Economia de Custos' },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt-br' || savedLanguage === 'es')) {
      setLanguageState(savedLanguage);
    } else {
      // Auto-detect language based on browser locale
      const browserLang = navigator.language.toLowerCase();
      let detectedLang: Language = 'en'; // default fallback
      
      if (browserLang.startsWith('pt')) {
        detectedLang = 'pt-br';
      } else if (browserLang.startsWith('es')) {
        detectedLang = 'es';
      } else {
        detectedLang = 'en';
      }
      
      setLanguageState(detectedLang);
      localStorage.setItem('language', detectedLang);
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
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
  'nav.contact': { en: 'Contact', 'pt-br': 'Contato', es: 'Contacto' },
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
  'jobs.fullTime': { en: 'Full Time', 'pt-br': 'Tempo Integral', es: 'Tiempo Completo' },
  'jobs.partTime': { en: 'Part Time', 'pt-br': 'Meio Período', es: 'Medio Tiempo' },
  'jobs.contract': { en: 'Contract', 'pt-br': 'Contrato', es: 'Contrato' },
  'jobs.remote': { en: 'Remote', 'pt-br': 'Remoto', es: 'Remoto' },
  'jobs.location': { en: 'Location', 'pt-br': 'Localização', es: 'Ubicación' },
  'jobs.experience': { en: 'Experience', 'pt-br': 'Experiência', es: 'Experiencia' },
  'jobs.salary': { en: 'Salary', 'pt-br': 'Salário', es: 'Salario' },
  'jobs.apply': { en: 'Apply Now', 'pt-br': 'Candidatar-se Agora', es: 'Aplicar Ahora' },
  'jobs.viewAll': { en: 'View All Jobs', 'pt-br': 'Ver Todas as Vagas', es: 'Ver Todos los Empleos' },
  'jobs.noResults': { en: 'No jobs found matching your criteria.', 'pt-br': 'Nenhuma vaga encontrada que corresponda aos seus critérios.', es: 'No se encontraron empleos que coincidan con tus criterios.' },
  'jobs.loading': { en: 'Loading jobs...', 'pt-br': 'Carregando vagas...', es: 'Cargando empleos...' },
  'jobs.viewDetails': { en: 'View Details', 'pt-br': 'Ver Detalhes', es: 'Ver Detalles' },
  'jobs.details.title': { en: 'Job Details', 'pt-br': 'Detalhes da Vaga', es: 'Detalles del Empleo' },
  'jobs.details.description': { en: 'Description', 'pt-br': 'Descrição', es: 'Descripción' },
  'jobs.details.requirements': { en: 'Requirements', 'pt-br': 'Requisitos', es: 'Requisitos' },
  'jobs.details.skills': { en: 'Required Skills', 'pt-br': 'Habilidades Necessárias', es: 'Habilidades Requeridas' },
  'jobs.details.budget': { en: 'Budget', 'pt-br': 'Orçamento', es: 'Presupuesto' },
  'jobs.details.duration': { en: 'Duration', 'pt-br': 'Duração', es: 'Duración' },
  'jobs.details.type': { en: 'Job Type', 'pt-br': 'Tipo de Vaga', es: 'Tipo de Empleo' },
  'jobs.details.company': { en: 'Company', 'pt-br': 'Empresa', es: 'Empresa' },
  'jobs.details.backToJobs': { en: 'Back to Jobs', 'pt-br': 'Voltar às Vagas', es: 'Volver a Empleos' },
  'jobs.details.applyNow': { en: 'Apply for this Position', 'pt-br': 'Candidatar-se a esta Vaga', es: 'Aplicar a esta Posición' },
  'jobs.apply.title': { en: 'Apply for Position', 'pt-br': 'Candidatar-se à Vaga', es: 'Aplicar a la Posición' },
  'jobs.apply.coverLetter': { en: 'Cover Letter', 'pt-br': 'Carta de Apresentação', es: 'Carta de Presentación' },
  'jobs.apply.coverLetterPlaceholder': { en: 'Tell us why you are a great fit for this position...', 'pt-br': 'Conte-nos por que você é ideal para esta vaga...', es: 'Cuéntanos por qué eres ideal para esta posición...' },
  'jobs.apply.proposedRate': { en: 'Proposed Rate (USD)', 'pt-br': 'Taxa Proposta (USD)', es: 'Tarifa Propuesta (USD)' },
  'jobs.apply.proposedRatePlaceholder': { en: 'Your expected rate', 'pt-br': 'Sua taxa esperada', es: 'Tu tarifa esperada' },
  'jobs.apply.submit': { en: 'Submit Application', 'pt-br': 'Enviar Candidatura', es: 'Enviar Candidatura' },
  'jobs.apply.submitting': { en: 'Submitting...', 'pt-br': 'Enviando...', es: 'Enviando...' },
  'jobs.apply.success': { en: 'Application submitted successfully!', 'pt-br': 'Candidatura enviada com sucesso!', es: '¡Candidatura enviada exitosamente!' },
  'jobs.apply.error': { en: 'Failed to submit application', 'pt-br': 'Falha ao enviar candidatura', es: 'Error al enviar candidatura' },
  'jobs.apply.loginRequired': { en: 'Please login as a professional to apply', 'pt-br': 'Por favor, faça login como profissional para se candidatar', es: 'Por favor, inicia sesión como profesional para aplicar' },

  // Footer section
  'footer.description': { en: 'Connecting global companies with exceptional Latin American tech talent.', 'pt-br': 'Conectando empresas globais com talentos excepcionais de TI da América Latina.', es: 'Conectando empresas globales con talento tecnológico excepcional de Latinoamérica.' },
  'footer.forCompanies': { en: 'For Companies', 'pt-br': 'Para Empresas', es: 'Para Empresas' },
  'footer.findTalent': { en: 'Find Talent', 'pt-br': 'Encontrar Talentos', es: 'Encontrar Talento' },
  'footer.enterprise': { en: 'Enterprise Solutions', 'pt-br': 'Soluções Empresariais', es: 'Soluciones Empresariales' },
  'footer.successStories': { en: 'Success Stories', 'pt-br': 'Histórias de Sucesso', es: 'Historias de Éxito' },
  'footer.forProfessionals': { en: 'For Professionals', 'pt-br': 'Para Profissionais', es: 'Para Profesionales' },
  'footer.findWork': { en: 'Find Work', 'pt-br': 'Encontrar Trabalho', es: 'Encontrar Trabajo' },
  'footer.buildProfile': { en: 'Build Profile', 'pt-br': 'Criar Perfil', es: 'Crear Perfil' },
  'footer.resources': { en: 'Resources', 'pt-br': 'Recursos', es: 'Recursos' },
  'footer.company': { en: 'Company', 'pt-br': 'Empresa', es: 'Empresa' },
  'footer.privacy': { en: 'Privacy Policy', 'pt-br': 'Política de Privacidade', es: 'Política de Privacidad' },
  'footer.terms': { en: 'Terms of Service', 'pt-br': 'Termos de Serviço', es: 'Términos de Servicio' },
  'footer.copyright': { en: 'All rights reserved. LGPD/GDPR compliant.', 'pt-br': 'Todos os direitos reservados. Conforme LGPD/GDPR.', es: 'Todos los derechos reservados. Conforme LGPD/GDPR.' },
  
  // Auth page
  'auth.login.title': { en: 'Welcome back', 'pt-br': 'Bem-vindo de volta', es: 'Bienvenido de nuevo' },
  'auth.login.subtitle': { en: 'Login to MaGenX', 'pt-br': 'Entrar no MaGenX', es: 'Iniciar sesión en MaGenX' },
  'auth.register.title': { en: 'Create account', 'pt-br': 'Criar conta', es: 'Crear cuenta' },
  'auth.register.subtitle': { en: 'Join MaGenX to connect with opportunities', 'pt-br': 'Junte-se ao MaGenX para se conectar com oportunidades', es: 'Únete a MaGenX para conectar con oportunidades' },
  'auth.welcome.title': { en: 'Welcome to MaGenX', 'pt-br': 'Bem-vindo ao MaGenX', es: 'Bienvenido a MaGenX' },
  'auth.welcome.subtitle': { en: 'The premier platform connecting global companies with top Latin American tech talent.', 'pt-br': 'A plataforma líder conectando empresas globais com os melhores talentos de TI da América Latina.', es: 'La plataforma líder conectando empresas globales con el mejor talento tecnológico de Latinoamérica.' },
  
  // About page
  'about.title': { en: 'About MaGenX', 'pt-br': 'Sobre o MaGenX', es: 'Acerca de MaGenX' },
  'about.subtitle': { en: 'Connecting Global Companies with Latin American Tech Excellence', 'pt-br': 'Conectando Empresas Globais com a Excelência em TI da América Latina', es: 'Conectando Empresas Globales con la Excelencia Tecnológica de Latinoamérica' },
  
  'about.hero.title': { en: 'About MaGenX', 'pt-br': 'Sobre MaGenX', es: 'Acerca de MaGenX' },
  'about.hero.subtitle': { en: "We're revolutionizing how companies access Latin American talent by removing barriers, ensuring compliance, and creating opportunities that benefit everyone.", 'pt-br': 'Estamos revolucionando como as empresas acessam talentos latino-americanos removendo barreiras, garantindo conformidade e criando oportunidades que beneficiam a todos.', es: 'Estamos revolucionando cómo las empresas acceden al talento latinoamericano eliminando barreras, asegurando el cumplimiento y creando oportunidades que benefician a todos.' },
  
  'about.mission.title': { en: 'Our Mission', 'pt-br': 'Nossa Missão', es: 'Nuestra Misión' },
  'about.mission.desc1': { en: 'MaGenX bridges the gap between exceptional Latin American professionals and global opportunities. We serve as the official employer, handling all compliance, contracts, and administrative complexities so our clients can focus on building great products with amazing talent.', 'pt-br': 'MaGenX conecta profissionais latino-americanos excepcionais com oportunidades globais. Atuamos como empregador oficial, cuidando de toda conformidade, contratos e complexidades administrativas para que nossos clientes possam focar em construir grandes produtos com talentos incríveis.', es: 'MaGenX conecta a profesionales latinoamericanos excepcionales con oportunidades globales. Actuamos como empleador oficial, gestionando todo el cumplimiento, contratos y complejidades administrativas para que nuestros clientes puedan enfocarse en construir grandes productos con talento increíble.' },
  'about.mission.desc2': { en: 'Our unique model ensures legal compliance across 15+ countries while providing professionals with stable employment, benefits, and career growth opportunities.', 'pt-br': 'Nosso modelo único garante conformidade legal em mais de 15 países, proporcionando aos profissionais emprego estável, benefícios e oportunidades de crescimento na carreira.', es: 'Nuestro modelo único garantiza el cumplimiento legal en más de 15 países, brindando a los profesionales empleo estable, beneficios y oportunidades de crecimiento profesional.' },
  'about.mission.button': { en: 'Learn More About Our Process', 'pt-br': 'Saiba Mais Sobre Nosso Processo', es: 'Conoce Más Sobre Nuestro Proceso' },
  
  'about.stats.professionals': { en: 'Vetted Professionals', 'pt-br': 'Profissionais Aprovados', es: 'Profesionales Verificados' },
  'about.stats.companies': { en: 'Partner Companies', 'pt-br': 'Empresas Parceiras', es: 'Empresas Asociadas' },
  'about.stats.countries': { en: 'Countries Covered', 'pt-br': 'Países Cobertos', es: 'Países Cubiertos' },
  'about.stats.satisfaction': { en: 'Client Satisfaction', 'pt-br': 'Satisfação do Cliente', es: 'Satisfacción del Cliente' },
  
  'about.values.title': { en: 'Our Values', 'pt-br': 'Nossos Valores', es: 'Nuestros Valores' },
  'about.values.excellence.title': { en: 'Excellence', 'pt-br': 'Excelência', es: 'Excelencia' },
  'about.values.excellence.desc': { en: 'We maintain the highest standards in talent vetting and service delivery.', 'pt-br': 'Mantemos os mais altos padrões na seleção de talentos e prestação de serviços.', es: 'Mantenemos los más altos estándares en la selección de talento y la prestación de servicios.' },
  'about.values.trust.title': { en: 'Trust', 'pt-br': 'Confiança', es: 'Confianza' },
  'about.values.trust.desc': { en: 'Complete transparency and reliability in all our business relationships.', 'pt-br': 'Transparência e confiabilidade completas em todos os nossos relacionamentos comerciais.', es: 'Transparencia y confiabilidad completa en todas nuestras relaciones comerciales.' },
  'about.values.global.title': { en: 'Global Reach', 'pt-br': 'Alcance Global', es: 'Alcance Global' },
  'about.values.global.desc': { en: 'Connecting talent across Latin America with opportunities worldwide.', 'pt-br': 'Conectando talentos em toda a América Latina com oportunidades em todo o mundo.', es: 'Conectando talento en toda Latinoamérica con oportunidades en todo el mundo.' },
  'about.values.partnership.title': { en: 'Partnership', 'pt-br': 'Parceria', es: 'Colaboración' },
  'about.values.partnership.desc': { en: 'Building long-term relationships that benefit everyone involved.', 'pt-br': 'Construindo relacionamentos de longo prazo que beneficiam todos os envolvidos.', es: 'Construyendo relaciones a largo plazo que benefician a todos los involucrados.' },
  
  'about.team.title': { en: 'Meet Our Leadership Team', 'pt-br': 'Conheça Nossa Equipe de Liderança', es: 'Conoce Nuestro Equipo de Liderazgo' },
  'about.team.anderson.role': { en: 'CEO & Founder', 'pt-br': 'CEO & Fundador', es: 'CEO & Fundador' },
  'about.team.anderson.desc': { en: '25+ years of experience in Software Engineering and international business development. Responsible for defining the company\'s vision and strategy, making strategic decisions, leading the executive team, representing the company in the market, and ensuring sustainable growth and long-term success.', 'pt-br': 'Mais de 25 anos de experiência em Engenharia de Software e desenvolvimento de negócios internacionais. Responsável por definir a visão e estratégia da empresa, tomar decisões estratégicas, liderar a equipe executiva, representar a empresa no mercado e garantir crescimento sustentável e sucesso a longo prazo.', es: 'Más de 25 años de experiencia en Ingeniería de Software y desarrollo de negocios internacionales. Responsable de definir la visión y estrategia de la empresa, tomar decisiones estratégicas, liderar el equipo ejecutivo, representar a la empresa en el mercado y garantizar el crecimiento sostenible y el éxito a largo plazo.' },
  'about.team.andre.role': { en: 'COO & Co-Founder', 'pt-br': 'COO & Cofundador', es: 'COO & Cofundador' },
  'about.team.andre.desc': { en: '20+ years of experience in project management and government relations. Responsible for overseeing the company\'s daily operations, ensuring alignment between strategy and execution, while also leading strategic partnerships and corporate alliances to drive sustainable growth and institutional engagement.', 'pt-br': 'Mais de 20 anos de experiência em gestão de projetos e relações governamentais. Responsável por supervisionar as operações diárias da empresa, garantindo alinhamento entre estratégia e execução, além de liderar parcerias estratégicas e alianças corporativas para impulsionar o crescimento sustentável e o engajamento institucional.', es: 'Más de 20 años de experiencia en gestión de proyectos y relaciones gubernamentales. Responsable de supervisar las operaciones diarias de la empresa, asegurando la alineación entre estrategia y ejecución, además de liderar alianzas estratégicas y alianzas corporativas para impulsar el crecimiento sostenible y el compromiso institucional.' },
  
  'about.story.title': { en: 'Our Story', 'pt-br': 'Nossa História', es: 'Nuestra Historia' },
  'about.story.intro': { en: 'Founded in 2020, MaGenX emerged from a simple observation: Latin America was home to world-class technical talent, but accessing this talent pool was complicated by legal, cultural, and administrative barriers.', 'pt-br': 'Fundada em 2020, a MaGenX surgiu de uma observação simples: a América Latina abrigava talentos técnicos de classe mundial, mas o acesso a esse conjunto de talentos era complicado por barreiras legais, culturais e administrativas.', es: 'Fundada en 2020, MaGenX surgió de una simple observación: Latinoamérica albergaba talento técnico de clase mundial, pero el acceso a este grupo de talento era complicado por barreras legales, culturales y administrativas.' },
  'about.story.challenge.title': { en: 'The Challenge', 'pt-br': 'O Desafio', es: 'El Desafío' },
  'about.story.challenge.desc': { en: 'Companies wanted to hire the best talent regardless of location, but navigating international employment law, tax compliance, and cultural differences was overwhelming. Meanwhile, talented professionals in Latin America struggled to access global opportunities.', 'pt-br': 'As empresas queriam contratar os melhores talentos independentemente da localização, mas navegar pela legislação trabalhista internacional, conformidade fiscal e diferenças culturais era esmagador. Enquanto isso, profissionais talentosos na América Latina lutavam para acessar oportunidades globais.', es: 'Las empresas querían contratar el mejor talento sin importar la ubicación, pero navegar por la legislación laboral internacional, el cumplimiento fiscal y las diferencias culturales era abrumador. Mientras tanto, los profesionales talentosos en Latinoamérica luchaban por acceder a oportunidades globales.' },
  'about.story.solution.title': { en: 'Our Solution', 'pt-br': 'Nossa Solução', es: 'Nuestra Solución' },
  'about.story.solution.desc': { en: 'We created a comprehensive platform that acts as the employer of record, handling all legal and administrative complexities while ensuring professionals receive competitive compensation, benefits, and career development opportunities.', 'pt-br': 'Criamos uma plataforma abrangente que atua como empregador oficial, gerenciando todas as complexidades legais e administrativas, garantindo que os profissionais recebam remuneração competitiva, benefícios e oportunidades de desenvolvimento de carreira.', es: 'Creamos una plataforma integral que actúa como empleador oficial, gestionando todas las complejidades legales y administrativas, garantizando que los profesionales reciban compensación competitiva, beneficios y oportunidades de desarrollo profesional.' },
  
  'about.cta.title': { en: 'Ready to Join Our Mission?', 'pt-br': 'Pronto para Se Juntar à Nossa Missão?', es: '¿Listo para Unirte a Nuestra Misión?' },
  'about.cta.subtitle': { en: "Whether you're a company looking for exceptional talent or a professional seeking global opportunities, we're here to make it happen.", 'pt-br': 'Seja você uma empresa procurando talentos excepcionais ou um profissional buscando oportunidades globais, estamos aqui para fazer acontecer.', es: 'Ya sea que seas una empresa buscando talento excepcional o un profesional buscando oportunidades globales, estamos aquí para hacerlo realidad.' },
  'about.cta.button.hire': { en: 'Hire Talent', 'pt-br': 'Contratar Talentos', es: 'Contratar Talento' },
  'about.cta.button.join': { en: 'Join as Professional', 'pt-br': 'Junte-se como Profissional', es: 'Únete como Profesional' },

  // Find Talent page (for companies)
  'findTalent.title': { en: 'Find Top Latin American Tech Talent', 'pt-br': 'Encontre os Melhores Talentos de TI da América Latina', es: 'Encuentra el Mejor Talento Tecnológico de Latinoamérica' },
  'findTalent.subtitle': { en: 'Connect with pre-vetted professionals who are ready to transform your business', 'pt-br': 'Conecte-se com profissionais pré-selecionados prontos para transformar seu negócio', es: 'Conecta con profesionales pre-seleccionados listos para transformar tu negocio' },
  'findTalent.journey.title': { en: 'Your Hiring Journey', 'pt-br': 'Sua Jornada de Contratação', es: 'Tu Jornada de Contratación' },
  'findTalent.step1.title': { en: 'Tell Us Your Needs', 'pt-br': 'Conte-nos Suas Necessidades', es: 'Cuéntanos tus Necesidades' },
  'findTalent.step1.desc': { en: 'Define your project requirements, technical skills needed, and team preferences through our detailed intake form.', 'pt-br': 'Defina os requisitos do seu projeto, habilidades técnicas necessárias e preferências da equipe através do nosso formulário detalhado.', es: 'Define los requisitos de tu proyecto, habilidades técnicas necesarias y preferencias del equipo a través de nuestro formulario detallado.' },
  'findTalent.step2.title': { en: 'AI-Powered Matching', 'pt-br': 'Correspondência com IA', es: 'Matching con IA' },
  'findTalent.step2.desc': { en: 'Our intelligent algorithm analyzes your requirements and matches you with the most suitable professionals from our talent pool.', 'pt-br': 'Nosso algoritmo inteligente analisa seus requisitos e combina você com os profissionais mais adequados do nosso banco de talentos.', es: 'Nuestro algoritmo inteligente analiza tus requisitos y te conecta con los profesionales más adecuados de nuestro banco de talentos.' },
  'findTalent.step3.title': { en: 'Interview & Select', 'pt-br': 'Entreviste e Selecione', es: 'Entrevista y Selecciona' },
  'findTalent.step3.desc': { en: 'Review candidate profiles, conduct interviews, and choose the perfect fit for your team with our built-in communication tools.', 'pt-br': 'Revise perfis de candidatos, conduza entrevistas e escolha o ajuste perfeito para sua equipe com nossas ferramentas de comunicação integradas.', es: 'Revisa perfiles de candidatos, realiza entrevistas y elige el ajuste perfecto para tu equipo con nuestras herramientas de comunicación integradas.' },
  'findTalent.step4.title': { en: 'Start Working', 'pt-br': 'Comece a Trabalhar', es: 'Comienza a Trabajar' },
  'findTalent.step4.desc': { en: 'Onboard your new team members and start building with integrated project management and secure payment systems.', 'pt-br': 'Integre seus novos membros da equipe e comece a construir com gerenciamento de projetos integrado e sistemas de pagamento seguros.', es: 'Incorpora a tus nuevos miembros del equipo y comienza a construir con gestión de proyectos integrada y sistemas de pago seguros.' },
  'findTalent.benefits.title': { en: 'Why Companies Choose MaGenX', 'pt-br': 'Por que Empresas Escolhem MaGenX', es: 'Por qué las Empresas Eligen MaGenX' },
  'findTalent.benefit1.title': { en: 'Pre-Vetted Talent', 'pt-br': 'Talentos Pré-Selecionados', es: 'Talento Pre-Seleccionado' },
  'findTalent.benefit1.desc': { en: 'Every professional goes through rigorous technical assessments and background verification.', 'pt-br': 'Todo profissional passa por avaliações técnicas rigorosas e verificação de antecedentes.', es: 'Cada profesional pasa por evaluaciones técnicas rigurosas y verificación de antecedentes.' },
  'findTalent.benefit2.title': { en: 'Timezone Advantage', 'pt-br': 'Vantagem de Fuso Horário', es: 'Ventaja de Zona Horaria' },
  'findTalent.benefit2.desc': { en: 'Work with professionals in similar time zones for real-time collaboration and faster project delivery.', 'pt-br': 'Trabalhe com profissionais em fusos horários similares para colaboração em tempo real e entrega mais rápida de projetos.', es: 'Trabaja con profesionales en zonas horarias similares para colaboración en tiempo real y entrega más rápida de proyectos.' },
  'findTalent.benefit3.title': { en: 'Full Compliance', 'pt-br': 'Conformidade Total', es: 'Cumplimiento Total' },
  'findTalent.benefit3.desc': { en: 'We handle all legal, tax, and HR complexities so you can focus on what matters most.', 'pt-br': 'Cuidamos de todas as complexidades legais, fiscais e de RH para que você possa focar no que mais importa.', es: 'Nos encargamos de todas las complejidades legales, fiscales y de RRHH para que puedas enfocarte en lo que más importa.' },
  'findTalent.getStarted': { en: 'Start Hiring Now', 'pt-br': 'Comece a Contratar Agora', es: 'Comenzar a Contratar Ahora' },

  // Find Work page (for professionals)
  'findWork.title': { en: 'Find Your Dream Tech Job', 'pt-br': 'Encontre Seu Emprego dos Sonhos em TI', es: 'Encuentra tu Empleo Tecnológico Ideal' },
  'findWork.subtitle': { en: 'Join a global network of opportunities with top companies worldwide', 'pt-br': 'Junte-se a uma rede global de oportunidades com as melhores empresas do mundo', es: 'Únete a una red global de oportunidades con las mejores empresas del mundo' },
  'findWork.journey.title': { en: 'Your Career Journey', 'pt-br': 'Sua Jornada de Carreira', es: 'Tu Trayectoria Profesional' },
  'findWork.step1.title': { en: 'Create Your Profile', 'pt-br': 'Crie Seu Perfil', es: 'Crea tu Perfil' },
  'findWork.step1.desc': { en: 'Build a comprehensive profile showcasing your skills, experience, and portfolio. Our system highlights your strengths.', 'pt-br': 'Construa um perfil abrangente mostrando suas habilidades, experiência e portfólio. Nosso sistema destaca seus pontos fortes.', es: 'Construye un perfil completo mostrando tus habilidades, experiencia y portafolio. Nuestro sistema destaca tus fortalezas.' },
  'findWork.step2.title': { en: 'Get Discovered', 'pt-br': 'Seja Descoberto', es: 'Sé Descubierto' },
  'findWork.step2.desc': { en: 'Our AI matches your profile with relevant opportunities. Companies can also discover and reach out to you directly.', 'pt-br': 'Nossa IA combina seu perfil com oportunidades relevantes. Empresas também podem descobri-lo e contatá-lo diretamente.', es: 'Nuestra IA conecta tu perfil con oportunidades relevantes. Las empresas también pueden descubrirte y contactarte directamente.' },
  'findWork.step3.title': { en: 'Interview Process', 'pt-br': 'Processo de Entrevista', es: 'Proceso de Entrevista' },
  'findWork.step3.desc': { en: 'Participate in streamlined interview processes with built-in video calls and technical assessment tools.', 'pt-br': 'Participe de processos de entrevista simplificados com videochamadas integradas e ferramentas de avaliação técnica.', es: 'Participa en procesos de entrevista simplificados con videollamadas integradas y herramientas de evaluación técnica.' },
  'findWork.step4.title': { en: 'Secure Employment', 'pt-br': 'Emprego Seguro', es: 'Empleo Seguro' },
  'findWork.step4.desc': { en: 'Enjoy secure contracts, timely payments, and ongoing support throughout your employment journey.', 'pt-br': 'Desfrute de contratos seguros, pagamentos pontuais e suporte contínuo durante sua jornada de emprego.', es: 'Disfruta de contratos seguros, pagos puntuales y soporte continuo durante tu trayectoria laboral.' },
  'findWork.benefits.title': { en: 'Why Professionals Choose MaGenX', 'pt-br': 'Por que Profissionais Escolhem MaGenX', es: 'Por qué los Profesionales Eligen MaGenX' },
  'findWork.benefit1.title': { en: 'Global Opportunities', 'pt-br': 'Oportunidades Globais', es: 'Oportunidades Globales' },
  'findWork.benefit1.desc': { en: 'Access jobs from companies worldwide without leaving Latin America.', 'pt-br': 'Acesse vagas de empresas do mundo todo sem sair da América Latina.', es: 'Accede a empleos de empresas de todo el mundo sin salir de Latinoamérica.' },
  'findWork.benefit2.title': { en: 'Fair Compensation', 'pt-br': 'Compensação Justa', es: 'Compensación Justa' },
  'findWork.benefit2.desc': { en: 'Earn competitive international salaries with transparent payment processes.', 'pt-br': 'Ganhe salários internacionais competitivos com processos de pagamento transparentes.', es: 'Gana salarios internacionales competitivos con procesos de pago transparentes.' },
  'findWork.benefit3.title': { en: 'Career Growth', 'pt-br': 'Crescimento de Carreira', es: 'Crecimiento Profesional' },
  'findWork.benefit3.desc': { en: 'Develop your skills working with cutting-edge technologies and methodologies.', 'pt-br': 'Desenvolva suas habilidades trabalhando com tecnologias e metodologias de ponta.', es: 'Desarrolla tus habilidades trabajando con tecnologías y metodologías de vanguardia.' },
  'findWork.getStarted': { en: 'Start Your Journey', 'pt-br': 'Comece Sua Jornada', es: 'Comienza tu Trayectoria' },

  // Strategic shortcuts section
  'shortcuts.title': { en: 'Quick Access', 'pt-br': 'Acesso Rápido', es: 'Acceso Rápido' },
  'shortcuts.services': { en: 'Our Services', 'pt-br': 'Nossos Serviços', es: 'Nuestros Servicios' },
  'shortcuts.cases': { en: 'Success Cases', 'pt-br': 'Casos de Sucesso', es: 'Casos de Éxito' },
  'shortcuts.contact': { en: 'Contact Us', 'pt-br': 'Fale Conosco', es: 'Contáctanos' },
  'shortcuts.hireTalent': { en: 'Hire Talent', 'pt-br': 'Contratar Talentos', es: 'Contratar Talento' },

  // Contact section
  'contact.title': { en: 'Ready to Hire Top Talent?', 'pt-br': 'Pronto para Contratar os Melhores Talentos?', es: '¿Listo para Contratar el Mejor Talento?' },
  'contact.subtitle': { en: 'Get in touch with our team and discover how we can accelerate your projects', 'pt-br': 'Entre em contato com nossa equipe e descubra como podemos acelerar seus projetos', es: 'Ponte en contacto con nuestro equipo y descubre cómo podemos acelerar tus proyectos' },
  'contact.cta': { en: 'I Want to Hire Talent', 'pt-br': 'Quero Contratar Talentos', es: 'Quiero Contratar Talento' },
  'contact.form.name': { en: 'Your Name', 'pt-br': 'Seu Nome', es: 'Tu Nombre' },
  'contact.form.email': { en: 'Company Email', 'pt-br': 'Email da Empresa', es: 'Email de la Empresa' },
  'contact.form.company': { en: 'Company Name', 'pt-br': 'Nome da Empresa', es: 'Nombre de la Empresa' },
  'contact.form.message': { en: 'Tell us about your project', 'pt-br': 'Conte-nos sobre seu projeto', es: 'Cuéntanos sobre tu proyecto' },
  'contact.form.send': { en: 'Send Message', 'pt-br': 'Enviar Mensagem', es: 'Enviar Mensaje' },
  'contact.form.sending': { en: 'Sending...', 'pt-br': 'Enviando...', es: 'Enviando...' },
  'contact.info.title': { en: 'Get in Touch', 'pt-br': 'Entre em Contato', es: 'Ponte en Contacto' },
  'contact.info.description': { en: 'We are here to help you find the best solutions. Contact us!', 'pt-br': 'Estamos aqui para ajudar você a encontrar as melhores soluções. Entre em contato conosco!', es: '¡Estamos aquí para ayudarte a encontrar las mejores soluciones. Contáctanos!' },
  'contact.info.email': { en: 'Email', 'pt-br': 'Email', es: 'Email' },
  'contact.info.phone': { en: 'Phone', 'pt-br': 'Telefone', es: 'Teléfono' },
  'contact.info.location': { en: 'Location', 'pt-br': 'Localização', es: 'Ubicación' },
  'contact.form.title': { en: 'Send a Message', 'pt-br': 'Envie uma Mensagem', es: 'Envía un Mensaje' },
  'contact.success.title': { en: 'Message sent!', 'pt-br': 'Mensagem enviada!', es: '¡Mensaje enviado!' },
  'contact.success.description': { en: 'We received your message and will get back to you soon.', 'pt-br': 'Recebemos sua mensagem e entraremos em contato em breve.', es: 'Recibimos tu mensaje y te contactaremos pronto.' },
  'contact.error.title': { en: 'Error sending message', 'pt-br': 'Erro ao enviar mensagem', es: 'Error al enviar mensaje' },
  'contact.error.description': { en: 'An error occurred. Please try again or contact us directly.', 'pt-br': 'Ocorreu um erro. Tente novamente ou entre em contato diretamente.', es: 'Ocurrió un error. Inténtalo de nuevo o contáctanos directamente.' },

  // Why choose us section
  'whyChoose.title': { en: 'Why Choose MaGenX?', 'pt-br': 'Por que Escolher MaGenX?', es: '¿Por qué Elegir MaGenX?' },
  'whyChoose.subtitle': { en: 'Discover the competitive advantages that make us the preferred choice for global companies', 'pt-br': 'Descubra as vantagens competitivas que nos tornam a escolha preferida de empresas globais', es: 'Descubre las ventajas competitivas que nos convierten en la opción preferida de las empresas globales' },
  'whyChoose.reliability.title': { en: 'Proven Reliability', 'pt-br': 'Confiabilidade Comprovada', es: 'Confiabilidad Comprobada' },
  'whyChoose.reliability.desc': { en: '98% client satisfaction rate with over 500 successful projects delivered across 50+ countries.', 'pt-br': '98% de satisfação do cliente com mais de 500 projetos bem-sucedidos entregues em mais de 50 países.', es: '98% de satisfacción del cliente con más de 500 proyectos exitosos entregados en más de 50 países.' },
  'whyChoose.results.title': { en: 'Proven Results', 'pt-br': 'Resultados Comprovados', es: 'Resultados Comprobados' },
  'whyChoose.results.desc': { en: 'Our clients report 40% faster delivery times and 60% cost savings compared to traditional hiring.', 'pt-br': 'Nossos clientes relatam 40% de redução no tempo de entrega e 60% de economia de custos comparado à contratação tradicional.', es: 'Nuestros clientes reportan 40% de reducción en tiempos de entrega y 60% de ahorro en costos comparado con la contratación tradicional.' },
  'whyChoose.expertise.title': { en: 'Technical Expertise', 'pt-br': 'Expertise Técnica', es: 'Experiencia Técnica' },
  'whyChoose.expertise.desc': { en: 'Rigorous vetting process ensures only the top 3% of Latin American developers join our platform.', 'pt-br': 'Processo rigoroso de seleção garante que apenas os 3% melhores desenvolvedores da América Latina se juntem à nossa plataforma.', es: 'Proceso riguroso de selección garantiza que solo el 3% superior de desarrolladores latinoamericanos se unan a nuestra plataforma.' },
  'whyChoose.support.title': { en: '24/7 Support', 'pt-br': 'Suporte 24/7', es: 'Soporte 24/7' },
  'whyChoose.support.desc': { en: 'Dedicated account managers and round-the-clock support in English, Spanish, and Portuguese.', 'pt-br': 'Gerentes de conta dedicados e suporte 24 horas em inglês, espanhol e português.', es: 'Gerentes de cuenta dedicados y soporte las 24 horas en inglés, español y portugués.' },
  
  // Statistics labels
  'stats.satisfaction': { en: 'Client Satisfaction', 'pt-br': 'Satisfação do Cliente', es: 'Satisfacción del Cliente' },
  'stats.projects': { en: 'Projects Delivered', 'pt-br': 'Projetos Entregues', es: 'Proyectos Entregados' },
  'stats.countries': { en: 'Countries Served', 'pt-br': 'Países Atendidos', es: 'Países Atendidos' },
  'stats.savings': { en: 'Cost Savings', 'pt-br': 'Economia de Custos', es: 'Ahorro de Costos' },
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
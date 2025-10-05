-- Script para inserir as vagas no banco de dados de produção
-- Execute este script no painel de banco de dados de produção do Replit

-- Primeiro, garante que a empresa MaGenX existe
INSERT INTO companies (id, user_id, name, description, website, industry, size, location, created_at, updated_at)
VALUES (
  'company-magenx-001',
  'admin-user-001',
  'MaGenX',
  'Plataforma que conecta empresas globais com profissionais de tecnologia da América Latina',
  'https://magenx.tech',
  'Technology Recruitment',
  '11-50',
  'São Paulo, Brazil',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insere as 6 vagas ativas
INSERT INTO jobs (
  id, 
  company_id, 
  title, 
  description, 
  requirements, 
  skills, 
  budget, 
  duration, 
  type, 
  status, 
  approved_by, 
  approved_at, 
  created_at, 
  updated_at
) VALUES 
(
  'job-fullstack-java-001',
  'company-magenx-001',
  'Full Stack Java Engineer',
  'Buscamos um profissional experiente para atuar no desenvolvimento de sistemas corporativos utilizando stack Java/Spring no backend e React/Angular no frontend. O profissional participará de projetos de grande escala com foco em arquitetura de microserviços e integração de sistemas.',
  E'Requisitos obrigatórios:\n• Formação completa em TI\n• Pós-graduação em TI\n• Experiência sólida com Java (Spring, JPA, Hibernate)\n• Conhecimento em JavaScript (React, Node.js, Angular)\n• Bancos de Dados: PostgreSQL, MySQL, Oracle\n• DevOps: CI/CD (Jenkins, GitLab, GitHub Actions), Docker, Kubernetes\n• Infraestrutura como Código (Terraform, Ansible)\n• Integrações: APIs REST e SOAP\n• Testes: JUnit, Selenium, Postman/Newman\n• Controle de Versão: Git, GitFlow, GitHub, GitLab\n• Gestão de Projetos: Redmine, Azure DevOps\n• Metodologias ágeis (Scrum/Kanban)',
  '["Java", "Spring", "Spring Boot", "JPA", "Hibernate", "JavaScript", "React", "Node.js", "Angular", "PostgreSQL", "MySQL", "Oracle", "Docker", "Kubernetes", "Jenkins", "GitLab", "Terraform", "Ansible", "REST", "Git"]',
  120000.00,
  '12 months',
  'full-time',
  'active',
  'admin-user-001',
  NOW(),
  NOW(),
  NOW()
),
(
  'job-data-engineer-001',
  'company-magenx-001',
  'Engenheiro de Dados | Analista PL/SR ou Tech Lead',
  E'Oportunidade para atuar em projetos de migração para cloud e otimização de pipelines de dados em ambiente híbrido (2-3x por semana na Vila Olímpia, São Paulo-SP). Desenvolvimento de workflows de ingestão, qualidade e transformação de dados, contribuindo para arquitetura medalhão do Data Lake.\n\n📍 Localização: Híbrido – 2 a 3x por semana na Vila Olímpia (São Paulo - SP)\n💡 Contratação: PJ ou CLT',
  E'Requisitos Técnicos:\n• Inglês para conversação com times internacionais (obrigatório)\n• Experiência com Python, Spark, PySpark\n• Vivência em AWS e Databricks\n• Conhecimento em Control-M, Jenkins/Cloudbees, Git/GitHub\n• Experiência no mercado financeiro, especialmente com Fundos de Investimentos (Asset)\n• Capacidade de desenvolver workflows de ingestão, qualidade e transformação de dados\n• Experiência com arquitetura medalhão do Data Lake',
  '["Python", "Spark", "PySpark", "AWS", "Databricks", "Jenkins", "Git", "ETL", "Data Lake", "SQL"]',
  100000.00,
  '12 months',
  'full-time',
  'active',
  'admin-user-001',
  NOW(),
  NOW(),
  NOW()
),
(
  'job-golang-aws-001',
  'company-magenx-001',
  'Desenvolvedor(a) Golang | Cloud AWS',
  E'Estamos em busca de um(a) Desenvolvedor(a) Golang para atuar em sistemas de pagamentos eletrônicos em ambiente Cloud (AWS), com participação em projetos inovadores e de grande impacto.\n\n⚠️ Importante: Experiência em Golang e AWS (API Gateway, Load Balancer, S3, EKS, ECS, CloudWatch) é obrigatória (mínimo 4 anos).\n\nO profissional deve dominar integração via API Rest, testes unitários e de integração, monitoramento com AWS CloudWatch, além de traduzir demandas em soluções funcionais e não funcionais de forma eficaz.',
  E'Requisitos Técnicos Mandatórios:\n✔ Linguagem primária: Golang (mínimo 4 anos)\n✔ Serviços AWS: API Gateway, Load Balancer, S3, EKS, ECS, CloudWatch\n✔ Integração de serviços via APIs Rest\n✔ Testes unitários e de integração\n✔ PL/SQL\n✔ Docker (containers)\n✔ Git\n✔ Experiência com metodologias ágeis\n\nDiferenciais:\n• Conhecimento adicional em Java\n• Conhecimento adicional em Python',
  '["Golang", "AWS", "API Gateway", "S3", "EKS", "ECS", "CloudWatch", "Docker", "Git", "REST", "PL/SQL"]',
  95000.00,
  '12 months',
  'full-time',
  'active',
  'admin-user-001',
  NOW(),
  NOW(),
  NOW()
),
(
  'job-dotnet-junior-001',
  'company-magenx-001',
  'Desenvolvedor(a) .NET Júnior',
  E'Oportunidade remota para desenvolvedor júnior com experiência prática em .NET (C#) e conhecimento em APIs RESTful. O profissional atuará no desenvolvimento de soluções corporativas com integração a banco de dados Oracle.\n\n🏠 Modelo: 100% Remoto',
  E'Hard Skills:\n• Experiência prática com desenvolvimento .NET (C#)\n• Conhecimento funcional em APIs RESTful\n• Experiência anterior com banco de dados Oracle: integração e manipulação de dados\n• Conhecimento de versionamento de código (Git)\n• Capacidade comprovada de atuação autônoma em projetos de desenvolvimento\n\nDiferenciais:\n• Vivência com Azure (Functions, Service Bus, filas)',
  '["C#", ".NET", "REST", "API", "Oracle", "Git", "Azure"]',
  45000.00,
  '12 months',
  'full-time',
  'active',
  'admin-user-001',
  NOW(),
  NOW(),
  NOW()
),
(
  'job-gen-ai-specialist-001',
  'company-magenx-001',
  'Especialista em Generative AI',
  E'Buscamos uma pessoa especialista em Inteligência Artificial Generativa, que curta desafio e tenha visão estratégica, mas também goste de colocar a mão na massa. \n\nEsta pessoa vai atuar num projeto de alto impacto dentro do cliente, liderando iniciativas de IA generativa voltadas para automação, eficiência e criação de novas soluções com foco real em negócio. É uma baita oportunidade para quem quer aplicar IA generativa no mundo real, com liberdade criativa e espaço para inovação de verdade.\n\nResponsabilidades:\n• Liderar tecnicamente o desenvolvimento de soluções com IA generativa dentro do cliente\n• Co-criar com times de produto, dados e tecnologia soluções práticas e inovadoras\n• Traduzir desafios de negócio em soluções viáveis com IA\n• Testar, prototipar e evoluir produtos com autonomia e espírito de dono\n• Trazer tendências, boas práticas e novas ideias para a mesa',
  E'Requisitos Obrigatórios:\n• Experiência sólida com modelos de IA generativa (ex: LLMs como GPT, Claude, Mistral, etc.)\n• IA Generativa: Integrações com OpenAI ou outros modelos de LLM\n• Domínio de Prompt Engineering, Fine-tuning e uso avançado de APIs de IA\n• Experiência em projetos reais com IA aplicada a problemas de negócio\n• Conhecimento técnico em NLP, Machine Learning, LLMOps e arquitetura de soluções com IA\n• Programação com Python (ou linguagem compatível com o stack de IA)\n• Capacidade de liderar tecnicamente iniciativas e dialogar bem com áreas de negócio\n• Perfil proativo, curioso, com pensamento crítico e orientado a solução\n\nDiferenciais:\n• Experiência com LangChain, LlamaIndex, Vector DBs (Pinecone, FAISS, Weaviate)\n• Projetos envolvendo copilots, agentes autônomos ou interfaces com IA generativa\n• Visão sobre ética, privacidade e segurança em IA\n• Capacidade de facilitar workshops técnicos e compartilhar conhecimento com o time',
  '["Python", "AI", "Machine Learning", "OpenAI", "GPT", "LLM", "NLP", "Prompt Engineering", "LangChain", "Vector Databases"]',
  150000.00,
  '12 months',
  'full-time',
  'active',
  'admin-user-001',
  NOW(),
  NOW(),
  NOW()
),
(
  'job-talent-pool-001',
  'company-magenx-001',
  'Cadastro no Banco de Talentos MaGenX',
  E'🌎 Faça parte do nosso Banco de Talentos!\n\nConecte-se com empresas globais de tecnologia que estão em busca de profissionais talentosos da América Latina. Ao se cadastrar em nosso banco de talentos, você:\n\n✅ Fica visível para empresas de primeira linha\n✅ Recebe notificações sobre vagas compatíveis com seu perfil\n✅ Participa de processos seletivos exclusivos\n✅ Acessa oportunidades remotas e híbridas\n\n📋 Como funciona:\n1. Complete seu perfil profissional\n2. Faça upload do seu currículo\n3. Adicione suas skills e experiências\n4. Aguarde o match com empresas interessadas\n\n💼 Todas as áreas de TI são bem-vindas:\n• Desenvolvimento (Backend, Frontend, Full Stack, Mobile)\n• Dados (Data Engineer, Data Scientist, Data Analyst)\n• DevOps e Cloud\n• QA e Testes\n• Product e Design\n• E muito mais!',
  E'Requisitos:\n• Profissional de TI de qualquer área\n• Perfil completo na plataforma\n• Disponibilidade para trabalho remoto ou híbrido\n• Inglês (desejável, mas não obrigatório)',
  '["JavaScript", "Python", "Java", "React", "Node.js", "AWS", "DevOps", "SQL", "Git"]',
  NULL,
  'ongoing',
  'project',
  'active',
  'admin-user-001',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verifica quantas vagas foram inseridas
SELECT COUNT(*) as total_vagas_ativas FROM jobs WHERE status = 'active';

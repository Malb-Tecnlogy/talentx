# Overview

MaGenX is a comprehensive job marketplace platform that connects global companies with Latin American tech professionals. The application features AI-powered matching capabilities, real-time communication through WebSockets, and role-based dashboards for companies, professionals, and administrators. Built with a modern full-stack architecture using React for the frontend and Express.js for the backend.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with Tailwind CSS for consistent, accessible design system
- **State Management**: TanStack Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Styling**: Tailwind CSS with CSS custom properties for theming

## Backend Architecture
- **Framework**: Express.js with TypeScript for API endpoints and middleware
- **Authentication**: Conventional email/password authentication with session-based persistence
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live notifications and updates
- **API Design**: RESTful endpoints with standardized error handling and logging middleware

## Data Storage
- **Primary Database**: PostgreSQL hosted on Neon with connection pooling
- **ORM**: Drizzle with schema-first approach and type generation
- **Session Storage**: PostgreSQL-backed session store for authentication persistence
- **Migrations**: Drizzle Kit for database schema management and migrations

## Authentication & Authorization
- **Provider**: Email/password authentication with bcrypt password hashing
- **Session Management**: Express sessions with PostgreSQL storage
- **Role-based Access**: Three user roles (company, professional, admin) with route-level protection
- **Security**: Secure cookies, session timeout handling, and password hashing

## External Dependencies
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI GPT-5 API for job-professional matching and analysis
- **Authentication**: Email/password authentication system
- **Real-time**: Native WebSocket implementation for live updates
- **UI Framework**: shadcn/ui component library built on Radix UI
- **Email Service**: Resend API for transactional email delivery
- **File Storage**: Not currently implemented (future enhancement)

## Key Features
- **AI-Powered Matching**: OpenAI integration for intelligent job-professional compatibility analysis
- **Real-time Updates**: WebSocket connections for live notifications and status updates
- **Multi-role Dashboards**: Separate interfaces for companies, professionals, and administrators
- **Profile Management**: Comprehensive profile creation and management for both companies and professionals
- **Job Management**: Full job posting, application, and contract lifecycle management
- **Admin Controls**: System-wide administration capabilities for platform oversight

# Recent Changes

- **Spanish Translation Completion (September 2025):** Completed trilingual support across entire platform
  - Fixed missing Spanish translations for "Why Choose Us" section on homepage
  - Implemented complete internationalization for About page with 45+ translation keys
  - Added Spanish translations for 77+ keys across Jobs, Footer, Navigation, and other sections
  - All pages now fully support EN/PT-BR/ES language switching
  - Tested and validated language selector functionality across all pages
- **Leadership Team Update (September 2025):** Updated About page to showcase real company founders
  - Reduced leadership team from 3 to 2 members
  - Added Anderson Alves (CEO & Founder) with professional photo
  - Added Andre Felipe Alves (COO & Co-Founder) with professional photo
  - Adjusted layout to 2-column centered grid for better visual presentation
  - Applied grayscale filter to team photos for professional black and white aesthetic
- **Favicon Optimization (September 2025):** Implemented production-ready favicon system with massive performance improvements
  - Performance: Reduced favicon size from ~22MB to ~7KB (99.97% reduction) using Sharp image optimization
  - Multi-size support: Generated optimized favicons for 16x16, 32x32, and 180x180 (Apple touch icon) 
  - Professional implementation: Proper HTML references with size-specific icons for different devices and displays
  - Automated tooling: Created reusable optimization script for future favicon updates
- **Resend Email Integration (September 2025):** Migrated contact form from SMTP to Resend API for reliable transactional email delivery
  - Backend: Integrated Resend SDK with environment-based recipient configuration (development: asouzamax@gmail.com, production: contact@magenx.tech)
  - API Configuration: Uses RESEND_API_KEY environment variable, sends from 'MaGenX Contact <onboarding@resend.dev>', includes replyTo for direct responses
  - Contact Form: Complete system with Zod schema validation, input sanitization, comprehensive error handling, and trilingual toast notifications (EN/PT-BR/ES)
  - Frontend: react-hook-form + zodResolver integration with shadcn components and full internationalization support
  - Testing: Automated Playwright tests verify successful email submission, form clearing, and error handling
  - Security: Input sanitization (removes dangerous characters), environment-based configuration, and proper API error handling
- **User Journey Pages Created (September 2025):** Created comprehensive "Find Talent" and "Find Work" pages with step-by-step journey explanations before user registration
  - Find Talent page (/find-talent): For companies looking to hire, includes hiring journey (4 steps), benefits section, and CTA
  - Find Work page (/find-work): For professionals seeking jobs, includes career journey (4 steps), benefits section, and CTA
  - Both pages use internationalization system with Portuguese and English translations
  - Added public routes to App.tsx router configuration
  - Fixed navbar links to point to public pages instead of protected dashboard routes
- **Translation System Enhancement:** Extended internationalization with comprehensive translations for both user journey pages covering all sections (hero, steps, benefits, CTA)
- **Mobile Navigation Enhancement (October 2025):** Implemented responsive hamburger menu for mobile devices
  - Desktop navigation (>= 1024px): Inline navigation links with Login/Sign Up buttons
  - Mobile navigation (< 1024px): Hamburger menu using Sheet component (slide-in drawer from right)
  - Mobile menu includes all navigation links (About, Jobs, Find Talent, Find Work, Contact) and action buttons
  - Auto-closes when navigation link is clicked for better UX
  - Language selector accessible on both desktop and mobile
- **Quick Access Visual Integration (October 2025):** Enhanced visual integration of Quick Access section with homepage
  - Changed from solid white background to gradient background (from-primary/10 via-primary/5 to-background)
  - Updated text colors to use foreground color for consistency
  - Improved visual flow between hero section and Quick Access cards
  - Maintains responsive 2-column mobile / 4-column desktop grid layout
- **Jobs Page Creation:** Fixed Jobs page 404 error by creating dedicated /jobs route with proper page structure
- **Navigation Structure:** Final navbar shows About | Jobs | Find Talent | Find Work (Admin removed per user request)
- **Mobile Responsiveness:** Implemented comprehensive mobile-first design with adaptive text sizing, spacing, and button padding
- **Public Pages:** Created Privacy Policy and Terms of Service pages with proper routing
- **Navigation Testing:** Successfully tested all navigation flows including new user journey pages without 404 errors
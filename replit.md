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
- **Email/Notifications**: WebSocket-based real-time notification system
- **File Storage**: Not currently implemented (future enhancement)

## Key Features
- **AI-Powered Matching**: OpenAI integration for intelligent job-professional compatibility analysis
- **Real-time Updates**: WebSocket connections for live notifications and status updates
- **Multi-role Dashboards**: Separate interfaces for companies, professionals, and administrators
- **Profile Management**: Comprehensive profile creation and management for both companies and professionals
- **Job Management**: Full job posting, application, and contract lifecycle management
- **Admin Controls**: System-wide administration capabilities for platform oversight

# Recent Changes

- **Production-Ready Contact System (September 2025):** Implemented complete contact form system with professional email delivery to contact@magenx.tech using secure SMTP configuration
  - Backend: Secure nodemailer implementation with TLS verification, comprehensive SMTP validation, input sanitization, and Zod schema validation
  - Frontend: react-hook-form + zodResolver integration with shadcn components, comprehensive error handling, and translated toast notifications
  - Security: Production-safe TLS settings, input sanitization, environment-based SMTP configuration, and proper error handling
  - Internationalization: Full trilingual support (EN/PT-BR/ES) for all contact form elements, validation messages, and user feedback
  - Integration: Contact page routing (/contact), navbar integration, and shared schema validation between frontend and backend
- **User Journey Pages Created (September 2025):** Created comprehensive "Find Talent" and "Find Work" pages with step-by-step journey explanations before user registration
  - Find Talent page (/find-talent): For companies looking to hire, includes hiring journey (4 steps), benefits section, and CTA
  - Find Work page (/find-work): For professionals seeking jobs, includes career journey (4 steps), benefits section, and CTA
  - Both pages use internationalization system with Portuguese and English translations
  - Added public routes to App.tsx router configuration
  - Fixed navbar links to point to public pages instead of protected dashboard routes
- **Translation System Enhancement:** Extended internationalization with comprehensive translations for both user journey pages covering all sections (hero, steps, benefits, CTA)
- **Navbar Optimization (September 2025):** Removed Admin button from navbar and optimized mobile layout with responsive sizing (logo h-6 md:h-8, navbar height h-14 md:h-16, tighter spacing space-x-3 md:space-x-6)
- **Jobs Page Creation:** Fixed Jobs page 404 error by creating dedicated /jobs route with proper page structure
- **Navigation Structure:** Final navbar shows About | Jobs | Find Talent | Find Work (Admin removed per user request)
- **Mobile Responsiveness:** Implemented comprehensive mobile-first design with adaptive text sizing, spacing, and button padding
- **Public Pages:** Created Privacy Policy and Terms of Service pages with proper routing
- **Navigation Testing:** Successfully tested all navigation flows including new user journey pages without 404 errors
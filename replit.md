# Overview

MaGenX is a job marketplace platform connecting global companies with Latin American tech professionals. It features AI-powered matching, real-time communication, and role-based dashboards for companies, professionals, and administrators. The platform uses a modern full-stack architecture with React for the frontend and Express.js for the backend. Its purpose is to streamline the hiring process for tech talent in Latin America, offering significant market potential by bridging geographical gaps and leveraging advanced AI for efficient talent acquisition.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter for client-side routing.
- **UI Components**: Radix UI primitives with Tailwind CSS for an accessible design system.
- **State Management**: TanStack Query for server state management and caching.
- **Forms**: React Hook Form with Zod validation.
- **Styling**: Tailwind CSS with CSS custom properties.

## Backend Architecture
- **Framework**: Express.js with TypeScript.
- **Authentication**: Email/password with session-based persistence.
- **Database**: PostgreSQL with Drizzle ORM.
- **Real-time Communication**: WebSocket server for live updates.
- **API Design**: RESTful endpoints with standardized error handling.

## Data Storage
- **Primary Database**: PostgreSQL hosted on Neon, using Drizzle ORM.
- **Session Storage**: PostgreSQL-backed for authentication.
- **Migrations**: Drizzle Kit for schema management.

## Authentication & Authorization
- **Provider**: Email/password with bcrypt hashing.
- **Session Management**: Express sessions with PostgreSQL storage.
- **Role-based Access**: Three user roles (company, professional, admin) with route protection.
- **Security**: Secure cookies and session timeout handling.

## UI/UX Decisions
- Consistent design system using Radix UI and Tailwind CSS.
- Multi-role dashboards tailored for companies, professionals, and administrators.
- Comprehensive profile management for all user types.
- Mobile-first design with responsive navigation and adaptive elements.
- Trilingual support (EN/PT-BR/ES) across the platform.

## Technical Implementations
- **AI-Powered Matching**: Integration with OpenAI for job-professional compatibility analysis.
- **Real-time Updates**: WebSocket connections for live notifications.
- **PDF Processing**: Adobe PDF Extract API for resume text extraction.
- **Email Service**: Resend API for transactional email delivery.
- **File Storage**: Google Cloud Storage (GCS) for resume storage.
- **Secure OAuth Redirects**: Implemented for preserving context during authentication flows with multi-layer security validation.
- **New User Job Application Flow**: OAuth callbacks detect new users and preserve job application context through profile creation.
- **Job Recommendations System**: Skill-based matching algorithm that calculates match scores and returns top 10 relevant opportunities.
- **Dashboard Navigation**: Direct links to job listings from professional dashboard for improved job discovery.
- **Optimized Favicon System**: Drastically reduced favicon size for performance.
- **Professional Profile Update**: Secure backend endpoint with comprehensive validation.
- **Applied Jobs Tracking**: Integrated into the professional dashboard.
- **New User Onboarding**: Streamlined flow with accurate error handling for profile creation.

# External Dependencies

- **Database**: Neon PostgreSQL.
- **AI Services**: OpenAI GPT-5 API.
- **PDF Processing**: Adobe PDF Extract API.
- **Email Service**: Resend API.
- **File Storage**: Google Cloud Storage (GCS).
- **UI Component Library**: shadcn/ui (built on Radix UI).
```
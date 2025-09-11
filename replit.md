# Overview

TalentX is a comprehensive job marketplace platform that connects global companies with Latin American tech professionals. The application features AI-powered matching capabilities, real-time communication through WebSockets, and role-based dashboards for companies, professionals, and administrators. Built with a modern full-stack architecture using React for the frontend and Express.js for the backend.

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
- **Authentication**: Replit Auth integration with session-based authentication using Passport.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live notifications and updates
- **API Design**: RESTful endpoints with standardized error handling and logging middleware

## Data Storage
- **Primary Database**: PostgreSQL hosted on Neon with connection pooling
- **ORM**: Drizzle with schema-first approach and type generation
- **Session Storage**: PostgreSQL-backed session store for authentication persistence
- **Migrations**: Drizzle Kit for database schema management and migrations

## Authentication & Authorization
- **Provider**: Replit OpenID Connect (OIDC) integration
- **Session Management**: Express sessions with PostgreSQL storage
- **Role-based Access**: Three user roles (company, professional, admin) with route-level protection
- **Security**: CSRF protection, secure cookies, and session timeout handling

## External Dependencies
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI GPT-5 API for job-professional matching and analysis
- **Authentication**: Replit OIDC for user authentication
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
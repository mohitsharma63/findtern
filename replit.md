# Findtern

## Overview

Findtern is a web application for connecting students with internship opportunities. The project is currently focused on the authentication flow, specifically a sign-up page that allows users to create accounts with email, phone number, and password. The application follows modern SaaS design patterns inspired by Linear, Notion, and fintech applications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Style**: RESTful JSON API
- **Current Endpoints**: `/api/auth/signup` for user registration

### Data Storage
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Location**: `shared/schema.ts` contains database tables and Zod validation schemas
- **Current Storage**: In-memory storage (`MemStorage` class) - PostgreSQL integration is configured but not yet active
- **Database Migrations**: Drizzle Kit for schema migrations (`./migrations` directory)

### Shared Code Pattern
- The `shared/` directory contains code shared between frontend and backend
- Database schemas with Drizzle ORM definitions
- Zod validation schemas generated from Drizzle schemas using `drizzle-zod`
- TypeScript types inferred from schemas for type safety across the stack

### Build System
- **Development**: Vite dev server with HMR, Express API server running concurrently
- **Production**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

## External Dependencies

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migration and schema push tool

### UI Component Libraries
- **Radix UI**: Headless UI primitives (dialog, dropdown, select, checkbox, etc.)
- **shadcn/ui**: Pre-styled components using Radix + Tailwind
- **Lucide React**: Icon library
- **React Icons**: Additional icons (Google icon for OAuth button)

### Form & Validation
- **Zod**: Schema validation library
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Zod resolver for React Hook Form

### Development Tools
- **Replit Plugins**: Dev banner, cartographer, runtime error overlay for Replit environment
- **tsx**: TypeScript execution for development server
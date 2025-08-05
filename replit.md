# Baltek Jobs Platform

## Overview

This is a full-stack job platform application built with React, Express, and TypeScript. The application allows users to browse jobs, apply to positions, and manage their profiles. It integrates with the external Baltek API (https://api.baltek.net/api/) for backend functionality while providing a modern, responsive frontend experience.

The application features a job search interface with filtering capabilities, user authentication, profile management, and a chat system for employer-candidate communication. The frontend is built with shadcn/ui components and Tailwind CSS for a polished user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Development Setup**: Vite middleware integration for hot module replacement
- **API Strategy**: Proxy architecture - the Express server primarily serves the frontend and provides health endpoints, while business logic is handled by the external Baltek API
- **Storage**: No local database - all data operations are handled through the external API

### Data Management
- **Validation**: Zod schemas for type-safe form validation and API response parsing
- **API Client**: Custom ApiClient class with automatic token refresh and error handling
- **Authentication**: JWT-based authentication with access and refresh tokens stored in localStorage
- **State Caching**: TanStack Query provides intelligent caching and background updates

### User Interface Design
- **Component System**: Modular component architecture with reusable UI components
- **Responsive Design**: Mobile-first responsive design using Tailwind CSS
- **Theme System**: CSS custom properties for consistent theming with light/dark mode support
- **Interactive Elements**: Advanced UI patterns including infinite scroll, modals, dropdowns, and real-time search

### Authentication & Authorization
- **Authentication Flow**: Standard JWT flow with login/register endpoints
- **Token Management**: Automatic token refresh with retry logic for expired tokens
- **Route Protection**: Higher-order components for protected and public routes
- **Session Persistence**: Local storage for token persistence across browser sessions

## External Dependencies

### Core Framework Dependencies
- **React**: Frontend framework with TypeScript support
- **Express**: Backend server framework
- **Vite**: Build tool and development server
- **TanStack Query**: Server state management and caching

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

### Form and Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation library
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Database and API
- **Baltek API**: External API service (https://api.baltek.net/api/) for all backend operations
- **Drizzle ORM**: Database toolkit (configured for PostgreSQL but not actively used due to external API)
- **@neondatabase/serverless**: PostgreSQL database driver (for potential future local database needs)

### Development Tools
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Autoprefixer

### Authentication & File Handling
- **React Dropzone**: File upload functionality for resumes and documents
- **Date-fns**: Date manipulation and formatting utilities
- **Nanoid**: Unique ID generation

The application is designed to be deployed on Replit with the external Baltek API handling all business logic, user data, and job management functionality.
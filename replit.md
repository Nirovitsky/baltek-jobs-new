# Baltek Jobs Platform

## Overview

This project is a professional job search platform built with React and Express, designed to provide a seamless job browsing and application experience. It integrates exclusively with the external Baltek API (https://api.baltek.net/api/) for all backend functionalities. Key capabilities include a modern two-column job browsing interface, comprehensive filtering, infinite scroll, phone-based user authentication, profile management, a streamlined job application system with resume upload, and real-time chat capabilities. The platform aims to offer a user-friendly and efficient tool for job seekers, leveraging a clean UI built with shadcn/ui and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.
UI/UX Requirements: Two-column layout (jobs left, details right), infinite scroll, primary color #1877F2, simple interface for average users.
Backend Integration: External Baltek API (https://api.baltek.net/api/) for all data operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **UI Library**: shadcn/ui components (built on Radix UI)
- **Styling**: Tailwind CSS with custom CSS variables
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **User Interface Design**: Modular component architecture, mobile-first responsive design, CSS custom properties for themin, infinite scroll, modals, dropdowns, and real-time search.
- **Authentication Flow**: JWT-based authentication with access and refresh tokens, automatic token refresh, route protection, and local storage for session persistence.

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Development Setup**: Vite middleware integration
- **API Strategy**: Proxy architecture where the Express server serves the frontend and health endpoints, with business logic handled by the external Baltek API.
- **Storage**: No local database; all data operations through the external Baltek API.

### Technical Implementations & Features
- **Data Validation**: Zod schemas for type-safe form validation and API response parsing.
- **API Client**: Custom `ApiClient` class with automatic token refresh and error handling.
- **Authentication**: JWT-based with access and refresh tokens stored in localStorage.
- **State Caching**: TanStack Query for intelligent caching and background updates.
- **Job Display**: Job cards with job title, salary, skills tags, company details (logo, name, location), and detailed job views upon click.
- **Filtering**: Comprehensive filtering by salary range, currency, payment frequency, minimum education level, job types, and workplace types. Filter options are API-driven (enum-based).
- **Pagination**: Offset-based pagination with smart prefetching for infinite scroll.
- **Loading States**: Skeleton components for smooth visual feedback during loading.
- **Job Application**: Streamlined form for cover letter and CV/resume upload (both required).
- **User Profile**: Comprehensive profile management with integration for professional links, education, experience, and projects. Real-time stats and profile completion percentage. Profile editing is fully integrated with CRUD operations.
- **Resume Management**: Upload up to 3 resumes (PDF, DOC, DOCX, max 10MB) with drag-and-drop, validation, listing, view/download, and delete functionality.
- **Settings Management**: Comprehensive settings page with profile configuration, notification preferences, privacy controls, and account management including password changes and data export.
- **Chat System**: Real-time messaging interface fully integrated with Baltek API. Features WebSocket connectivity for instant message delivery, conversation management, recruiter communication, and message history. No mock data - all functionality uses authentic API endpoints.
- **Company Profile Pages**: Dedicated company profile pages with organization details, statistics, open positions, and comprehensive company information. Accessible via clickable company links in job listings and job details.

## External Dependencies

### Core Frameworks
- **React**: Frontend framework.
- **Express**: Backend server framework.
- **Vite**: Build tool and development server.
- **TanStack Query**: Server state management and caching.

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Headless UI components.
- **shadcn/ui**: Pre-built component library.
- **Lucide React**: Icon library.

### Form and Validation
- **React Hook Form**: Form state management.
- **Zod**: Schema validation library.
- **@hookform/resolvers**: Integration for React Hook Form and Zod.

### Database and API Integration
- **Baltek API**: External API service (https://api.baltek.net/api/) for all backend operations.

### Utilities
- **React Dropzone**: File upload functionality.
- **Date-fns**: Date manipulation and formatting.
- **Nanoid**: Unique ID generation.
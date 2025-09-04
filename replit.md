# Baltek Jobs Platform

## Overview

The Baltek Jobs Platform is a professional job search application (React & Express) designed for streamlined job browsing and application. It integrates exclusively with the external Baltek API. Key capabilities include a modern two-column job browsing interface, comprehensive filtering, infinite scroll, phone-based user authentication (via OAuth2), profile management, a job application system with resume upload, and real-time chat. The platform aims to be a user-friendly and efficient tool for job seekers, leveraging a clean UI built with shadcn/ui and Tailwind CSS. The business vision is to provide a comprehensive, intuitive, and efficient platform that connects job seekers with opportunities, enhancing their career progression and simplifying the recruitment process.

## User Preferences

Preferred communication style: Simple, everyday language.
UI/UX Requirements: Two-column layout (jobs left, details right), infinite scroll, primary color #1877F2, simple interface for average users. Enhanced date picker with easy year/month selection for better user experience in profile forms.
Backend Integration: External Baltek API (https://api.baltek.net/api/) for all data operations.
Authentication: OAuth2-only authentication system - all login/register functionality delegated to OAuth2 backend. No dedicated login/register pages required.

## System Architecture

### Frontend Architecture
- **Framework & Libraries**: React 18 with TypeScript and Vite, shadcn/ui components (Radix UI), Tailwind CSS with custom CSS variables for comprehensive dark mode, Wouter for routing, TanStack Query for server state management, React Hook Form with Zod for form validation.
- **User Interface Design**: Modular component architecture, mobile-first responsive design, CSS custom properties for theming, infinite scroll, modals, dropdowns, real-time search with visual feedback and skeleton loaders, consistent layout with unified body widths.
- **Authentication Flow**: OAuth2 PKCE-based authentication with JWT tokens, automatic token refresh, route protection, and local storage for session persistence. All POST actions require authentication.
- **Features**: "Copy URL" for job details, rich link preview cards for job URLs in chat, comprehensive file upload for chat attachments, robust notification system, simplified settings page (language/theme selection, account deletion, info links). Also includes a 4-step onboarding flow for new users.

### Backend Architecture
- **Server**: Minimal Express.js server primarily serving the React application via Vite middleware. No API routing or proxy logic.
- **API Strategy**: Direct frontend-to-API calls to `https://api.baltek.net/api`.
- **Authentication**: Client-side JWT management with localStorage persistence and automatic refresh.
- **WebSocket**: Direct connection to `wss://api.baltek.net/ws/chat/` for real-time messaging.
- **Storage**: No local database; all data operations are handled through the external Baltek API.

### Technical Implementations & Features
- **API Client**: A comprehensive `ApiClient` class managing all Baltek API endpoints, authentication, token refresh, and error handling.
- **Job Display & Filtering**: Job cards with detailed views; dynamic filtering options from API data.
- **Job Application**: Supports "Quick Apply" and "Apply Now" with optional cover letter and resume upload (up to 3 files, PDF, DOC, DOCX, max 10MB) with drag-and-drop.
- **User Profile**: Comprehensive profile management with CRUD operations for professional links, education, experience, and projects.
- **Chat System**: Real-time messaging via WebSocket, conversation management, history, robust file attachment support with progress indicators, and clickable company profile links.
- **Company Profile Pages**: Dedicated company profiles accessible from job listings and chat.

## Recent Changes

- **September 3, 2025**: Successfully imported GitHub project to Replit environment. Installed all dependencies, resolved TypeScript compilation issues by adding missing useTranslation import to profile-modal.tsx. Configured Vite dev server with proper host settings (0.0.0.0:5000, allowedHosts: true) for Replit proxy compatibility. Set up deployment configuration for autoscale deployment with npm build/start scripts. Application is running successfully with frontend and backend integrated via ViteExpress on port 5000. All workflows are operational and the platform is ready for development and deployment.
- **September 4, 2025**: Replaced MUI DatePicker with enhanced shadcn DatePicker for all date of birth fields. The new date picker features easy year navigation with dropdown selectors for both month and year, making it much more user-friendly for selecting birth dates from many years ago. Updated both profile modal and onboarding page to use the consistent shadcn/ui DatePicker component with proper date validation and format handling. Fixed critical profile editing bugs: corrected gender field mapping from "male"/"female" to "m"/"f" to match API expectations, resolved applications API error by adding missing user ID parameter to prevent "owner=undefined" errors, fixed avatar upload endpoint from "/users/short/" to "/users/{id}/", and ensured date format conversion from YYYY-MM-DD (date picker format) to DD.MM.YYYY (API format) for proper date_of_birth handling. Standardized all date pickers across the profile modal (education, experience, and projects sections) to use the same enhanced shadcn DatePicker with year/month dropdowns for consistent user experience.

## External Dependencies

- **React**: Frontend framework.
- **Express**: Minimal backend server framework.
- **Vite**: Build tool and development server.
- **TanStack Query**: Server state management and caching.
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Headless UI components.
- **shadcn/ui**: Pre-built component library.
- **Lucide React**: Icon library.
- **React Hook Form**: Form state management.
- **Zod**: Schema validation library.
- **@hookform/resolvers**: Integration for React Hook Form and Zod.
- **Baltek API**: External API service (`https://api.baltek.net/api/`) for all backend operations.
- **React Dropzone**: File upload functionality.
- **Date-fns**: Date manipulation and formatting.
- **Nanoid**: Unique ID generation.
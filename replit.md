# Baltek Jobs Platform

## Overview

The Baltek Jobs Platform is a professional job search application built with React and Express, designed to offer a streamlined job browsing and application experience by integrating exclusively with the external Baltek API. Key capabilities include a modern two-column job browsing interface, comprehensive filtering, infinite scroll, phone-based user authentication, profile management, a job application system with resume upload, and real-time chat. The platform aims to be a user-friendly and efficient tool for job seekers, leveraging a clean UI built with shadcn/ui and Tailwind CSS. The business vision is to provide a comprehensive, intuitive, and efficient platform that connects job seekers with opportunities, enhancing their career progression and simplifying the recruitment process.

## User Preferences

Preferred communication style: Simple, everyday language.
UI/UX Requirements: Two-column layout (jobs left, details right), infinite scroll, primary color #1877F2, simple interface for average users. Enhanced date picker with easy year/month selection for better user experience in profile forms.
Backend Integration: External Baltek API (https://api.baltek.net/api/) for all data operations.
Authentication: OAuth2-only authentication system - all login/register functionality delegated to OAuth2 backend. No dedicated login/register pages required.

## System Architecture

### Frontend Architecture
- **Framework & UI**: React 18 with TypeScript and Vite, using shadcn/ui components (Radix UI) and Tailwind CSS with custom CSS variables for comprehensive dark mode support.
- **Routing & State Management**: Wouter for routing and TanStack Query (React Query) for server state management, caching, and background updates.
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation.
- **User Interface Design**: Modular component architecture, mobile-first responsive design, CSS custom properties for theming, infinite scroll, modals, dropdowns, real-time search with visual feedback and skeleton loaders, and consistent layout with unified body widths. Includes a "Copy URL" feature and rich link preview cards for job URLs in chat messages.
- **Authentication Flow**: OAuth2 PKCE-based authentication with JWT tokens, automatic token refresh, route protection, and local storage for session persistence. Authentication is handled exclusively by the OAuth2 server; no client-side login/register forms are present. All POST actions require authentication.
- **Features**: Robust notification system, simplified settings page (language/theme selection, account deletion, info links), and comprehensive file upload functionality for chat attachments. Implementation of a comprehensive 4-step onboarding flow with optional fields and progress tracking, guarding authenticated routes until completion.

### Backend Architecture
- **Server**: Minimal Express.js server primarily serving the React application via Vite middleware. No API routing or proxy logic.
- **API Strategy**: Direct frontend-to-API calls to `https://api.baltek.net/api` without any local proxy or middleware.
- **Authentication**: Client-side JWT management with localStorage persistence and automatic refresh.
- **WebSocket**: Direct connection to `wss://api.baltek.net/ws/chat/` for real-time messaging.
- **Storage**: No local database; all data operations are handled through the external Baltek API.

### Technical Implementations & Features
- **API Client**: A comprehensive `ApiClient` class containing 45+ methods covering all Baltek API endpoints, handling authentication, automatic token refresh, and robust error handling. All POST/PATCH/DELETE operations require authentication. All API requests utilize TanStack Query for consistent data fetching, caching, and state management, including mutations for file uploads, account deletion, OAuth login, and all data queries with proper error handling, optimistic updates, and cache invalidation strategies.
- **Job Display & Filtering**: Job cards display essential information with detailed views. Comprehensive filtering options are dynamically generated from API data.
- **Job Application**: Supports both "Quick Apply" and regular "Apply Now" with optional cover letter and resume upload (up to 3 files, PDF, DOC, DOCX, max 10MB) with drag-and-drop.
- **User Profile**: Comprehensive profile management with CRUD operations for professional links, education, experience, and projects.
- **Chat System**: Real-time messaging with WebSocket integration, conversation management, message history, and robust file attachment support with progress indicators. Chat includes clickable company profile links that redirect to company pages. Enhanced media attachment display in chat for cleaner viewing.
- **Company Profile Pages**: Dedicated company profiles accessible from job listings.

## External Dependencies

- **React**: Frontend framework.
- **Express**: Backend server framework (minimal use).
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
# Baltek Jobs Platform

## Overview

The Baltek Jobs Platform is a professional job search application built with React and Express, designed to offer a streamlined job browsing and application experience. It integrates exclusively with the external Baltek API for all backend functionalities. Key capabilities include a modern two-column job browsing interface, comprehensive filtering, infinite scroll, phone-based user authentication, profile management, a job application system with resume upload, and real-time chat. The platform aims to be a user-friendly and efficient tool for job seekers. The business vision is to provide a comprehensive, intuitive, and efficient platform that connects job seekers with opportunities, enhancing their career progression and simplifying the recruitment process.

## User Preferences

Preferred communication style: Simple, everyday language.
UI/UX Requirements: Two-column layout (jobs left, details right), infinite scroll, primary color #1877F2, simple interface for average users. Enhanced date picker with easy year/month selection for better user experience in profile forms.
Backend Integration: External Baltek API (https://api.baltek.net/api/) for all data operations.
Authentication: OAuth2-only authentication system - all login/register functionality delegated to OAuth2 backend. No dedicated login/register pages required.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **UI Library**: shadcn/ui components (built on Radix UI), Tailwind CSS for styling with comprehensive dark mode support.
- **Routing**: Wouter
- **State Management**: TanStack Query for server state management, caching, and background updates.
- **Form Handling**: React Hook Form with Zod validation.
- **User Interface Design**: Modular component architecture, mobile-first responsive design, CSS custom properties for theming, infinite scroll, modals, dropdowns, real-time search with visual feedback and skeleton loaders. Consistent layout system with unified body widths.
- **Authentication Flow**: OAuth2 PKCE-based authentication with JWT tokens, automatic token refresh, route protection, and local storage for session persistence. Authentication handled exclusively by OAuth2 server - no client-side login/register forms. All POST actions require authentication.
- **Features**: "Copy URL" for job details, rich link preview cards for job URLs in chat messages, comprehensive file upload functionality for chat attachments, robust notification system. Simplified settings page with language/theme selection, account deletion, and info links. Comprehensive 4-step onboarding flow (Personal Info → Experience → Education → Completion) with optional fields and progress tracking.

### Backend Architecture
- **Server**: Minimal Express.js server primarily serving the React application via Vite middleware. No API routing or proxy logic.
- **API Strategy**: Direct frontend-to-API calls to `https://api.baltek.net/api`.
- **Authentication**: Client-side JWT management with localStorage persistence and automatic refresh.
- **WebSocket**: Direct connection to `wss://api.baltek.net/ws/chat/` for real-time messaging.
- **Storage**: No local database; all data operations are handled through the external Baltek API.
- **Security Model**: Client/server separation with all API credentials managed client-side.

### Technical Implementations & Features
- **API Client**: Comprehensive `ApiClient` class with 45+ methods covering Baltek API endpoints, handling authentication, token refresh, and error handling. All POST/PATCH/DELETE operations require authentication.
- **Job Display & Filtering**: Job cards with essential information and detailed views. Dynamic filtering options.
- **Job Application**: Supports "Quick Apply" and regular "Apply Now" with optional cover letter and resume upload (up to 3 files, PDF, DOC, DOCX, max 10MB) with drag-and-drop.
- **User Profile**: Comprehensive profile management with CRUD operations for professional links, education, experience, and projects.
- **Chat System**: Real-time messaging with WebSocket integration, conversation management, message history, robust file attachment support with progress indicators, and clickable company profile links. FileAttachment component for consistent display of various file types (images, videos, audio, documents, archives) with previews and proper icons.
- **Company Profile Pages**: Dedicated company profiles accessible from job listings.

## External Dependencies

- **React**: Frontend framework.
- **Express**: Backend server framework.
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
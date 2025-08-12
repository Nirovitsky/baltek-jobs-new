# Baltek Jobs Platform

## Overview

This project is a professional job search platform built with React and Express, designed to provide a seamless job browsing and application experience. It integrates exclusively with the external Baltek API (https://api.baltek.net/api/) for all backend functionalities. Key capabilities include a modern two-column job browsing interface, comprehensive filtering, infinite scroll, phone-based user authentication, profile management, a streamlined job application system with resume upload, and real-time chat capabilities. The platform aims to offer a user-friendly and efficient tool for job seekers, leveraging a clean UI built with shadcn/ui and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.
UI/UX Requirements: Two-column layout (jobs left, details right), infinite scroll, primary color #1877F2, simple interface for average users. Enhanced date picker with easy year/month selection for better user experience in profile forms.
Backend Integration: External Baltek API (https://api.baltek.net/api/) for all data operations.

## Recent Changes (August 12, 2025)

- **Migration Completed**: Successfully migrated project from Replit Agent to standard Replit environment
- **Infinite Scroll Fix**: Fixed infinite scroll pagination logic in jobs list - was not loading jobs after initial 10 due to incorrect offset calculation and intersection observer issues
- **Search Input Responsiveness**: Fixed critical search input locking issue during debounce period. Implemented uncontrolled input approach with local ref management to prevent React Query re-renders from interfering with typing. Set debounce delay to 500ms for optimal user experience. Added spinning loader visual feedback during search processing.
- **User Experience Enhancements**: Added visual feedback for search operations, improved intersection observer reliability, and ensured input field remains fully responsive during all search operations
- **Architecture Overhaul**: Completely removed Express proxy server that previously acted as middleware between frontend and external API
- **Direct API Integration**: All API requests now go directly to https://api.baltek.net/api from the React frontend
- **Unified ApiClient**: Consolidated all API interactions into a single `ApiClient` class with comprehensive method coverage (40+ methods)
- **Authentication Endpoints Fixed**: Updated login endpoint from `/auth/login` to `/token/` to match backend expectations
- **Complete Endpoint Alignment**: All API endpoints now use proper trailing slash format (`/token/`, `/token/refresh/`, `/register/`, `/change-password/`, `/chat/messages/`)
- **Authentication Flow**: JWT token management handled entirely client-side with automatic refresh capabilities
- **WebSocket Direct Connection**: Chat connects directly to wss://api.baltek.net/ws/chat/ for real-time messaging
- **Minimalist Server**: Express server now only serves React app via Vite middleware - no API routing or proxy logic
- **Security Enhancement**: Eliminated server-side API key exposure by moving all external API calls to client-side
- **Performance Optimization**: Removed unnecessary network hops through local proxy server
- **Code Simplification**: Removed all server-side API endpoint handlers and proxy configuration
- **TypeScript Fixes**: Resolved all type errors and improved code reliability
- **Chat File Attachments**: Added comprehensive file upload functionality with progress indicators, attachment previews, and WebSocket integration using `/files/` endpoint. Fixed API field name from "file" to "path" for uploads. Enhanced message filtering to show attachment-only messages. Added real-time upload progress with visual indicators and error handling. Modernized attachment display with view/download buttons and proper ordering (attachments appear before text).
- **Notification System**: Implemented comprehensive notification functionality with robust error handling. The notification endpoints (`/notifications/`, mark as read, mark all as read, delete) are fully integrated with the Baltek API. Features proper date validation, graceful API fallback with "Coming Soon" messages when endpoints return 500 errors, loading states, notification type mapping, and configurable pagination (set to 15 notifications per page). Added robust date parsing with fallbacks to prevent crashes from invalid date values.
- **Layout Consistency Enhancement**: Implemented standardized layout system with consistent body widths across all pages to prevent page shifting during navigation. Created unified `.layout-container-body` and `.layout-container-narrow` CSS classes. Updated all major pages (jobs, profile, applications, settings, chat, notifications, bookmarks, company-profile) to use consistent container widths while maintaining navbar slightly wider than content for proper visual hierarchy. Fixed breadcrumb navigation to use the same layout container, eliminating horizontal layout shifts between pages.
- **Notification UX Improvement**: Removed popup notifications dropdown from navbar. Bell icon now directly links to `/notifications` page for cleaner user experience without popup interruptions.
- **Navbar Width Alignment**: Aligned navbar container width to match body content width (1320px) for consistent layout alignment.
- **Settings Page Redesign**: Completely simplified settings page by removing profile, notifications, privacy, account sections. Added language selection (Turkmen, English, Russian), theme selector (light, dark, auto), delete account functionality, and information links (About Us, Contact Us, Terms and Agreement, Privacy Policy). Created dedicated pages for About Us, Contact Us, Terms and Agreement, and Privacy Policy with comprehensive content and proper routing. Layout improved with single card design containing all settings sections, delete account moved to bottom section with visual separation.

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
- **Server**: Minimal Express.js server with Vite middleware for development only
- **Development Setup**: Vite middleware integration for React app serving
- **API Strategy**: Direct frontend-to-API calls to https://api.baltek.net/api with zero local proxy or middleware
- **Authentication**: Client-side JWT management with localStorage persistence and automatic refresh
- **WebSocket**: Direct connection to wss://api.baltek.net/ws/chat/ for real-time messaging
- **Storage**: No local database; all data operations through external Baltek API
- **Security Model**: Client/server separation with all API credentials managed client-side

### Technical Implementations & Features
- **Data Validation**: Zod schemas for type-safe form validation and API response parsing.
- **API Client**: Comprehensive `ApiClient` class with 45+ methods covering all Baltek API endpoints, automatic token refresh, and robust error handling. Includes methods for jobs, applications, profile management, chat, organizations, authentication, file operations, notifications, password changes, account deletion, and data export. All endpoints use proper trailing slash format to match backend expectations.
- **Authentication**: JWT-based with access and refresh tokens stored in localStorage.
- **State Caching**: TanStack Query for intelligent caching and background updates.
- **Job Display**: Job cards with job title, salary, skills tags, company details (logo, name, location), and detailed job views upon click.
- **Filtering**: Comprehensive filtering by salary range, currency, payment frequency, minimum education level, job types, and workplace types. Filter options are dynamically generated from actual job data via API calls instead of hardcoded values.
- **Pagination**: Offset-based pagination with smart prefetching for infinite scroll.
- **Loading States**: Skeleton components for smooth visual feedback during loading.
- **Job Application**: Dual application system with Quick Apply (instant, no documents required) and regular Apply Now (optional cover letter and resume). Both applications use the same API endpoint with flexible document requirements.
- **User Profile**: Comprehensive profile management with integration for professional links, education, experience, and projects. Real-time stats and profile completion percentage. Profile editing is fully integrated with CRUD operations.
- **Resume Management**: Upload up to 3 resumes (PDF, DOC, DOCX, max 10MB) with drag-and-drop, validation, listing, view/download, and delete functionality.
- **Settings Management**: Comprehensive settings page with profile configuration, notification preferences, privacy controls, and account management including password changes and data export.
- **Chat System**: Real-time messaging interface with direct WebSocket connection to Baltek API (wss://api.baltek.net/ws/chat/?token=TOKEN). Features instant message delivery, conversation management, recruiter communication, and message history. Authentication via query parameter token passing, real-time message display, and proper message format handling (send_message/message_delivered). Message structure uses text/owner/date_created fields matching API response format. **File Attachments**: Comprehensive file upload support with paperclip button, drag-and-drop, progress indicators, attachment previews, and removal functionality. Files uploaded to `/files/` endpoint and sent via WebSocket as attachment IDs array.
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
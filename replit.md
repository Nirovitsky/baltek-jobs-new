# Baltek Jobs Platform

## Overview

The Baltek Jobs Platform is a professional job search application built with React and Express, designed to offer a streamlined job browsing and application experience. It integrates exclusively with the external Baltek API for all backend functionalities. Key capabilities include a modern two-column job browsing interface, comprehensive filtering, infinite scroll, phone-based user authentication, profile management, a job application system with resume upload, and real-time chat. The platform aims to be a user-friendly and efficient tool for job seekers, leveraging a clean UI built with shadcn/ui and Tailwind CSS. The business vision is to provide a comprehensive, intuitive, and efficient platform that connects job seekers with opportunities, enhancing their career progression and simplifying the recruitment process.

## User Preferences

Preferred communication style: Simple, everyday language.
UI/UX Requirements: Two-column layout (jobs left, details right), infinite scroll, primary color #1877F2, simple interface for average users. Enhanced date picker with easy year/month selection for better user experience in profile forms.
Backend Integration: External Baltek API (https://api.baltek.net/api/) for all data operations.
Authentication: OAuth2-only authentication system - all login/register functionality delegated to OAuth2 backend. No dedicated login/register pages required.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **UI Library**: shadcn/ui components (built on Radix UI)
- **Styling**: Tailwind CSS with custom CSS variables, ensuring comprehensive dark mode support by replacing hardcoded colors with theme-aware CSS variables.
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query) for server state management, caching, and background updates.
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation.
- **User Interface Design**: Modular component architecture, mobile-first responsive design, CSS custom properties for theming, infinite scroll, modals, dropdowns, and real-time search with visual feedback and skeleton loaders. Consistent layout system with unified body widths across pages.
- **Authentication Flow**: OAuth2 PKCE-based authentication with JWT tokens, automatic token refresh, route protection, and local storage for session persistence. Authentication handled exclusively by OAuth2 server - no client-side login/register forms. All POST actions require authentication.
- **Features**: Includes a "Copy URL" feature for job details, and rich link preview cards for job URLs in chat messages. Comprehensive file upload functionality for chat attachments. Robust notification system integrated with the Baltek API. Simplified settings page with language/theme selection, account deletion, and info links.

### Backend Architecture
- **Server**: Minimal Express.js server primarily serving the React application via Vite middleware. No API routing or proxy logic.
- **API Strategy**: Direct frontend-to-API calls to `https://api.baltek.net/api` without any local proxy or middleware.
- **Authentication**: Client-side JWT management with localStorage persistence and automatic refresh.
- **WebSocket**: Direct connection to `wss://api.baltek.net/ws/chat/` for real-time messaging.
- **Storage**: No local database; all data operations are handled through the external Baltek API.
- **Security Model**: Client/server separation with all API credentials managed client-side.

### Technical Implementations & Features
- **API Client**: A comprehensive `ApiClient` class containing 45+ methods covering all Baltek API endpoints, handling authentication, automatic token refresh, and robust error handling. All POST/PATCH/DELETE operations require authentication.
- **Job Display & Filtering**: Job cards display essential information with detailed views. Comprehensive filtering options are dynamically generated from API data.
- **Job Application**: Supports both "Quick Apply" and regular "Apply Now" with optional cover letter and resume upload (up to 3 files, PDF, DOC, DOCX, max 10MB) with drag-and-drop.
- **User Profile**: Comprehensive profile management with CRUD operations for professional links, education, experience, and projects.
- **Chat System**: Real-time messaging with WebSocket integration, conversation management, message history, and robust file attachment support with progress indicators.
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

## Environment Variables Configuration

The application requires the following environment variables configured in Replit Secrets:
- **VITE_OAUTH_CLIENT_ID**: OAuth2 client identifier for Baltek API authentication
- **VITE_OAUTH_AUTH_URL**: Authorization endpoint (https://api.baltek.net/oauth/authorize/)
- **VITE_OAUTH_TOKEN_URL**: Token exchange endpoint (https://api.baltek.net/oauth/token/)
- **PORT**: Server port (defaults to 5000)

## Recent Migration Notes

- Successfully migrated from Replit Agent to standard Replit environment (January 2025)
- All OAuth environment variables properly configured and verified working (VITE_OAUTH_CLIENT_ID, VITE_OAUTH_AUTH_URL, VITE_OAUTH_TOKEN_URL)
- Application successfully connecting to Baltek API and loading job data
- Vite development server running on port 5000 with proper client/server separation
- Updated bookmarks and applications pages to use consistent JobList component with search functionality
- Implemented proper scrollable layout matching the main jobs page design
- Migration completed with all pages using unified job list interface
- **Updated API Endpoint**: Changed from `/users/me/` to `/users/short/` due to API changes, updating all references including authentication, onboarding, and profile picture upload
- Project import completed: All checklist items verified and environment fully configured
- **Migration Completed (January 15, 2025)**: Full migration from Replit Agent environment to standard Replit completed successfully with all dependencies installed, OAuth secrets configured, and application verified working
- **Project Import Completed (January 15, 2025)**: Successfully migrated project from Replit Agent to standard Replit environment with all checklist items verified and OAuth environment variables properly configured

## New Onboarding System (January 2025)

- Implemented comprehensive 4-step onboarding flow with progress tracking
- Added `is_jobs_onboarding_completed` field to user profile schema
- Created playful onboarding pages with visual progress indicators
- Onboarding steps: Personal Info → Experience → Education → Completion
- Built OnboardingGuard component to protect authenticated routes
- Users must complete onboarding before accessing protected pages
- Onboarding completion sets `is_jobs_onboarding_completed` to true
- Seamless integration with existing authentication and routing system

## January 2025 Updates

- **Flexible Onboarding**: Made all onboarding fields optional for better user experience
- **Environment Variables**: Successfully configured OAuth authentication variables (VITE_OAUTH_CLIENT_ID, VITE_OAUTH_AUTH_URL, VITE_OAUTH_TOKEN_URL)
- **Code Quality**: Fixed TypeScript errors in server configuration
- **User Experience**: Added clear messaging that all onboarding fields are optional and can be skipped
- **Migration Completed**: Full migration from Replit Agent to standard Replit environment successful
- **Design Consistency**: Updated onboarding pages with minimalistic design matching app's consistent styling - removed gradient backgrounds, simplified step indicators, used standard card components, and applied consistent spacing and colors throughout
- **API Fixes**: Fixed universities endpoint in onboarding from `/users/universities/` to `/universities/` and made it accessible without authentication
- **Enhanced Date Input**: Implemented shadcn Calendar component with dropdown layout for intuitive date selection across all onboarding pages
- **Multiple Entries**: Users can now add multiple work experiences and education entries during onboarding
- **Improved UX**: Simplified company name to text input only, better visual feedback with cards for added entries
- **Clean UI**: Consistent card-based layout with easy-to-use add/remove functionality
- **Onboarding Completion Fix (January 15, 2025)**: Fixed PATCH method error in onboarding completion by updating `completeOnboarding` method to use proper `updateProfile` endpoint
- **Scroll Behavior Fix (January 15, 2025)**: Fixed job card click behavior to prevent scrolling to top of job list by replacing React Router navigate with history.replaceState for URL updates
- **Company Profile Navigation Fix (January 15, 2025)**: Fixed broken company profile links in job details by changing RouterLink `href` props to `to` props for proper React Router navigation
- **Authentication State Update Fix (January 15, 2025)**: Fixed navbar not updating after login by adding query invalidation in auth callback
- **Job List Scroll Position Fix (January 15, 2025)**: Fixed job card clicks scrolling to top by replacing React Router navigate with history.replaceState for URL updates
- **Job Selection State Fix (January 15, 2025)**: Fixed job selection not updating UI by removing conflicting URL sync logic and using pure local state management
- **Project Import Completed (January 15, 2025)**: Successfully migrated project from Replit Agent to standard Replit environment with all checklist items verified and OAuth environment variables properly configured
- **Chat UX Improvement (January 15, 2025)**: Removed 'New' button from chat page since conversations cannot be created by users - they are initiated by recruiters or through job applications
- **Onboarding Navigation Fix (January 15, 2025)**: Removed Previous button from first onboarding page using conditional rendering since there's no previous step to navigate to
- **Enhanced Chat File Display (January 15, 2025)**: Created comprehensive FileAttachment component with image previews, proper file type icons (PDF, video, audio, archive, document), visual file categorization with color-coded backgrounds, and improved download/view functionality
- **Migration Completed (January 16, 2025)**: Successfully completed migration from Replit Agent to standard Replit environment with all dependencies installed, OAuth secrets configured (VITE_OAUTH_CLIENT_ID, VITE_OAUTH_AUTH_URL, VITE_OAUTH_TOKEN_URL), development server running on port 5000, and application verified working with Baltek API integration
- **Chat Company Profile Navigation (January 16, 2025)**: Implemented clickable company profile links in chat that redirect to company profile pages (/company/{id}). Company logos, names, and avatars in chat headers and job link previews now navigate to the respective company profiles when clicked. Chat conversation list remains non-clickable for better UX.
- **Complete TanStack Query Implementation (January 16, 2025)**: Converted all API requests in the application to use TanStack Query for consistent data fetching, caching, and state management. This includes mutations for file uploads, account deletion, OAuth login, and all data queries with proper error handling, optimistic updates, and cache invalidation strategies.
- **Project Migration Completed (January 16, 2025)**: Successfully completed full migration from Replit Agent to standard Replit environment with all dependencies installed, OAuth secrets configured, and development server running properly on port 5000.
- **Unified Attachment Cards (January 16, 2025)**: Created AttachmentCard component for consistent file attachment rendering across composer and message views with identical card styling, image thumbnails, file icons, and action buttons.
- **Migration Completed Successfully (January 16, 2025)**: Full project migration from Replit Agent to standard Replit environment completed with all dependencies installed, OAuth secrets configured, development server running on port 5000, and application verified working with Baltek API integration. Created unified AttachmentCard component for consistent attachment rendering across chat interface.
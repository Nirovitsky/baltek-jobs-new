# Baltek Jobs Platform

## Overview

This is a complete job seeker frontend application built with React, Express, and TypeScript. The application provides a professional job search platform that integrates seamlessly with the external Baltek API (https://api.baltek.net/api/) for all backend functionality.

The application features a modern two-column job browsing interface, comprehensive filtering system, infinite scroll for seamless navigation, user authentication with phone-based login, profile management, job application system with resume upload, and real-time chat capabilities for employer-candidate communication. The frontend is built with shadcn/ui components and Tailwind CSS using the specified primary color (#1877F2).

## Recent Changes (Jan 2025)
- **Authentication Update**: Modified authentication system to use phone number instead of username as required by the Baltek API
- **Schema Migration**: Updated all authentication schemas and forms to use phone-based authentication
- **Replit Migration**: Successfully migrated project from Replit Agent to standard Replit environment with proper security practices
- **SelectItem Fix**: Fixed Radix UI SelectItem components that had empty string values, which caused React errors. Updated all filter dropdowns to use "all" instead of empty string values
- **Defensive Programming**: Added comprehensive null/undefined checks for all job properties (skills, organization, location, description) to prevent runtime errors. The application now safely handles incomplete job data from the API
- **UI Cleanup**: Removed demo mode notification banner to provide a cleaner user interface
- **Job Card Redesign**: Restructured job cards with improved layout - job title at top, salary prominently displayed, skills tags in middle, and company details (logo, name, location) at bottom. Removed job description from cards for cleaner appearance
- **Job Card Simplification**: Removed bookmark and date elements, moved salary to top-right corner for better visual hierarchy
- **Token Management**: Enhanced token refresh mechanism using correct `/api/token/refresh` endpoint - automatically refreshes expired tokens on 401 errors, gracefully logs out user if refresh fails
- **Bookmark System**: Fixed bookmark functionality to send boolean values (bookmarked: true/false) to API, changed heart icon to bookmark icon with blue styling for better visual consistency
- **Job Sorting Removal**: Removed job sorting functionality to display jobs without ordering, simplifying the job list interface
- **Filter UI Improvements**: Simplified "Save Filters" button by removing icon and "Filters" text, now displays just "Save"
- **Enhanced Salary Filtering**: Replaced salary dropdown with flexible input fields allowing users to specify custom salary ranges
- **Additional Filter Options**: Added new filter fields including currency selection, payment frequency, minimum education level for more granular job search capabilities
- **Optimized Filter Layout**: Removed hardcoded "Filters:" label and reduced dropdown widths to fit all filters in a single line for improved space efficiency  
- **API-Driven Filter Options**: Replaced all hardcoded filter dropdown options with proper API integration based on actual Baltek API structure
- **Enhanced API Structure**: Corrected API endpoints based on actual Baltek API documentation - filter options (job types, workplace types, currencies, payment frequencies, education levels) are provided as static enum data since they're not separate endpoints in the real API
- **API Endpoint Corrections**: Fixed all filter API calls to use correct Baltek API structure - removed non-existent endpoints and implemented proper enum-based filter options matching actual API schema
- **API Structure Updates**: Updated job schema to support new Baltek API structure with payment_from/payment_to fields, organization display_name/official_name fields, and proper handling of optional location/category fields
- **Enhanced Data Handling**: Fixed all job display components to properly handle the actual API response structure including TMT currency support and organization name variations
- **Verified API Endpoints**: Confirmed working endpoints including /jobs/, /locations/, /categories/, /organizations/, /universities/, and /jobs/applications/ with proper response handling
- **Currency Filter Integration**: Updated currency filter to show both TMT and USD currencies matching the backend CurrencyEnum (even though current job data primarily uses TMT)
- **Filter UI Improvements**: Fixed dropdown behavior to use click instead of hover, removed blue focus colors, increased field widths for better text display, and removed grey highlighting on job card clicks
- **Infinite Scroll Fix**: Fixed pagination implementation to use proper offset-based pagination (offset/limit) instead of page-based, enabling infinite scroll to load all available jobs from the API
- **Smart Pagination UX**: Optimized pagination performance by loading 10 jobs initially and implementing smart prefetching that triggers when user scrolls to the 6th job (4 remaining), providing seamless browsing without wait times
- **Skeleton Loading States**: Replaced generic loading indicators with detailed skeleton components that mirror the actual job card layout, providing smooth visual feedback during initial page loads and infinite scroll loading
- **Hidden Scrollbar UX**: Implemented invisible scrollbar for cleaner visual appearance while maintaining full scrolling functionality
- **Progressive Loading Skeletons**: Added dedicated skeleton components for both initial page load and infinite scroll states to maintain consistent visual feedback
- **Individual Job Details Fetching**: Implemented API calls to fetch complete job details when a job is clicked, providing fresh detailed information including full job descriptions and requirements
- **Currency Filter Fix**: Fixed currency filtering functionality by implementing client-side filtering as workaround for non-functional API currency parameter. Now TMT/USD filter correctly shows only matching jobs with proper job selection handling after filtering
- **Simplified Job Application**: Streamlined application form to focus only on essential fields - cover letter and CV/resume upload. Removed optional fields like expected salary and availability for cleaner user experience. Both fields are now required with proper validation
- **Clickable Company Elements**: Removed "Company Profile" button and made company name and logo clickable throughout job details page. Users can now click company name or logo to open company profile in new tab, providing cleaner UI with better user experience
- **Job Card Modernization**: Enhanced job card design with proper width constraints (w-full, max-w-full), increased padding (px-6 py-5), modern hover effects with transitions, larger company logos (8x8px), and improved visual hierarchy. Job and workplace type tags use neutral gray styling while salary displays in primary color without background
- **Comprehensive Card Redesign**: Complete visual overhaul of job cards with modern card-based layout featuring rounded corners (rounded-xl), elevated shadows, gradient backgrounds, and smooth hover animations. Cards now appear as floating elements with sophisticated styling including blue gradient salary badges, enhanced company logos (10x10px), integrated location display, and refined selected state with ring effects

## User Preferences

Preferred communication style: Simple, everyday language.
UI/UX Requirements: Two-column layout (jobs left, details right), infinite scroll, primary color #1877F2, simple interface for average users.
Backend Integration: External Baltek API (https://api.baltek.net/api/) for all data operations.

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
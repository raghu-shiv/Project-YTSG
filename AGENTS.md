# Agent Activity Log

> This file documents all agent actions, decisions, and progress throughout the project lifecycle.

## 2026-07-07: Initial MVP Scaffolding

### Session 1: Planning & Architecture Design

- **Mode**: PLAN MODE
- **Activity**: Gathered requirements via Q&A (tech stack, hosting, payments, auth preferences)
- **Decisions**:
  - Tech stack: Next.js 16 App Router (frontend) + NestJS (backend) + PostgreSQL (DB)
  - Auth: Better-Auth (email/password + Google OAuth)
  - Payments: Razorpay (India-focused)
  - Hosting: Vercel (frontend) + Railway/Render (backend) + Neon/Supabase (DB)
  - Dev environment: Docker Compose
- **Output**: Full architecture plan, DB schema (10 models), API design, UI mockups

### Session 2: Project Scaffolding

- **Mode**: ACT MODE
- **Activity**: Created project structure and all source files
- **Files Created**:
  - `docker-compose.yml` - Docker services (Postgres, Redis, Backend, Frontend)
  - `.env.example` - Environment variables template
  - `.gitignore`

#### Backend (NestJS):

- `backend/package.json` - Dependencies
- `backend/tsconfig.json` - TypeScript config
- `backend/nest-cli.json` - NestJS CLI config
- `backend/Dockerfile.dev` - Dev container
- `backend/startup.sh` - Startup script with auto-migration
- `backend/prisma/schema.prisma` - Full DB schema (10 models)
- `backend/src/main.ts` - Entry point (Helmet, CORS, ValidationPipe)
- `backend/src/app.module.ts` - Root module (updated with BullMQ, SSE, Admin, Email)
- `backend/src/prisma/prisma.service.ts` - DB connection service
- `backend/src/prisma/prisma.module.ts`
- `backend/src/common/guards/jwt-auth.guard.ts` - JWT guard
- `backend/src/common/guards/roles.guard.ts` - Role-based access guard
- `backend/src/common/guards/throttle-tier.guard.ts` - Per-tier rate limiting
- `backend/src/common/decorators/public.decorator.ts` - Public route decorator
- `backend/src/common/decorators/roles.decorator.ts` - @Roles() decorator
- `backend/src/common/decorators/current-user.decorator.ts` - @CurrentUser() decorator
- `backend/src/auth/jwt.strategy.ts` - Passport JWT strategy
- `backend/src/auth/auth.service.ts` - Register/login/google auth logic
- `backend/src/auth/auth.controller.ts` - Auth endpoints
- `backend/src/auth/auth.module.ts`
- `backend/src/users/users.service.ts` - Profile CRUD
- `backend/src/users/users.controller.ts`
- `backend/src/users/users.module.ts`
- `backend/src/script/script.service.ts` - Script generation w/ credit system
- `backend/src/script/script.controller.ts`
- `backend/src/script/script.module.ts`
- `backend/src/ai-provider/ai-provider.service.ts` - OpenRouter wrapper
- `backend/src/ai-provider/ai-provider.module.ts`
- `backend/src/credits/credits.service.ts` - Balance & transactions (with cron jobs)
- `backend/src/credits/credits.controller.ts`
- `backend/src/credits/credits.module.ts`
- `backend/src/payments/payments.service.ts` - Razorpay integration
- `backend/src/payments/payments.controller.ts`
- `backend/src/payments/payments.module.ts`
- `backend/src/payments/payments-webhook.controller.ts` - Webhook handler
- `backend/src/seo/seo.module.ts`
- `backend/src/thumbnail/thumbnail.module.ts`
- `backend/src/queue/queue.module.ts` - BullMQ queue module
- `backend/src/queue/script-generation.service.ts` - Queue enqueuer
- `backend/src/queue/script-generation.processor.ts` - Queue worker
- `backend/src/sse/sse.module.ts` - SSE module
- `backend/src/sse/sse.service.ts` - SSE event service
- `backend/src/sse/sse.controller.ts` - SSE streaming endpoint
- `backend/src/admin/admin.module.ts` - Admin module
- `backend/src/admin/admin.service.ts` - Admin queries
- `backend/src/admin/admin.controller.ts` - Admin endpoints
- `backend/src/email/email.module.ts` - Email module
- `backend/src/email/email.service.ts` - Email notification service

#### Frontend (Next.js 16):

- `frontend/package.json` - Dependencies (with @tailwindcss/postcss)
- `frontend/tsconfig.json`
- `frontend/next.config.ts`
- `frontend/postcss.config.js` - PostCSS config for Tailwind v4
- `frontend/Dockerfile.dev`
- `frontend/src/lib/auth.ts` - Better-Auth config
- `frontend/src/lib/api.ts` - API client helper
- `frontend/src/app/globals.css` - Tailwind CSS v4 with @theme block
- `frontend/src/app/layout.tsx` - Root layout
- `frontend/src/app/page.tsx` - Landing page (with auth redirect, AuthNav)
- `frontend/src/app/login/page.tsx` - Login page
- `frontend/src/app/register/page.tsx` - Register page
- `frontend/src/app/dashboard/layout.tsx` - Dashboard sidebar layout (with Admin nav)
- `frontend/src/app/dashboard/page.tsx` - Script generator wizard
- `frontend/src/app/dashboard/scripts/page.tsx` - Script library
- `frontend/src/app/dashboard/scripts/[id]/page.tsx` - Script detail (tabs: script/seo/thumbnail)
- `frontend/src/app/dashboard/billing/page.tsx` - Billing & credits
- `frontend/src/app/dashboard/settings/page.tsx` - Profile settings
- `frontend/src/app/dashboard/admin/page.tsx` - Admin panel (users table, stats, credit modal)
- `frontend/src/components/ui/index.ts` - UI component barrel export
- `frontend/src/components/ui/Button.tsx` - Reusable Button component
- `frontend/src/components/ui/Input.tsx` - Reusable Input component
- `frontend/src/components/ui/Card.tsx` - Reusable Card component
- `frontend/src/components/ui/Badge.tsx` - Reusable Badge component
- `frontend/src/components/ui/LoadingSpinner.tsx` - Reusable spinner
- `frontend/src/components/AuthNav.tsx` - Auth-aware navigation component
- `frontend/src/components/InlineEditor.tsx` - Auto-saving script editor with download

### Session 3: Documentation

- **Activity**: Created SDLC documentation files
- **Files Created**:
  - `README.md` - Project overview, setup instructions, API docs
  - `AGENTS.md` - This file (agent activity log)
  - `PLANS.md` - Architecture decisions & design plans

## 2026-07-08: UI Refactoring & Post-MVP Implementation

### Session 4: UI Design System & Component Refactoring

- **Mode**: ACT MODE
- **Activity**: Refactored monolithic page code into reusable component library, applied modern design system
- **Components Created**:
  - `frontend/src/components/ui/Button.tsx` - 5 variants, 3 sizes, loading state
  - `frontend/src/components/ui/Input.tsx` - Label, error, icon support
  - `frontend/src/components/ui/Card.tsx` - 3 variants, 4 padding sizes
  - `frontend/src/components/ui/Badge.tsx` - 5 color variants
  - `frontend/src/components/ui/LoadingSpinner.tsx` - 3 sizes
  - `frontend/src/components/AuthNav.tsx` - Conditional auth state rendering
  - `frontend/src/components/InlineEditor.tsx` - Auto-saving script editor
- **Design System**: CSS variables in @theme block, custom animations (fadeIn/slideIn), smooth scrollbar
- **Pages Refactored**: Landing (hero/stats/features/pricing/CTA), Login, Register, Dashboard Layout, Dashboard Main, Scripts List, Script Detail, Billing, Settings
- **CSS Fixes**: Added postcss.config.js, @tailwindcss/postcss dep, @theme block for Tailwind v4

### Session 5: Post-MVP Features (Batch 1)

- **Mode**: ACT MODE
- **Activity**: Implemented roadmap features for production readiness
- **Backend Features**:
  - **BullMQ Queue**: Background job processing for AI generation with retry logic
  - **SSE Streaming**: Real-time script generation progress via Server-Sent Events
  - **Admin Panel**: User management, credit adjustments, platform stats
  - **Email Service**: Welcome, credit low, generation complete notifications
  - **Webhook Handler**: Razorpay signature verification, subscription auto-renewal
  - **Rate Limiting**: Per-tier (free: 10/min, pro: 60/min)
  - **Role-Based Access**: @Roles('admin') guard, @CurrentUser() decorator
- **Frontend Features**:
  - **Admin UI**: Tabbed users/stats view, user table with expandable details, credit modal
  - **Inline Editor**: Debounced auto-save, download as .txt/.docx
  - **Conditional Admin Nav**: Only visible for admin users
- **Infrastructure**:
  - Updated `backend/src/app.module.ts` with BullModule, ScheduleModule, all new modules
  - Updated `.gitignore` with comprehensive coverage
  - Updated all markdown docs to reflect current state

## 2026-07-09: Global State Management & Post-MVP Batch 2

### Session 6: Zustand State Management & Credit Balance Fix

- **Mode**: ACT MODE
- **Activity**: Implemented Zustand global state management and fixed sidebar credit balance display issue
- **Root Cause Fixed**: Auth endpoints (`/auth/login`, `/auth/register`) returned user objects without `creditBalance`. The Zustand store saved this incomplete user, so the sidebar always showed 0.
- **Fix**: Added `creditBalance: user.creditBalance` to all auth response objects in `backend/src/auth/auth.service.ts`
- **Stores Created**:
  - `frontend/src/stores/auth-store.ts` - Auth state with localStorage persistence (user, token, login, logout, fetchProfile, updateCredits)
  - `frontend/src/stores/ui-store.ts` - UI state (sidebar open/close toggle)
  - `frontend/src/stores/scripts-store.ts` - Scripts CRUD, generation with SSE progress tracking, loading state
  - `frontend/src/stores/credits-store.ts` - Credit balance, transactions, purchase flow — syncs with auth store
  - `frontend/src/stores/index.ts` - Barrel export for all stores

### Session 7: Frontend Store Refactoring

- **Mode**: ACT MODE
- **Activity**: Refactored all frontend pages to use Zustand stores instead of local state + direct API calls
- **Pages Refactored**:
  - `dashboard/page.tsx` -> Uses `useScriptsStore` + `useCreditsStore` (generation, recent scripts, balance)
  - `dashboard/scripts/page.tsx` -> Uses `useScriptsStore` (script list, loading state)
  - `dashboard/scripts/[id]/page.tsx` -> Uses `useScriptsStore` (script detail, delete, regenerate, tab navigation)
  - `dashboard/billing/page.tsx` -> Uses `useCreditsStore` (reactive balance, post-purchase refresh)
  - `dashboard/settings/page.tsx` -> Uses `useAuthStore` (profile from store, updates sync to store)
  - `dashboard/layout.tsx` -> Uses `useAuthStore` + `useUIStore` (auth state, sidebar toggle)
  - `AuthNav.tsx` -> Uses `useAuthStore` (auth state from store)
  - `page.tsx` (landing) -> Uses `useAuthStore` (redirect check from store)
  - `login/page.tsx` -> Uses `useAuthStore` (login calls store's login())
  - `register/page.tsx` -> Uses `useAuthStore` (register calls store's login())
- **Store Enhancements**: Added `isLoading` to scripts-store, fixed API response parsing (handles both `data.scripts` and direct array responses)

### Session 8: Multi-Model AI Fallback & Image Generation

- **Mode**: ACT MODE
- **Activity**: Rewrote AI provider service with automatic model fallback and image generation capabilities
- **Backend Changes**:
  - `backend/src/ai-provider/ai-provider.service.ts` - Complete rewrite with:
    - **6 models** in priority chain: GPT-4o-mini -> Gemini Flash -> DeepSeek -> Llama 3.1 -> GPT-4o -> Claude 3.5
    - **Automatic fallback**: If a model errors, the next in priority is tried automatically
    - **60s timeout** per model call
    - **3 image models**: DALL-E 3 -> Stable Diffusion XL -> Flux Schnell (120s timeout)
    - **Model cost tracking**: Per-model pricing for cost monitoring
    - **New methods**: `generateCompletion()`, `generateImage()`, `generateSeoSuggestions()`, `generateThumbnailConcepts()`
- **Key Design**: All generation methods use `generateCompletion()` which handles the fallback chain. The `generateScript()`, `generateSeoSuggestions()`, and `generateThumbnailConcepts()` methods all benefit from automatic fallback.

### Session 9: Team/Workspace Schema

- **Mode**: ACT MODE
- **Activity**: Added team/workspace support to the database schema
- **New Prisma Models**:
  - `Team` - slug, name, description, members, scripts, invites
  - `TeamMember` - userId + role (owner/admin/member) per team
  - `TeamInvite` - email invite with token, expiry, acceptance tracking
  - `User.teamMembers` - relationship to teams
  - `Script.team` - optional team association (TeamScripts relation)
  - `Niche.team` - optional team association (TeamNiches relation)

### Session 10: Documentation Update

- **Mode**: ACT MODE
- **Activity**: Updated all markdown documentation to reflect latest changes
- **Files Updated**:
  - `README.md` - Updated tech stack, project structure, API endpoints, features list, Post-MVP checklist
  - `AGENTS.md` - Added Sessions 6-9 documenting all new work
  - `PLANS.md` - Updated state management, schema count, Post-MVP checklist

### Session 11: Admin Panel Relocation & Secure Admin Promotion

- **Mode**: ACT MODE
- **Activity**: Moved admin panel from dashboard sidebar to standalone `/admin` route, implemented secure admin promotion mechanism
- **Problem**: Admin panel was accessible at `/dashboard/admin` with a link in the sidebar visible to all users (though filtered by role). There was no way to create an admin user after initial signup.
- **Solution**:
  - **Admin Panel Relocated**: Moved from `/dashboard/admin` to standalone `/admin` route with its own auth guard and top navigation bar with "Back to Dashboard" button
  - **Admin Promotion**: Added `POST /auth/make-admin` endpoint that accepts `{ secretKey: string }` in the body. The backend compares the provided key against the `ADMIN_SECRET_KEY` environment variable. Only the app owner knows this secret key, so only they can promote users to admin.
  - **Security**: Only authenticated users can hit the endpoint (JwtAuthGuard), and the secret key is stored in environment variables, never in code.
  - **Dashboard Cleanup**: Removed admin link from `navItems` in `frontend/src/app/dashboard/layout.tsx` entirely, simplifying the sidebar.
- **Files Created**:
  - `frontend/src/app/admin/page.tsx` - Standalone admin panel at `/admin` route
- **Files Modified**:
  - `backend/src/auth/auth.service.ts` - Added `makeAdmin()` method with `ADMIN_SECRET_KEY` validation
  - `backend/src/auth/auth.controller.ts` - Added `POST /auth/make-admin` endpoint
  - `frontend/src/app/dashboard/layout.tsx` - Removed admin link from sidebar nav items
  - `.env.example` - Added `ADMIN_SECRET_KEY` environment variable
- **Files Deleted**:
  - `frontend/src/app/dashboard/admin/page.tsx` - Old admin panel (moved to `/admin`)

### Session 12: SEO Optimization & Performance Improvements

- **Mode**: ACT MODE
- **Activity**: Implemented comprehensive SEO optimization, lazy loading, and performance improvements
- **Problem**: The app lacked proper SEO metadata, sitemap, robots.txt, and had no lazy loading for below-fold content. The SEO module was empty. Performance headers and image optimization were not configured.
- **Solution**:

  **Frontend SEO Enhancements**:
  - **Root Layout**: Added comprehensive metadata including Open Graph, Twitter Cards, JSON-LD structured data (SoftwareApplication schema), keywords, robots directives, and canonical URL
  - **Font Loading**: Added preconnect and preload for Google Fonts (Inter) to reduce CLS
  - **DNS Prefetch**: Added dns-prefetch and preconnect for API server, OpenRouter, and Google auth
  - **Sitemap**: Created `/sitemap.xml` with all public pages, proper priorities and change frequencies
  - **Robots.txt**: Created `/robots.txt` with crawl rules (disallow /admin/ and /api/)

  **Performance Optimizations**:
  - **LazySection Component**: Created a reusable IntersectionObserver-based component that defers rendering of below-fold sections until they're near the viewport (200px default margin)
  - **Landing Page Lazy Loading**: Applied LazySection to Stats, Features, Pricing, CTA, and Footer sections — only Hero renders immediately
  - **Next.js Config**: Added HTTP security headers (X-Frame-Options, CSP, Permissions-Policy), aggressive static asset caching (1 year), image optimization (AVIF/WebP, 30-day cache), and compression
  - **Landing Page Optimization**: Refactored duplicate inline SVGs into data-driven path strings, added aria-label/aria-hidden for accessibility, removed client component metadata export

  **Backend SEO Module**:
  - **SeoService**: Full implementation with AI-powered keyword/hashtag/tag generation, title suggestions, SEO scoring (title/description/tags/hashtags), competition level estimation, best posting time recommendations, and fallback suggestions when AI fails
  - **SeoController**: Added `POST /seo/suggestions` and `POST /seo/analyze` endpoints (JWT-protected)
  - **SeoModule**: Updated to register SeoService, SeoController, and import AiProviderModule

- **Files Created**:
  - `frontend/src/components/LazySection.tsx` - Reusable lazy loading component
  - `frontend/src/app/sitemap.ts` - Dynamic sitemap generation
  - `frontend/src/app/robots.ts` - Robots.txt generation
  - `backend/src/seo/seo.service.ts` - Full SEO service implementation
  - `backend/src/seo/seo.controller.ts` - SEO API endpoints
- **Files Modified**:
  - `frontend/src/app/layout.tsx` - Added comprehensive metadata, JSON-LD, font preloading, DNS prefetch
  - `frontend/next.config.ts` - Added performance headers, image optimization, caching, security headers
  - `frontend/src/app/page.tsx` - Applied lazy loading to below-fold sections, optimized SVG markup
  - `backend/src/seo/seo.module.ts` - Registered SeoService, SeoController, AiProviderModule import

### Session 13: Production Deployment Preparation

- **Mode**: ACT MODE
- **Activity**: Prepared project for production deployment on Vercel (frontend) and Render (backend), created comprehensive deployment documentation
- **Problem**: The project had no production Dockerfile, no health check endpoint, no deployment configs (Vercel/Render), and no deployment guide.
- **Solution**:

  **Production Configurations**:
  - **Backend Dockerfile**: Multi-stage production build (builder → production) with Alpine image, Prisma client generation, and health check
  - **startup.sh**: Updated for production — generates Prisma client, runs migrations, starts with `start:prod`
  - **Health Check**: Created `HealthModule` + `HealthController` with `/api/health` endpoint (returns status, timestamp, uptime, memory)
  - **vercel.json**: Frontend deployment config for Vercel (Next.js framework, root directory, env vars)
  - **render.yaml**: Render Blueprint config for infrastructure-as-code (Web Service + PostgreSQL + Redis)
  - **.env.example**: Reorganized with production deployment notes, separate sections for local vs production

  **Deployment Documentation**:
  - **README.md**: Added comprehensive "Production Deployment" section with:
    - Architecture diagram (Vercel → Render)
    - Step-by-step guides for Render (Blueprint + Manual) and Vercel
    - Post-deployment configuration (Razorpay webhook, admin promotion, health check)
    - Troubleshooting table for common issues
    - Production URLs placeholder section

- **Files Created**:
  - `backend/Dockerfile` - Multi-stage production Docker build
  - `backend/src/health/health.controller.ts` - Health check endpoint
  - `backend/src/health/health.module.ts` - Health check module
  - `vercel.json` - Vercel deployment configuration
  - `render.yaml` - Render Blueprint infrastructure-as-code
- **Files Modified**:
  - `backend/startup.sh` - Updated for production (prisma generate + start:prod)
  - `backend/src/app.module.ts` - Added HealthModule import
  - `.env.example` - Reorganized with production deployment notes
  - `README.md` - Added comprehensive deployment documentation

## 2026-07-13: Checkout Modal, Email/Phone Verification & Settings Overhaul

### Session 14: Billing & Settings Refactor

- **Mode**: ACT MODE
- **Activity**: Refactored billing flow, added email/phone verification in settings, removed phone verification module
- **Changes**:

  **Backend**:
  - `backend/prisma/schema.prisma` — Added `emailVerified` to User model. Updated `OtpVerification` model with `target` and `type` fields (supports both email and phone OTP)
  - `backend/src/otp/otp.service.ts` — Rewritten to support both email and phone OTP verification
  - `backend/src/otp/otp.controller.ts` — Updated endpoints to accept `target` + `type` parameters
  - `backend/src/auth/auth.service.ts` — Added `emailVerified` to all auth response objects
  - `backend/src/users/users.service.ts` — Added `emailVerified` to profile select, added `phone` to updateProfile
  - `backend/src/users/users.controller.ts` — Added `phone` to updateProfile body

  **Frontend**:
  - `frontend/src/components/CheckoutModal.tsx` — **New**: Popup with plan summary, auto-renewal toggle, phone number input, and "Proceed to Checkout" button. Opens when user clicks "Buy Now" on a plan card.
  - `frontend/src/components/SubscriptionCard.tsx` — Simplified: removed internal auto-renewal toggle, removed phone verification logic. Button now says "Buy Now" and opens CheckoutModal.
  - `frontend/src/app/dashboard/billing/page.tsx` — Refactored: "Buy Now" opens CheckoutModal → modal collects phone + auto-renewal preference → proceeds to Razorpay checkout with phone pre-filled
  - `frontend/src/app/dashboard/settings/page.tsx` — Added phone number field with Verify button (sends OTP to phone). Added Verify button next to email (sends OTP to email). Shows "Verified" badge when verified.
  - `frontend/src/stores/auth-store.ts` — Added `emailVerified` to User type
  - `frontend/src/components/PhoneVerificationModal.tsx` — **Deleted** (replaced by CheckoutModal + inline verification in settings)

- **Files Deleted**:
  - `frontend/src/components/PhoneVerificationModal.tsx`

## 2026-07-28: Thumbnail Image Generation Fix

### Session 14b: Image Model Response Parsing Fix

- **Mode**: ACT MODE
- **Activity**: Fixed thumbnail image generation by switching from the non-existent `/api/v1/images/generate` endpoint to the correct `/api/v1/chat/completions` with `output_modalities: ["image"]`
- **Problem**: All image models returned 404 errors because they were calling the wrong OpenRouter endpoint
- **Fix**:
  - Changed endpoint from `/api/v1/images/generate` to `/api/v1/chat/completions`
  - Added `output_modalities: ["image"]` to request body
  - Updated response parsing to extract images from `message.images[0].image_url.url`
  - Removed `openai/gpt-image-1-mini` model which doesn't exist on OpenRouter
  - Added handling for array-like `images` objects via `Object.values()`
  - Updated `script.service.ts` image model list

## 2026-07-29: New Pages & Documentation Update

### Session 15: About, Help Center, Contact Pages

- **Mode**: ACT MODE
- **Activity**: Created public-facing pages, updated landing page footer, and refreshed all markdown documentation with full feature set
- **Changes**:

  **New Pages Created**:
  - `frontend/src/app/about/page.tsx` — About page with mission statement, offerings grid, and company story
  - `frontend/src/app/help/page.tsx` — Help Center with accordion FAQ sections (Getting Started, Credits & Billing, Script Generation, SEO & Thumbnails, Technical)
  - `frontend/src/app/contact/page.tsx` — Contact page with email support, partnerships, and "Still Need Help?" CTA

  **Landing Page Updates**:
  - `frontend/src/app/page.tsx` — Footer links updated from placeholder text to real `<Link>` components pointing to `/about`, `/help`, `/contact`. Removed "Blog" references.

  **Sitemap Updated**:
  - `frontend/src/app/sitemap.ts` — Added `/about`, `/help`, `/contact` entries with appropriate priorities and change frequencies

  **Documentation Updated**:
  - `README.md` — Complete rewrite with full feature list including: Multi-Model AI, Thumbnail Image Generation, SSE Streaming, BullMQ Queue, Inline Editor, SEO Optimization, Credit System, Razorpay Integration, Email Notifications, OTP Verification, Admin Panel, Admin Promotion, Teams/Workspace, Zustand State Management, Performance optimizations, and all API endpoints
  - `PLANS.md` — Updated architecture docs with all Post-MVP features, component tree, state management, security architecture, and complete progress checklist
  - `AGENTS.md` — Added this session entry

- **Files Created**:
  - `frontend/src/app/about/page.tsx`
  - `frontend/src/app/help/page.tsx`
  - `frontend/src/app/contact/page.tsx`

- **Files Modified**:
  - `frontend/src/app/page.tsx` — Replaced footer placeholder text with real links, removed Blog
  - `frontend/src/app/sitemap.ts` — Added About, Help, Contact entries
  - `README.md` — Full rewrite with comprehensive feature list
  - `PLANS.md` — Updated with all Post-MVP features

## Project Rules Established

1. Agents restricted to project folder only
2. No git/github commands allowed
3. All updates documented in markdown files (AGENTS.md, PLANS.md, README.md)
4. Full SDLC progress documented
5. Dependencies are managed via Docker — never run `npm install` or `npm add` directly on the host machine. Instead, use `docker compose build` or `docker compose up` to install dependencies inside containers.
6. Docker commands (e.g., `docker compose exec`, `docker compose restart`, `docker compose build`) are run by the user in a separate PowerShell window as admin. The agent should not execute Docker commands directly.
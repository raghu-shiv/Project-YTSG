# Architecture Plans & Design Decisions

> This file documents all architecture decisions, design patterns, and technical plans for the YouTube Script Generator project.

## 1. System Architecture Overview

### High-Level Architecture

```
┌─────────────────┐        HTTPS         ┌──────────────────────┐
│  Next.js Frontend │ ───────────────────▶ │   NestJS API (REST)  │
│  (Vercel)          │ ◀─────────────────  │   (Railway/Render)    │
└─────────────────┘                        └──────────┬────────────┘
                                                           │
                        ┌──────────────────────────────────┼───────────────────────┐
                        ▼                                  ▼                       ▼
                ┌───────────────┐                 ┌────────────────┐      ┌────────────────┐
                │ PostgreSQL    │                 │ Redis (Upstash) │      │ OpenRouter API │
                │ (Neon/Supabase)│                │ cache + queue   │      │ (LLM calls)     │
                └───────────────┘                 └────────────────┘      └────────────────┘
                        │
                        ▼
                ┌───────────────┐
                │ Razorpay       │  (Webhooks → credit ledger update)
                └───────────────┘
```

### Key Design Decisions

| Decision          | Choice                                         | Rationale                                                   |
| ----------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| **Monorepo**      | Simple folder structure (backend/ + frontend/) | Keeps things simple for MVP; no monorepo tooling overhead   |
| **API Pattern**   | RESTful                                        | Simple, well-understood, sufficient for MVP                 |
| **Auth Flow**     | JWT (access token)                             | Stateless, works well with mobile/API clients               |
| **AI Generation** | BullMQ job queue with SSE streaming            | Reliable background processing with real-time updates       |
| **Credit System** | Optimistic deduction + refund on failure       | Prevents double-spending while handling failures gracefully |
| **Payment Flow**  | Razorpay Orders API + client-side checkout     | Standard Indian payment flow; webhook verification          |
| **State Mgmt**    | Zustand (4 stores)                             | Lightweight, no boilerplate, works with Next.js SSR         |

## 2. Database Schema Design

### Entity Relationship Overview

```
User (1) ──── (N) Script
User (1) ──── (N) CreditTransaction
User (1) ──── (N) Payment
User (1) ──── (N) Subscription
User (1) ──── (N) AiUsageLog
User (1) ──── (N) TeamMember
User (1) ──── (N) OtpVerification
Script (1) ──── (N) ScriptVersion
Script (1) ──── (1) SeoSuggestion
Script (1) ──── (N) ThumbnailConcept
Script (N) ──── (1) Team (optional)
Niche (1) ──── (N) Script
Niche (N) ──── (1) Team (optional)
Team (1) ──── (N) TeamMember
Team (1) ──── (N) TeamInvite
```

### Models (13 total)

1. **User** - Core user account with credit balance, emailVerified, phone
2. **CreditTransaction** - Immutable ledger of all credit movements
3. **Subscription** - Monthly bundle subscriptions
4. **Payment** - Razorpay payment records
5. **Niche** - Predefined content categories (optionally team-scoped)
6. **Script** - Generated scripts with status tracking (optionally team-scoped)
7. **ScriptVersion** - Version history on regeneration
8. **SeoSuggestion** - SEO metadata per script
9. **ThumbnailConcept** - Thumbnail ideas per script (with actual imageUrl)
10. **AiUsageLog** - Token/cost tracking for observability
11. **Team** - Workspace/team with slug, name, description
12. **TeamMember** - User membership with role (owner/admin/member)
13. **TeamInvite** - Email invite with token, expiry, acceptance
14. **OtpVerification** - OTP codes for email and phone verification

### Key Schema Decisions

- **Credit balance denormalized on User** for fast reads (no SUM query on every page load)
- **CreditTransaction as ledger** for audit trail and reconciliation
- **Script status enum** (draft/generating/completed/failed) enables async generation flow
- **AiUsageLog** enables cost monitoring and future billing optimization
- **Snake_case column mapping** via `@map()` for PostgreSQL conventions
- **Team/Workspace** uses a separate Team model with many-to-many via TeamMember
- **Team scoping** on Script and Niche via optional foreign keys
- **OtpVerification** supports both email and phone OTP via `target` and `type` fields

## 3. API Design

### Authentication Flow

```
Register/Login → JWT issued (7d expiry) → Stored in localStorage
→ Sent as Bearer token in Authorization header
→ Validated by JwtAuthGuard on protected routes
→ Public routes marked with @Public() decorator
```

### Admin Promotion Flow

```
Authenticated user → POST /auth/make-admin { secretKey: "..." }
→ Backend compares secretKey against ADMIN_SECRET_KEY env var
→ If match, user's role is promoted to "admin"
→ Admin can now access /admin route (standalone page, not in dashboard sidebar)
→ Non-admin users trying to access /admin are redirected to /dashboard
```

### Credit Flow

```
User Action                    Credit Impact
─────────────────────────────────────────────
Sign up                       +5 (welcome bonus)
Generate script               -1 (deducted upfront, refunded on failure)
Generate thumbnail            -1 (deducted on success, no charge on failure)
Purchase credits              +N (after Razorpay verification)
Monthly subscription grant    +N (per period)
```

### Script Generation Flow

```
1. POST /api/scripts { topic, videoType }
2. Check credit balance → deduct 1 credit (pending)
3. Create Script record (status: "generating")
4. Enqueue BullMQ job for async AI generation
5. Frontend subscribes to SSE /api/scripts/:id/stream
6. BullMQ worker processes: calls OpenRouter, streams tokens via SSE
7. On completion: update content, status → "completed"
8. On failure: refund credit, status → "failed"
```

### AI Model Fallback Flow

```
1. generateCompletion() called with preferred model (default: gpt-4o-mini)
2. Try preferred model → if success, return result
3. If error, log warning and try next model in priority chain:
   GPT-4o-mini → Gemini Flash → DeepSeek → Llama 3.1 → GPT-4o → Claude 3.5
4. If all models fail, throw error with last error message
5. Image generation uses /chat/completions with output_modalities: ["image"]
   gemini-3.1-flash-lite-image → gemini-3.1-flash-image → seedream-4.5
```

### Thumbnail Image Generation Flow

```
1. POST /api/scripts/:id/thumbnail
2. Check thumbnail credits → deduct 1 credit
3. Generate text concept via generateThumbnailConcepts() (text model)
4. Build image prompt from concept description + keywords
5. Try image models in order:
   gemini-3.1-flash-lite-image → gemini-3.1-flash-image → seedream-4.5
6. Each model called via POST /api/v1/chat/completions with output_modalities: ["image"]
7. Response parsed from message.images[0].image_url.url (data:image/jpeg;base64,...)
8. On success: save imageUrl to ThumbnailConcept, deduct credit
9. On failure: try next model; if all fail, save concept without image, no credit charged
```

## 4. Frontend Architecture

### Component Tree

```
RootLayout
├── Landing Page (/)
├── About Page (/about)
├── Help Center (/help)
├── Contact Page (/contact)
├── Login/Register (/auth)
├── Admin Panel (/admin) — Standalone page, not in dashboard sidebar
│   └── Only accessible to admin users; non-admin redirected to /dashboard
└── DashboardLayout (authenticated)
    ├── Dashboard (/dashboard) — Script generator wizard
    ├── Scripts (/dashboard/scripts) — Script library
    │   └── ScriptDetail (/dashboard/scripts/[id])
    │       ├── Script Tab (inline editor with auto-save)
    │       ├── SEO Tab
    │       └── Thumbnail Tab
    ├── Billing (/dashboard/billing) — Credit purchase with CheckoutModal
    └── Settings (/dashboard/settings) — Profile with email/phone verification

### Shared Components
├── UI (Button, Input, Card, Badge, LoadingSpinner)
├── AuthNav — Auth-aware nav bar
├── CheckoutModal — Razorpay checkout with plan summary, phone, auto-renewal toggle
├── InlineEditor — Rich text editor with auto-save and .txt/.docx download
├── LazySection — IntersectionObserver-based lazy loading wrapper for below-fold content
├── Providers — Theme/auth providers
└── SubscriptionCard — Plan display card
```

### State Management (Zustand)

| Store            | Key State                                      | Persistence |
| ---------------- | ---------------------------------------------- | ----------- |
| **auth-store**   | user, token, login, logout, fetchProfile       | localStorage |
| **ui-store**     | sidebarOpen, toggleSidebar                     | none        |
| **scripts-store**| scripts, currentScript, isGenerating, isLoading| none        |
| **credits-store**| balance, transactions, fetchBalance, purchase  | none        |

- **Auth state**: Persisted to localStorage via Zustand `persist` middleware
- **Credits sync**: `credits-store.fetchBalance()` calls `auth-store.updateCredits()` to keep sidebar balance in sync
- **Scripts**: All pages consume from `scripts-store` instead of local state + direct API calls

## 5. Security Architecture

| Layer                    | Implementation                                          |
| ------------------------ | ------------------------------------------------------- |
| **Transport**            | HTTPS (enforced by Vercel/Railway)                      |
| **HTTP Headers**         | Helmet.js middleware                                    |
| **CORS**                 | Restricted to FRONTEND_URL                              |
| **Auth**                 | JWT with 7d expiry, bcrypt password hashing (12 rounds) |
| **Rate Limiting**        | Per user tier (free: 10/min, pro: 60/min)               |
| **Input Validation**     | class-validator whitelist + forbidNonWhitelisted        |
| **Payment Verification** | Razorpay HMAC-SHA256 signature validation               |
| **Secrets**              | Environment variables only, never in code               |
| **Admin Promotion**      | ADMIN_SECRET_KEY env var — only known to app owner      |
| **SEO**                  | Open Graph/Twitter Cards, JSON-LD structured data, sitemap.xml, robots.txt |
| **Performance**          | Lazy loading (IntersectionObserver), font preloading, DNS prefetch, asset caching |
| **HTTP Security**        | X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy |

## 6. Cost Optimization Strategy

| Area               | Strategy                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| **AI Model**       | Default to `gpt-4o-mini` ($0.15/1K input tokens) — cheapest capable model |
| **Image Model**    | Default to `gemini-3.1-flash-lite-image` ($0.00003/token) — cheapest image model |
| **Model Fallback** | Route complex tasks to stronger models, simple tasks to cheap models      |
| **Caching**        | Redis cache for frequently accessed data (pricing, niches)                |
| **Database**       | Serverless Postgres (Neon) — scale-to-zero when idle                      |
| **Hosting**        | Vercel free tier (frontend) + Railway starter (backend)                   |
| **Monitoring**     | Sentry free tier for error tracking                                       |

## 7. MVP Build Order

1. ✅ Project scaffolding (Docker Compose, monorepo structure)
2. ✅ Prisma schema + migrations
3. ✅ Auth (JWT register/login + Google OAuth)
4. ✅ Credit system + Razorpay payment integration
5. ✅ AI Provider integration (OpenRouter wrapper, prompt templates)
6. ✅ Script generation flow (wizard UI + backend)
7. ✅ Script library, editing, regeneration
8. ✅ SEO & Thumbnail suggestion modules
9. ✅ Billing/dashboard UI
10. ✅ Documentation (README, AGENTS, PLANS)

## 8. Post-MVP Implementation

### Progress

- [x] BullMQ queue for background AI generation
- [x] SSE streaming for real-time script generation
- [x] Inline script editing with auto-save (debounced)
- [x] Download as .txt/.docx
- [x] Admin panel (user management, credit adjustments) — standalone `/admin` route
- [x] Admin promotion via `POST /auth/make-admin` with `ADMIN_SECRET_KEY` env var
- [x] Email notifications (welcome, credit low, generation complete)
- [x] Subscription auto-renewal via Razorpay webhooks
- [x] API rate limiting per user tier
- [x] Zustand global state management (4 stores: auth, ui, scripts, credits)
- [x] Multi-model AI support with automatic fallback (6 models)
- [x] Thumbnail image generation (via /chat/completions with output_modalities: ["image"])
- [x] Team/workspace accounts (Team, TeamMember, TeamInvite models)
- [x] Comprehensive SEO metadata (Open Graph, Twitter Cards, JSON-LD, sitemap, robots.txt)
- [x] Lazy loading for below-fold content (LazySection component)
- [x] Performance optimization (font preloading, DNS prefetch, asset caching, compression)
- [x] Backend SEO module with AI-powered suggestions, scoring, and fallback
- [x] OTP verification for email and phone
- [x] CheckoutModal with plan summary, phone input, auto-renewal toggle
- [x] Email/phone verification in settings page
- [x] About, Help Center, Contact pages
- [x] Health check endpoint
- [x] Production Dockerfile + deployment configs (vercel.json, render.yaml)
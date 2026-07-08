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
| **AI Generation** | Async fire-and-forget with polling             | Avoids HTTP timeouts; future: WebSocket/SSE streaming       |
| **Credit System** | Optimistic deduction + refund on failure       | Prevents double-spending while handling failures gracefully |
| **Payment Flow**  | Razorpay Orders API + client-side checkout     | Standard Indian payment flow; webhook verification          |

## 2. Database Schema Design

### Entity Relationship Overview

```
User (1) ──── (N) Script
User (1) ──── (N) CreditTransaction
User (1) ──── (N) Payment
User (1) ──── (N) Subscription
User (1) ──── (N) AiUsageLog
Script (1) ──── (N) ScriptVersion
Script (1) ──── (1) SeoSuggestion
Script (1) ──── (N) ThumbnailConcept
Niche (1) ──── (N) Script
```

### Models (10 total)

1. **User** - Core user account with credit balance
2. **CreditTransaction** - Immutable ledger of all credit movements
3. **Subscription** - Monthly bundle subscriptions
4. **Payment** - Razorpay payment records
5. **Niche** - Predefined content categories
6. **Script** - Generated scripts with status tracking
7. **ScriptVersion** - Version history on regeneration
8. **SeoSuggestion** - SEO metadata per script
9. **ThumbnailConcept** - Thumbnail ideas per script
10. **AiUsageLog** - Token/cost tracking for observability

### Key Schema Decisions

- **Credit balance denormalized on User** for fast reads (no SUM query on every page load)
- **CreditTransaction as ledger** for audit trail and reconciliation
- **Script status enum** (draft/generating/completed/failed) enables async generation flow
- **AiUsageLog** enables cost monitoring and future billing optimization
- **Snake_case column mapping** via `@map()` for PostgreSQL conventions

## 3. API Design

### Authentication Flow

```
Register/Login → JWT issued (7d expiry) → Stored in localStorage
→ Sent as Bearer token in Authorization header
→ Validated by JwtAuthGuard on protected routes
→ Public routes marked with @Public() decorator
```

### Credit Flow

```
User Action                    Credit Impact
─────────────────────────────────────────────
Sign up                       +5 (welcome bonus)
Generate script               -1 (deducted upfront, refunded on failure)
Purchase credits              +N (after Razorpay verification)
Monthly subscription grant    +N (per period)
```

### Script Generation Flow

```
1. POST /api/scripts { topic, videoType }
2. Check credit balance → deduct 1 credit (pending)
3. Create Script record (status: "generating")
4. Fire async AI generation (non-blocking)
5. Frontend polls GET /api/scripts/:id
6. On completion: update content, status → "completed"
7. On failure: refund credit, status → "failed"
```

## 4. Frontend Architecture

### Component Tree

```
RootLayout
├── Landing Page (/)
├── Login Page (/login)
├── Register Page (/register)
└── DashboardLayout (authenticated)
    ├── Dashboard (/dashboard) - Script generator wizard
    ├── Scripts (/dashboard/scripts) - Script library
    │   └── ScriptDetail (/dashboard/scripts/[id])
    │       ├── Script Tab
    │       ├── SEO Tab
    │       └── Thumbnail Tab
    ├── Billing (/dashboard/billing) - Credit purchase
    └── Settings (/dashboard/settings) - Profile
```

### State Management

- **Auth state**: JWT token in localStorage, validated on dashboard mount
- **API calls**: Direct fetch via `apiClient()` helper with automatic token injection
- **No global state library** for MVP — component-level state is sufficient

## 5. Security Architecture

| Layer                    | Implementation                                          |
| ------------------------ | ------------------------------------------------------- |
| **Transport**            | HTTPS (enforced by Vercel/Railway)                      |
| **HTTP Headers**         | Helmet.js middleware                                    |
| **CORS**                 | Restricted to FRONTEND_URL                              |
| **Auth**                 | JWT with 7d expiry, bcrypt password hashing (12 rounds) |
| **Rate Limiting**        | @nestjs/throttler (10 requests/60s per IP)              |
| **Input Validation**     | class-validator whitelist + forbidNonWhitelisted        |
| **Payment Verification** | Razorpay HMAC-SHA256 signature validation               |
| **Secrets**              | Environment variables only, never in code               |

## 6. Cost Optimization Strategy

| Area               | Strategy                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| **AI Model**       | Default to `gpt-4o-mini` ($0.15/1K input tokens) — cheapest capable model |
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

## 8. Post-MVP Roadmap

- [ ] BullMQ queue for background AI generation (replace fire-and-forget)
- [ ] WebSocket/SSE for real-time script streaming to frontend
- [ ] Inline script editing with auto-save
- [ ] Download as .txt/.docx
- [ ] Admin panel (user management, credit adjustments, usage analytics)
- [ ] Email notifications (welcome, credit low, generation complete)
- [ ] Multiple AI model support with automatic fallback
- [ ] Image generation for thumbnails (DALL-E / Stable Diffusion via OpenRouter)
- [ ] Subscription auto-renewal via Razorpay webhooks
- [ ] Team/workspace accounts
- [ ] API rate limiting per user tier

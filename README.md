# YouTube Script Generator

AI-powered YouTube video script generation tool. Generate voiceover-ready scripts, SEO suggestions, and thumbnail images for your YouTube videos.

## Tech Stack

| Layer               | Technology                                             |
| ------------------- | ------------------------------------------------------ |
| **Frontend**        | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |
| **Backend**         | NestJS (TypeScript)                                    |
| **Database**        | PostgreSQL + Prisma ORM                                |
| **Cache/Queue**     | Redis + BullMQ                                         |
| **Auth**            | Better-Auth (email/password + Google OAuth)            |
| **AI**              | OpenRouter API (GPT-4o-mini, Gemini, Claude, DeepSeek, etc.) |
| **Image Gen**       | OpenRouter /chat/completions with output_modalities: ["image"] |
| **Payments**        | Razorpay                                               |
| **State Mgmt**      | Zustand (frontend global state)                        |
| **SSE**             | Server-Sent Events for real-time script streaming      |
| **Dev Environment** | Docker Compose                                         |

## Project Structure

```
YouTubeScriptGenerator/
├── docker-compose.yml       # Docker services (Postgres, Redis, Backend, Frontend)
├── .env.example             # Environment variables template
├── AGENTS.md                # Agent activity log & decisions
├── PLANS.md                 # Architecture plans & design decisions
├── README.md                # This file
│
├── backend/                 # NestJS API
│   ├── prisma/schema.prisma # Database schema (13 models)
│   └── src/
│       ├── main.ts          # Entry point (Helmet, CORS, ValidationPipe)
│       ├── app.module.ts    # Root module
│       ├── prisma/          # Database service
│       ├── common/          # Guards (roles, throttle-tier), decorators
│       ├── auth/            # JWT auth, register, login, Google OAuth, admin promotion
│       ├── users/           # User profile management
│       ├── script/          # Script generation, CRUD, thumbnail gen, regeneration
│       ├── ai-provider/     # OpenRouter integration (multi-model w/ fallback + image gen)
│       ├── credits/         # Credit balance & transactions (with cron jobs)
│       ├── payments/        # Razorpay integration + webhooks with signature verification
│       ├── otp/             # OTP verification for email and phone
│       ├── seo/             # AI-powered SEO suggestions (keywords, hashtags, tags, titles)
│       ├── thumbnail/       # Thumbnail concepts & image generation
│       ├── queue/           # BullMQ background job processing
│       ├── sse/             # Server-Sent Events streaming
│       ├── admin/           # Admin panel (users, stats, credits)
│       ├── email/           # Email notifications (welcome, credit low, generation complete)
│       └── health/          # Health check endpoint
│
└── frontend/                # Next.js 16 App Router
    └── src/
        ├── lib/             # Auth config, API client
        ├── stores/          # Zustand state management (auth, ui, scripts, credits)
        ├── components/
        │   ├── ui/          # Reusable UI kit (Button, Input, Card, Badge, LoadingSpinner)
        │   ├── AuthNav.tsx  # Auth-aware navigation
        │   ├── CheckoutModal.tsx  # Razorpay checkout with plan summary + phone + auto-renewal
        │   ├── InlineEditor.tsx  # Auto-saving script editor with .txt/.docx download
        │   ├── LazySection.tsx  # IntersectionObserver-based lazy loading
        │   ├── Providers.tsx    # Theme/auth providers
        │   └── SubscriptionCard.tsx  # Plan display card
        └── app/
            ├── page.tsx     # Landing page (hero, stats, features, pricing, CTA, footer)
            ├── about/       # About page — mission, story, offerings
            ├── help/        # Help Center — FAQ accordion (getting started, credits, scripts, SEO, technical)
            ├── contact/     # Contact page — email support + partnerships
            ├── auth/        # Login/Register page
            ├── admin/       # Standalone admin panel (users, stats, credits)
            ├── sitemap.ts   # Dynamic sitemap.xml
            ├── robots.ts    # Robots.txt
            └── dashboard/   # Authenticated area
                ├── layout.tsx      # Sidebar layout with auth guard
                ├── page.tsx        # Script generator wizard
                ├── scripts/        # Script library
                │   └── [id]/      # Script detail (tabs: script, SEO, thumbnail)
                ├── billing/        # Credit purchase with Razorpay checkout
                └── settings/       # Profile with email/phone verification
```

## Getting Started (Local Development)

### Prerequisites

- Docker & Docker Compose
- OpenRouter API key
- Razorpay test keys (optional for payments)
- Google OAuth credentials (optional for social login)

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```
3. Start the development environment:
   ```bash
   docker compose up
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api

## Production Deployment

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Vercel (Frontend)                               │
│  https://youtube-script-generator.vercel.app     │
│                                                   │
│  - Next.js 16 App Router                         │
│  - Server-side rendering, static generation      │
│  - Automatic SSL, CDN, edge caching              │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
                       ▼
┌──────────────────────────────────────────────────┐
│  Render (Backend API)                            │
│  https://ysg-backend.onrender.com                 │
│                                                    │
│  - NestJS API (Docker container)                  │
│  - Automatic SSL, health checks, auto-deploy     │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐   ┌──────────────────────┐
│  Supabase         │   │  Upstash Redis       │
│  (PostgreSQL)     │   │  (Cache + Queue)     │
│                    │   │                      │
│  - Free tier       │   │  - Free tier (30MB)  │
│  - PgBouncer pool  │   │  - TLS required      │
│  - 500MB storage   │   │  - Global replication│
└──────────────────┘   └──────────────────────┘
```

### Prerequisites

- GitHub account (connected to Vercel & Render)
- Supabase account (free tier) — [supabase.com](https://supabase.com)
- Upstash account (free tier) — [upstash.com](https://upstash.com)
- OpenRouter API key
- Razorpay account (for payments)
- (Optional) Google OAuth credentials

### Step 1: Prepare the Repository

1. Push your code to a GitHub repository
2. Ensure the following files exist in your repo root:
   - `vercel.json` — Vercel deployment config
   - `render.yaml` — Render Blueprint config (infrastructure-as-code)
   - `backend/Dockerfile` — Production Docker image for backend
   - `backend/startup.sh` — Production startup script with auto-migration
   - `backend/src/health/` — Health check endpoint at `/api/health`

### Step 2: Create Supabase PostgreSQL Database

1. Go to [supabase.com](https://supabase.com) → **Start a new project**
2. Name your project (e.g., `ytsg-db`) and set a strong database password
3. Wait for the database to provision (~2 minutes)
4. Navigate to **Project Settings → Database → Connection string**
5. Copy the **PgBouncer** connection string (port **6543**, not 5432):
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
   ```
6. **Important**: The URL must include `?pgbouncer=true&schema=public` for Prisma compatibility

### Step 3: Create Upstash Redis Database

1. Go to [upstash.com](https://upstash.com) → **Create Database**
2. Choose **Global** or a specific region close to your Render deployment
3. Once created, go to the database details → **REST API** section
4. Copy the following:
   - **UPSTASH_REDIS_REST_URL** — Extract the hostname (e.g., `us1-adequate-lion-12345.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** — This is your `REDIS_PASSWORD`
5. Set `REDIS_TLS_ENABLED=true` (Upstash requires TLS)

### Step 4: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `ysg-backend` |
   | **Runtime** | Docker |
   | **Dockerfile Path** | `./backend/Dockerfile` |
   | **Docker Context** | `./backend` |
   | **Plan** | Free |
   | **Health Check Path** | `/api/health` |
   | **Auto-Deploy** | Yes |

4. **Environment Variables** (set these manually):

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `DATABASE_URL` | Your Supabase PgBouncer connection string (from Step 2) |
   | `REDIS_HOST` | Your Upstash hostname (from Step 3) |
   | `REDIS_PORT` | `6379` |
   | `REDIS_PASSWORD` | Your Upstash REST token (from Step 3) |
   | `REDIS_TLS_ENABLED` | `true` |
   | `JWT_SECRET` | `openssl rand -base64 32` (generate a strong secret) |
   | `OPENROUTER_API_KEY` | Your OpenRouter key |
   | `FRONTEND_URL` | `https://youtube-script-generator.vercel.app` |
   | `RAZORPAY_KEY_ID` | Your Razorpay key ID |
   | `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
   | `RAZORPAY_WEBHOOK_SECRET` | Your Razorpay webhook secret |
   | `ADMIN_SECRET_KEY` | A strong random secret for admin promotion |
   | `RESEND_API_KEY` | (Optional) Resend API key for email |

5. Once deployed, note your backend URL: `https://ysg-backend.onrender.com`

### Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Configure the project:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Next.js |
   | **Root Directory** | `frontend/` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `.next` |

5. **Environment Variables** (required):

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://ysg-backend.onrender.com` |
   | `NEXT_PUBLIC_SITE_URL` | `https://youtube-script-generator.vercel.app` |
   | `BETTER_AUTH_SECRET` | A strong random secret |
   | `BETTER_AUTH_URL` | `https://youtube-script-generator.vercel.app` |

6. Click **Deploy**
7. After deployment, Vercel provides your frontend URL (e.g., `https://youtube-script-generator.vercel.app`)

### Step 4: Post-Deployment Configuration

1. **Update Razorpay Webhook**:
   - Go to Razorpay Dashboard → Settings → Webhooks
   - Add webhook URL: `https://ysg-backend.onrender.com/api/payments/webhook`
   - Select events: `payment.captured`, `subscription.charged`

2. **Create Admin User**:
   - Register a new account on the frontend
   - Send a POST request to promote to admin:
     ```bash
     curl -X POST https://ysg-backend.onrender.com/api/auth/make-admin \
       -H "Authorization: Bearer YOUR_JWT_TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"secretKey": "YOUR_ADMIN_SECRET_KEY"}'
     ```
   - Now access `https://youtube-script-generator.vercel.app/admin`

3. **Verify Health Check**:
   ```bash
   curl https://ysg-backend.onrender.com/api/health
   ```
   Expected response: `{ "status": "ok", "timestamp": "...", ... }`

### Step 5: Configure Custom Domain (Optional)

1. **Vercel**: Go to Project → Settings → Domains → Add your domain
2. **Render**: Go to Web Service → Settings → Custom Domain

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend shows `503` on deploy | Wait 2-3 minutes for first build + DB migration |
| CORS errors on frontend | Ensure `FRONTEND_URL` in backend env matches exactly |
| Prisma migration fails | Check `DATABASE_URL` — ensure SSL is enabled if required |
| Redis connection refused | Verify `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` match Render Redis dashboard |
| AI generation fails | Verify `OPENROUTER_API_KEY` is set and has sufficient credits |

### Production URLs (Update These)

After deployment, update these placeholders with your actual URLs:

- **Frontend**: `https://youtube-script-generator.vercel.app`
- **Backend**: `https://ysg-backend.onrender.com`
- **Health Check**: `https://ysg-backend.onrender.com/api/health`
- **Admin Panel**: `https://youtube-script-generator.vercel.app/admin`
- **Razorpay Webhook**: `https://ysg-backend.onrender.com/api/payments/webhook`

### Environment Variables

| Variable                  | Description                          |
| ------------------------- | ------------------------------------ |
| `OPENROUTER_API_KEY`      | OpenRouter API key for AI generation |
| `JWT_SECRET`              | Secret for JWT token signing         |
| `BETTER_AUTH_SECRET`      | Secret for Better-Auth               |
| `BETTER_AUTH_URL`         | Frontend URL for auth callbacks      |
| `GOOGLE_CLIENT_ID`        | Google OAuth client ID               |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth client secret           |
| `RAZORPAY_KEY_ID`         | Razorpay API key ID                  |
| `RAZORPAY_KEY_SECRET`     | Razorpay API secret                  |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signature secret    |
| `DATABASE_URL`            | PostgreSQL connection string         |
| `REDIS_URL`               | Redis connection string              |
| `REDIS_HOST`              | Redis host                           |
| `REDIS_PORT`              | Redis port                           |
| `REDIS_PASSWORD`          | Redis password                       |
| `FRONTEND_URL`            | Frontend URL for CORS                |
| `NEXT_PUBLIC_API_URL`     | Backend API URL for frontend         |
| `RESEND_API_KEY`          | Email sending API key (optional)     |

## API Endpoints

### Auth

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/make-admin` - Promote user to admin (requires `ADMIN_SECRET_KEY` env var)

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile (including phone number)

### Scripts

- `POST /api/scripts` - Create & generate script via BullMQ
- `GET /api/scripts` - List user's scripts (paginated)
- `GET /api/scripts/:id` - Get script details (with SEO, thumbnails, versions)
- `PUT /api/scripts/:id` - Update script content (inline editing)
- `PUT /api/scripts/:id/regenerate` - Regenerate script (saves version history)
- `DELETE /api/scripts/:id` - Delete script
- `POST /api/scripts/:id/download` - Download script (?format=txt|docx)
- `POST /api/scripts/:id/thumbnail` - Generate thumbnail image via AI
- `GET /api/scripts/:id/stream` - SSE stream for real-time generation

### Credits

- `GET /api/credits/balance` - Get credit balance
- `GET /api/credits/transactions` - Get transaction history

### Payments

- `GET /api/payments/pricing` - Get pricing plans
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Razorpay webhook (signature verified)

### OTP (Email & Phone Verification)

- `POST /api/otp/send` - Send OTP to email or phone
- `POST /api/otp/verify` - Verify OTP

### SEO

- `POST /api/seo/suggestions` - Generate SEO suggestions for a script
- `POST /api/seo/analyze` - Analyze and score SEO for a script

### Team / Workspace

- `POST /api/teams` - Create a team
- `GET /api/teams` - List user's teams
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/invite` - Invite member to team
- `POST /api/teams/join/:token` - Accept team invite
- `DELETE /api/teams/:id/members/:userId` - Remove team member

### Admin

- `GET /api/admin/users` - List all users (paginated)
- `GET /api/admin/users/:id` - Get user details with transactions
- `PATCH /api/admin/users/:id/credits` - Adjust user credits
- `GET /api/admin/stats` - Get platform statistics

### Health

- `GET /api/health` - Health check (status, timestamp, uptime, memory)

## Features

### Script Generation
- AI-powered script creation with voiceover-ready output
- Automatic hooks, sections, CTAs, and timestamp suggestions
- Niche-specific content (educational, tech reviews, faceless channels, etc.)
- Support for all video types (tutorials, vlogs, listicles, reviews, etc.)

### Multi-Model AI
- Automatic fallback across 6 models: GPT-4o-mini → Gemini Flash → DeepSeek → Llama 3.1 → GPT-4o → Claude 3.5
- 60s timeout per model; next model tried automatically on failure
- Per-model cost tracking in AI usage logs

### Thumbnail Image Generation
- Actual AI-generated thumbnail images (not just text concepts)
- Uses `POST /api/v1/chat/completions` with `output_modalities: ["image"]`
- Falls back across 4 models: `gemini-3.1-flash-lite-image` → `gemini-3.1-flash-image` → `seedream-4.5`
- Models return `data:image/jpeg;base64,...` data URLs stored in the database
- 1 credit per thumbnail generation, no charge on failure

### Real-Time Streaming (SSE)
- Server-Sent Events for live script generation progress
- Frontend subscribes via `GET /api/scripts/:id/stream`

### Background Job Processing (BullMQ)
- Reliable queue-based AI generation with retry logic
- Frees up API for immediate response while job processes in background
- Redis-backed job persistence

### Inline Script Editor
- Debounced auto-save (800ms) to prevent data loss
- Download as `.txt` or `.docx`
- Version history tracked on each regeneration

### SEO Optimization
- AI-generated keyword, hashtag, tag, and title suggestions
- SEO scoring (title, description, tags, hashtags)
- Competition level estimation
- Best posting time recommendations
- Fallback suggestions when AI fails

### Content Ideas
- Niche-specific content suggestions
- Content differentiation strategies

### Credit System
- Pay-per-credit model (1 credit = 1 script or 1 thumbnail)
- Credits deducted optimistically, refunded on failure
- Transaction ledger for full audit trail
- Cron job for subscription monthly credit grants
- Welcome bonus (5 credits) on signup

### Razorpay Integration
- Secure payment processing with order creation + verification
- Webhook handler with HMAC-SHA256 signature validation
- Subscription auto-renewal via webhooks
- CheckoutModal with plan summary, phone input, auto-renewal toggle

### Email Notifications
- Welcome email on signup
- Credit low warning
- Generation complete notification
- Powered by Resend API

### OTP Verification
- Email and phone OTP verification
- Supports both email OTP and SMS/phone OTP
- Verify email in settings page
- Verify phone number in settings page
- Verified badges shown next to email/phone

### User Authentication
- Email/password registration and login
- Google OAuth integration
- JWT with 7-day expiry
- bcrypt password hashing (12 rounds)

### Admin Panel
- Standalone `/admin` route (not in dashboard sidebar)
- User management with paginated table
- Credit adjustment modal for any user
- Platform statistics dashboard
- Secure admin promotion via `POST /auth/make-admin` with `ADMIN_SECRET_KEY`

### Security
- Helmet.js HTTP headers
- CORS restricted to FRONTEND_URL
- JWT authentication with guards
- Role-based access (@Roles decorator)
- Per-tier rate limiting (free: 10/min, pro: 60/min)
- Input validation with class-validator (whitelist + forbidNonWhitelisted)
- Razorpay HMAC-SHA256 signature validation

### Performance
- Lazy loading for below-fold content (IntersectionObserver)
- Font preloading (Inter), DNS prefetch for API/AI/Google services
- Static asset caching (1 year), image optimization (AVIF/WebP)
- Compression and security headers in Next.js config

### SEO & Metadata
- Open Graph cards, Twitter cards, JSON-LD structured data
- Dynamic sitemap.xml with all public pages
- Robots.txt with crawl rules

### Team/Workspace
- Create teams with slug-based URLs
- Invite members via email (token-based acceptance)
- Roles: owner, admin, member
- Optional team scoping on scripts and niches

### State Management (Zustand)
- 4 stores: auth (persisted), UI, scripts, credits
- Auth persisted to localStorage via Zustand persist middleware
- Credits store syncs with auth store for sidebar balance

### Admin Promotion
- Secure `POST /auth/make-admin` endpoint
- Requires `ADMIN_SECRET_KEY` env var — only known to app owner
- Returns 403 if secret key does not match

## License

Private project.
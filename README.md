# YouTube Script Generator

AI-powered YouTube video script generation tool. Generate voiceover-ready scripts, SEO suggestions, and thumbnail concepts for your YouTube videos.

## Tech Stack

| Layer               | Technology                                             |
| ------------------- | ------------------------------------------------------ |
| **Frontend**        | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |
| **Backend**         | NestJS (TypeScript)                                    |
| **Database**        | PostgreSQL + Prisma ORM                                |
| **Cache/Queue**     | Redis + BullMQ                                         |
| **Auth**            | Better-Auth (email/password + Google OAuth)            |
| **AI**              | OpenRouter API (GPT-4o-mini, Gemini, Claude, DeepSeek, etc.) |
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
│       ├── main.ts          # Entry point
│       ├── app.module.ts    # Root module
│       ├── prisma/          # Database service
│       ├── common/          # Guards (roles, throttle-tier), decorators
│       ├── auth/            # JWT auth, register, login, Google OAuth
│       ├── users/           # User profile management
│       ├── script/          # Script generation & CRUD
│       ├── ai-provider/     # OpenRouter integration (multi-model w/ fallback + image gen)
│       ├── credits/         # Credit balance & transactions (with cron jobs)
│       ├── payments/        # Razorpay integration + webhooks
│       ├── seo/             # SEO suggestions
│       ├── thumbnail/       # Thumbnail concepts & image generation
│       ├── queue/           # BullMQ background job processing
│       ├── sse/             # Server-Sent Events streaming
│       ├── admin/           # Admin panel (users, stats, credits)
│       ├── email/           # Email notifications service
│       └── sse/             # SSE real-time streaming
│
└── frontend/                # Next.js 16 App Router
    └── src/
        ├── lib/             # Auth config, API client
        ├── stores/          # Zustand state management (auth, ui, scripts, credits)
        ├── components/
        │   ├── ui/          # Reusable UI kit (Button, Input, Card, Badge, LoadingSpinner)
        │   ├── AuthNav.tsx  # Auth-aware navigation
        │   └── InlineEditor.tsx  # Auto-saving script editor
        └── app/
            ├── page.tsx     # Landing page (with auth redirect)
            ├── login/       # Login page
            ├── register/    # Register page
            └── dashboard/   # Dashboard (generator, scripts, billing, settings, admin)
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
│  Render (Backend API + Database + Redis)          │
│  https://ysg-backend.onrender.com                 │
│                                                    │
│  - NestJS API (Docker container)                  │
│  - PostgreSQL managed database                    │
│  - Redis managed cache + BullMQ queue             │
│  - Automatic SSL, health checks, auto-deploy     │
└──────────────────────────────────────────────────┘
```

### Prerequisites

- GitHub account (connected to Vercel & Render)
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

### Step 2: Deploy Backend to Render

#### Option A: Blueprint (Recommended — uses render.yaml)

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New → Blueprint**
3. Connect your GitHub repo
4. Render will automatically detect `render.yaml` and create:
   - **Web Service**: `ysg-backend` (Docker image)
   - **PostgreSQL**: `ysg-postgres` (free tier)
   - **Redis**: `ysg-redis` (free tier)
5. After creation, add the following **manual environment variables** in the Web Service dashboard:
   - `OPENROUTER_API_KEY` — Your OpenRouter key
   - `RAZORPAY_KEY_ID` — Your Razorpay key ID
   - `RAZORPAY_KEY_SECRET` — Your Razorpay secret
   - `RAZORPAY_WEBHOOK_SECRET` — Your Razorpay webhook secret
   - `ADMIN_SECRET_KEY` — A strong random secret for admin promotion
   - `RESEND_API_KEY` — (Optional) For email notifications

#### Option B: Manual Setup

1. **Create PostgreSQL Database**:
   - Go to **New → PostgreSQL**
   - Name: `ysg-postgres`
   - Database: `ysg_db`, User: `ysg_user`
   - Plan: Free
   - Note the **Internal Connection String**

2. **Create Redis Instance**:
   - Go to **New → Redis**
   - Name: `ysg-redis`
   - Plan: Free
   - Note the **Connection Details** (host, port, password)

3. **Create Web Service**:
   - Go to **New → Web Service**
   - Connect your GitHub repo
   - **Name**: `ysg-backend`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `./backend`
   - **Plan**: Free
   - **Health Check Path**: `/api/health`
   - **Auto-Deploy**: Yes

   - Add environment variables:

     | Variable | Value |
     |----------|-------|
     | `NODE_ENV` | `production` |
     | `PORT` | `4000` |
     | `DATABASE_URL` | (from PostgreSQL) |
     | `REDIS_HOST` | (from Redis) |
     | `REDIS_PORT` | (from Redis) |
     | `REDIS_PASSWORD` | (from Redis) |
     | `JWT_SECRET` | `openssl rand -base64 32` (generate) |
     | `OPENROUTER_API_KEY` | Your OpenRouter key |
     | `FRONTEND_URL` | `https://youtube-script-generator.vercel.app` |
     | `RAZORPAY_KEY_ID` | Your Razorpay key |
     | `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
     | `RAZORPAY_WEBHOOK_SECRET` | Your webhook secret |
     | `ADMIN_SECRET_KEY` | A strong random secret |
     | `RESEND_API_KEY` | (Optional) Resend API key |

4. Once deployed, note your backend URL: `https://ysg-backend.onrender.com`

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
- `PUT /api/users/profile` - Update profile

### Scripts

- `POST /api/scripts` - Create & generate script (enqueues BullMQ job)
- `GET /api/scripts` - List user's scripts
- `GET /api/scripts/:id` - Get script details
- `PUT /api/scripts/:id` - Update script content (inline editing)
- `PUT /api/scripts/:id/regenerate` - Regenerate script
- `DELETE /api/scripts/:id` - Delete script
- `POST /api/scripts/:id/download` - Download script (?format=txt|docx)
- `GET /api/scripts/:id/stream` - SSE stream for real-time generation

### Credits

- `GET /api/credits/balance` - Get credit balance
- `GET /api/credits/transactions` - Get transaction history

### Payments

- `GET /api/payments/pricing` - Get pricing plans
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Razorpay webhook (signature verified)

### Thumbnail (Image Generation)

- `POST /api/thumbnail/generate` - Generate thumbnail image via AI (DALL-E / Stable Diffusion)
- `GET /api/thumbnail/:scriptId` - Get generated thumbnails for a script

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

## Features

- **Script Generation**: AI-powered YouTube script generation via BullMQ background jobs with automatic model fallback
- **Multi-Model AI**: Automatic fallback across 6 models (GPT-4o-mini → Gemini Flash → DeepSeek → Llama 3.1 → GPT-4o → Claude 3.5)
- **Real-time Streaming**: SSE-powered live script generation progress
- **Inline Editing**: Debounced auto-save text editor with download options
- **SEO Optimization**: Keyword, hashtag, tag, and title suggestions
- **Thumbnail Concepts**: AI-generated thumbnail visual descriptions + actual image generation via DALL-E / Stable Diffusion
- **Credit System**: Pay-per-credit model with automatic refunds on failure
- **Razorpay Integration**: Secure payment processing with webhook verification
- **Subscription Management**: Auto-renewal via Razorpay webhooks
- **User Authentication**: Email/password + Google OAuth
- **Script Management**: Create, view, edit, regenerate, delete scripts
- **Version History**: Track script versions on regeneration
- **Admin Panel**: Standalone `/admin` page (not in dashboard sidebar) with user management, credit adjustments, platform stats
- **Admin Promotion**: Secure admin promotion via `POST /auth/make-admin` using `ADMIN_SECRET_KEY` environment variable
- **Rate Limiting**: Per-tier API rate limiting (free: 10/min, pro: 60/min)
- **Role-Based Access**: User/Admin roles with guarded endpoints
- **Zustand State Management**: Global state for auth, scripts, credits, UI
- **Team/Workspace Accounts**: Create teams, invite members, shared scripts

## Post-MVP Features (Implemented)

- [x] BullMQ queue for background AI generation (fire-and-forget → reliable queue)
- [x] SSE streaming for real-time script generation progress
- [x] Inline script editing with debounced auto-save
- [x] Download as .txt/.docx
- [x] Admin panel (user management, credit adjustments, usage analytics) — standalone `/admin` route
- [x] Admin promotion via `POST /auth/make-admin` with `ADMIN_SECRET_KEY` env var
- [x] Email notifications (welcome, credit low, generation complete)
- [x] Subscription auto-renewal via Razorpay webhooks
- [x] API rate limiting per user tier
- [x] Zustand global state management (4 stores: auth, ui, scripts, credits)
- [x] Multiple AI model support with automatic fallback (6 models)
- [x] Thumbnail image generation (DALL-E 3 / Stable Diffusion / Flux via OpenRouter)
- [x] Team/workspace accounts (Team, TeamMember, TeamInvite models)

## License

Private project.
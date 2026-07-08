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
| **AI**              | OpenRouter API (GPT-4o-mini, Claude, Gemini, etc.)     |
| **Payments**        | Razorpay                                               |
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
│   ├── prisma/schema.prisma # Database schema (10 models)
│   └── src/
│       ├── main.ts          # Entry point
│       ├── app.module.ts    # Root module
│       ├── prisma/          # Database service
│       ├── common/          # Guards, decorators
│       ├── auth/            # JWT auth, register, login, Google OAuth
│       ├── users/           # User profile management
│       ├── script/          # Script generation & CRUD
│       ├── ai-provider/     # OpenRouter integration
│       ├── credits/         # Credit balance & transactions
│       ├── payments/        # Razorpay integration
│       ├── seo/             # SEO suggestions
│       └── thumbnail/       # Thumbnail concepts
│
└── frontend/                # Next.js 16 App Router
    └── src/
        ├── lib/             # Auth config, API client
        └── app/
            ├── page.tsx     # Landing page
            ├── login/       # Login page
            ├── register/    # Register page
            └── dashboard/   # Dashboard (generator, scripts, billing, settings)
```

## Getting Started

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

### Environment Variables

| Variable               | Description                          |
| ---------------------- | ------------------------------------ |
| `OPENROUTER_API_KEY`   | OpenRouter API key for AI generation |
| `JWT_SECRET`           | Secret for JWT token signing         |
| `BETTER_AUTH_SECRET`   | Secret for Better-Auth               |
| `BETTER_AUTH_URL`      | Frontend URL for auth callbacks      |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID               |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret           |
| `RAZORPAY_KEY_ID`      | Razorpay API key ID                  |
| `RAZORPAY_KEY_SECRET`  | Razorpay API secret                  |
| `DATABASE_URL`         | PostgreSQL connection string         |
| `REDIS_URL`            | Redis connection string              |
| `FRONTEND_URL`         | Frontend URL for CORS                |
| `NEXT_PUBLIC_API_URL`  | Backend API URL for frontend         |

## API Endpoints

### Auth

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Scripts

- `POST /api/scripts` - Create & generate script
- `GET /api/scripts` - List user's scripts
- `GET /api/scripts/:id` - Get script details
- `PUT /api/scripts/:id/regenerate` - Regenerate script
- `DELETE /api/scripts/:id` - Delete script

### Credits

- `GET /api/credits/balance` - Get credit balance
- `GET /api/credits/transactions` - Get transaction history

### Payments

- `GET /api/payments/pricing` - Get pricing plans
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

## Features

- **Script Generation**: AI-powered YouTube script generation with hooks, sections, and CTAs
- **SEO Optimization**: Keyword, hashtag, tag, and title suggestions
- **Thumbnail Concepts**: AI-generated thumbnail visual descriptions
- **Credit System**: Pay-per-credit model with automatic refunds on failure
- **Razorpay Integration**: Secure payment processing
- **User Authentication**: Email/password + Google OAuth
- **Script Management**: Create, view, regenerate, delete scripts
- **Version History**: Track script versions on regeneration

## Post-MVP Roadmap

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

## License

Private project.

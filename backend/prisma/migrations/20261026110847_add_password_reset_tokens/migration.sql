-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ai_usage_logs_user_id_idx" ON "ai_usage_logs"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ai_usage_logs_created_at_idx" ON "ai_usage_logs"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "credit_transactions_user_id_idx" ON "credit_transactions"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "credit_transactions_created_at_idx" ON "credit_transactions"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "niches_teamId_idx" ON "niches"("teamId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "otp_verifications_user_id_idx" ON "otp_verifications"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "otp_verifications_expires_at_idx" ON "otp_verifications"("expires_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "script_versions_script_id_idx" ON "script_versions"("script_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "scripts_user_id_idx" ON "scripts"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "scripts_niche_id_idx" ON "scripts"("niche_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "scripts_teamId_idx" ON "scripts"("teamId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "team_invites_team_id_idx" ON "team_invites"("team_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "team_members_user_id_idx" ON "team_members"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "thumbnail_concepts_script_id_idx" ON "thumbnail_concepts"("script_id");

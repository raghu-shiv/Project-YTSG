-- DropForeignKey
ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "ai_usage_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "credit_transactions" DROP CONSTRAINT "credit_transactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "niches" DROP CONSTRAINT "niches_teamId_fkey";

-- DropForeignKey
ALTER TABLE "otp_verifications" DROP CONSTRAINT "otp_verifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "script_versions" DROP CONSTRAINT "script_versions_script_id_fkey";

-- DropForeignKey
ALTER TABLE "scripts" DROP CONSTRAINT "scripts_niche_id_fkey";

-- DropForeignKey
ALTER TABLE "scripts" DROP CONSTRAINT "scripts_teamId_fkey";

-- DropForeignKey
ALTER TABLE "scripts" DROP CONSTRAINT "scripts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "seo_suggestions" DROP CONSTRAINT "seo_suggestions_script_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "team_invites" DROP CONSTRAINT "team_invites_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "thumbnail_concepts" DROP CONSTRAINT "thumbnail_concepts_script_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "ai_usage_logs_user_id_idx" ON "ai_usage_logs"("user_id");

-- CreateIndex
CREATE INDEX "ai_usage_logs_created_at_idx" ON "ai_usage_logs"("created_at");

-- CreateIndex
CREATE INDEX "credit_transactions_user_id_idx" ON "credit_transactions"("user_id");

-- CreateIndex
CREATE INDEX "credit_transactions_created_at_idx" ON "credit_transactions"("created_at");

-- CreateIndex
CREATE INDEX "niches_teamId_idx" ON "niches"("teamId");

-- CreateIndex
CREATE INDEX "otp_verifications_user_id_idx" ON "otp_verifications"("user_id");

-- CreateIndex
CREATE INDEX "otp_verifications_expires_at_idx" ON "otp_verifications"("expires_at");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "script_versions_script_id_idx" ON "script_versions"("script_id");

-- CreateIndex
CREATE INDEX "scripts_user_id_idx" ON "scripts"("user_id");

-- CreateIndex
CREATE INDEX "scripts_niche_id_idx" ON "scripts"("niche_id");

-- CreateIndex
CREATE INDEX "scripts_teamId_idx" ON "scripts"("teamId");

-- CreateIndex
CREATE INDEX "team_invites_team_id_idx" ON "team_invites"("team_id");

-- CreateIndex
CREATE INDEX "team_members_user_id_idx" ON "team_members"("user_id");

-- CreateIndex
CREATE INDEX "thumbnail_concepts_script_id_idx" ON "thumbnail_concepts"("script_id");

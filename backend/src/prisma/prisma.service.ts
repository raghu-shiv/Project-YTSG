import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "stdout", level: "info" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
      ],
      // Render free tier has 512MB RAM — limit connections to avoid OOM
      // 9 connections × ~50MB each = 450MB + Node ~100MB = 550MB+ (exceeds 512MB)
      // 2 connections × ~50MB = 100MB + Node ~100MB = 200MB ✓
      datasourceUrl: process.env.DATABASE_URL?.includes("?")
        ? process.env.DATABASE_URL + "&connection_limit=2"
        : process.env.DATABASE_URL + "?connection_limit=2",
    });
  }

  async onModuleInit() {
    try {
      // Use a timeout promise to prevent hanging on Supabase PgBouncer
      await Promise.race([
        this.$connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database connection timed out after 15s")), 15000),
        ),
      ]);
      this.logger.log("Connected to PostgreSQL database");
    } catch (error) {
      this.logger.error("Failed to connect to database:");
      this.logger.error(error instanceof Error ? error.message : error);
      // Don't crash the app — allow retry
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Disconnected from PostgreSQL database");
  }
}

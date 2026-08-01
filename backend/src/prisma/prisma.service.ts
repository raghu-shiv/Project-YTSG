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

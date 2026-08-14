import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ScriptModule } from "./script/script.module";
import { AiProviderModule } from "./ai-provider/ai-provider.module";
import { SeoModule } from "./seo/seo.module";
import { CreditsModule } from "./credits/credits.module";
import { PaymentsModule } from "./payments/payments.module";
import { UsersModule } from "./users/users.module";
import { QueueModule } from "./queue/queue.module";
import { SseModule } from "./sse/sse.module";
import { AdminModule } from "./admin/admin.module";
import { EmailModule } from "./email/email.module";
import { HealthModule } from "./health/health.module";
import { OtpModule } from "./otp/otp.module";
import { ThrottleTierGuard } from "./common/guards/throttle-tier.guard";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      useFactory: () => {
        const host = process.env.REDIS_HOST || "localhost";
        const port = Number(process.env.REDIS_PORT || 6379);
        const password = process.env.REDIS_PASSWORD || undefined;
        const tlsEnabled = process.env.REDIS_TLS_ENABLED === "true";

        return {
          connection: {
            host,
            port,
            ...(password ? { password } : {}),
            ...(tlsEnabled ? { tls: {} } : {}),
            retryStrategy: (times: number) => Math.min(times * 200, 2000),
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ScriptModule,
    AiProviderModule,
    SeoModule,
    CreditsModule,
    PaymentsModule,
    QueueModule,
    SseModule,
    AdminModule,
    EmailModule,
    HealthModule,
    OtpModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottleTierGuard,
    },
  ],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ScriptModule } from "./script/script.module";
import { AiProviderModule } from "./ai-provider/ai-provider.module";
import { SeoModule } from "./seo/seo.module";
import { ThumbnailModule } from "./thumbnail/thumbnail.module";
import { CreditsModule } from "./credits/credits.module";
import { PaymentsModule } from "./payments/payments.module";
import { UsersModule } from "./users/users.module";
import { QueueModule } from "./queue/queue.module";
import { SseModule } from "./sse/sse.module";
import { AdminModule } from "./admin/admin.module";
import { EmailModule } from "./email/email.module";
import { ThrottleTierGuard } from "./common/guards/throttle-tier.guard";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || "redis",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD || undefined,
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
    ThumbnailModule,
    CreditsModule,
    PaymentsModule,
    QueueModule,
    SseModule,
    AdminModule,
    EmailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottleTierGuard,
    },
  ],
})
export class AppModule {}

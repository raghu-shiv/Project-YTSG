import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
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

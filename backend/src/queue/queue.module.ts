import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "../prisma/prisma.module";
import { AiProviderModule } from "../ai-provider/ai-provider.module";
import { SseModule } from "../sse/sse.module";
import { ScriptGenerationService } from "./script-generation.service";
import { ScriptGenerationProcessor } from "./script-generation.processor";

@Module({
  imports: [
    BullModule.registerQueue({ name: "script-generation" }),
    PrismaModule,
    AiProviderModule,
    SseModule,
  ],
  providers: [ScriptGenerationService, ScriptGenerationProcessor],
  exports: [ScriptGenerationService],
})
export class QueueModule {}
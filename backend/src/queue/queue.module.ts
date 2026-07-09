import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "../prisma/prisma.module";
import { AiProviderModule } from "../ai-provider/ai-provider.module";
import { ScriptGenerationProcessor } from "./script-generation.processor";
import { ScriptGenerationService } from "./script-generation.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "script-generation",
    }),
    PrismaModule,
    AiProviderModule,
  ],
  providers: [ScriptGenerationProcessor, ScriptGenerationService],
  exports: [ScriptGenerationService],
})
export class QueueModule {}

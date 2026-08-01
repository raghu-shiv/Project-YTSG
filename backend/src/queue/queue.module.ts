import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AiProviderModule } from "../ai-provider/ai-provider.module";
import { ScriptGenerationService } from "./script-generation.service";

@Module({
  imports: [PrismaModule, AiProviderModule],
  providers: [ScriptGenerationService],
  exports: [ScriptGenerationService],
})
export class QueueModule {}
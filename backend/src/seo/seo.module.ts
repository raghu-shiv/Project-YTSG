import { Module } from "@nestjs/common";
import { SeoController } from "./seo.controller";
import { SeoService } from "./seo.service";
import { AiProviderModule } from "../ai-provider/ai-provider.module";

@Module({
  imports: [AiProviderModule],
  controllers: [SeoController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule {}
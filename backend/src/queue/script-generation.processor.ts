import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AiProviderService } from "../ai-provider/ai-provider.service";
import { SseService } from "../sse/sse.service";

@Processor("script-generation")
export class ScriptGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(ScriptGenerationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProvider: AiProviderService,
    private readonly sseService: SseService,
  ) {
    super();
  }

  async process(job: Job<{ scriptId: string; topic: string; videoType: string; userId: string; nicheId?: string }>): Promise<void> {
    const { scriptId, topic, videoType, userId, nicheId } = job.data;

    try {
      // Emit progress: starting generation
      this.sseService.emit("progress", scriptId, { stage: "generating", message: "Generating script content..." });

      // Resolve niche name if provided
      let nicheName: string | undefined;
      if (nicheId) {
        const niche = await this.prisma.niche.findUnique({ where: { id: nicheId } });
        nicheName = niche?.name;
      }

      // Generate main script content
      const result = await this.aiProvider.generateScript(topic, videoType, nicheName);
      this.sseService.emit("progress", scriptId, { stage: "formatting", message: "Formatting script..." });

      // Parse outline from content
      const outline = this.parseOutline(result.content);

      // Generate SEO suggestions
      try {
        this.sseService.emit("progress", scriptId, { stage: "seo", message: "Generating SEO suggestions..." });
        const seoResult = await this.aiProvider.generateSeoSuggestions(topic, result.content);
        let seoData;
        try {
          let cleaned = seoResult.content.trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
          }
          seoData = JSON.parse(cleaned);
        } catch {
          this.logger.warn(`Failed to parse SEO JSON for ${scriptId}, using fallback`);
          seoData = { keywords: [], hashtags: [], tags: [], titleSuggestions: [] };
        }

        await this.prisma.seoSuggestion.upsert({
          where: { scriptId },
          create: {
            scriptId,
            keywords: seoData.keywords || [],
            hashtags: seoData.hashtags || [],
            tags: seoData.tags || [],
            titleSuggestions: seoData.titleSuggestions || [],
          },
          update: {
            keywords: seoData.keywords || [],
            hashtags: seoData.hashtags || [],
            tags: seoData.tags || [],
            titleSuggestions: seoData.titleSuggestions || [],
          },
        });
      } catch (err: any) {
        this.logger.warn(`SEO generation failed for ${scriptId}: ${err.message}`);
      }

      // Mark as completed
      await this.prisma.script.update({
        where: { id: scriptId },
        data: {
          content: result.content,
          outline,
          status: "completed",
          modelUsed: result.model,
          wordCount: result.content.split(/\s+/).length,
          creditsUsed: 1,
        },
      });

      // Log AI usage
      await this.prisma.aiUsageLog.create({
        data: {
          userId,
          endpoint: "script",
          model: result.model,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          costUsd: result.costUsd,
        },
      });

      this.sseService.emit("complete", scriptId, { status: "completed", scriptId });
      this.logger.log(`Script ${scriptId} generated successfully (model: ${result.model})`);
    } catch (error: any) {
      this.logger.error(`Script generation failed for ${scriptId}: ${error.message}`);

      // Refund script credit on failure
      try {
        const script = await this.prisma.script.findUnique({ where: { id: scriptId } });
        if (script) {
          await this.prisma.user.update({
            where: { id: script.userId },
            data: { scriptCredits: { increment: 1 } },
          });

          const updatedUser = await this.prisma.user.findUnique({
            where: { id: script.userId },
          });

          await this.prisma.creditTransaction.create({
            data: {
              userId: script.userId,
              type: "refund",
              amount: 1,
              balanceAfter: updatedUser!.scriptCredits,
              referenceId: scriptId,
              description: "Refund: Script generation failed",
            },
          });
        }

        await this.prisma.script.update({
          where: { id: scriptId },
          data: { status: "failed" },
        });
      } catch (innerErr: any) {
        this.logger.error(`Error during credit refund for ${scriptId}: ${innerErr.message}`);
      }

      this.sseService.emit("error", scriptId, { status: "failed", error: error.message, scriptId });
      throw error;
    }
  }

  private parseOutline(content: string): any {
    const lines = content.split("\n").filter((l) => l.trim());
    const sections: { title: string; timestamp?: string }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.match(/^#{1,3}\s/) ||
        trimmed.match(/^\d+\.\s/) ||
        trimmed.match(/^\[.*\]/)
      ) {
        const title = trimmed
          .replace(/^#{1,3}\s/, "")
          .replace(/^\d+\.\s/, "");
        const timestampMatch = trimmed.match(/(\d{1,2}:\d{2})/);
        sections.push({
          title,
          timestamp: timestampMatch ? timestampMatch[1] : undefined,
        });
      }
    }

    return sections.length > 0 ? sections : null;
  }
}
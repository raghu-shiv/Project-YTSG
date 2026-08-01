import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AiProviderService } from "../ai-provider/ai-provider.service";

@Injectable()
export class ScriptService {
  private readonly logger = new Logger(ScriptService.name);

  constructor(
    private prisma: PrismaService,
    private aiProvider: AiProviderService,
  ) {}

  async create(
    userId: string,
    data: { topic: string; videoType: string; nicheId?: string },
  ) {
    // Check script credits
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.scriptCredits < 1) {
      throw new BadRequestException(
        "Insufficient script credits. Please purchase more credits.",
      );
    }

    // Create script record
    const script = await this.prisma.script.create({
      data: {
        userId,
        topic: data.topic,
        videoType: data.videoType as any,
        nicheId: data.nicheId,
        status: "generating",
      },
    });

    // Deduct script credit
    await this.prisma.user.update({
      where: { id: userId },
      data: { scriptCredits: { decrement: 1 } },
    });

    await this.prisma.creditTransaction.create({
      data: {
        userId,
        type: "usage",
        amount: -1,
        balanceAfter: user.scriptCredits - 1,
        referenceId: script.id,
        description: `Script generation: ${data.topic}`,
      },
    });

    // Generate script via AI (async)
    this.generateScriptContent(
      script.id,
      data.topic,
      data.videoType,
      data.nicheId,
    ).catch((err) => {
      this.logger.error(
        `Script generation failed for ${script.id}: ${err.message}`,
      );
    });

    return script;
  }

  private async generateScriptContent(
    scriptId: string,
    topic: string,
    videoType: string,
    nicheId?: string,
  ) {
    try {
      let nicheName: string | undefined;
      if (nicheId) {
        const niche = await this.prisma.niche.findUnique({
          where: { id: nicheId },
        });
        nicheName = niche?.name;
      }

      const result = await this.aiProvider.generateScript(
        topic,
        videoType,
        nicheName,
      );

      // Parse outline from content
      const outline = this.parseOutline(result.content);

      // Generate SEO suggestions
      try {
        const seoResult = await this.aiProvider.generateSeoSuggestions(topic, result.content);
        let seoData;
        try {
          // Strip markdown code fences if present
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
      const script = await this.prisma.script.findUnique({
        where: { id: scriptId },
      });
      if (script) {
        await this.prisma.aiUsageLog.create({
          data: {
            userId: script.userId,
            endpoint: "script",
            model: result.model,
            promptTokens: result.promptTokens,
            completionTokens: result.completionTokens,
            costUsd: result.costUsd,
          },
        });
      }
    } catch (error: any) {
      // Refund script credit on failure
      const script = await this.prisma.script.findUnique({
        where: { id: scriptId },
      });
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

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [scripts, total] = await Promise.all([
      this.prisma.script.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          topic: true,
          status: true,
          videoType: true,
          wordCount: true,
          creditsUsed: true,
          createdAt: true,
        },
      }),
      this.prisma.script.count({ where: { userId } }),
    ]);

    return { scripts, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(scriptId: string, userId: string) {
    const script = await this.prisma.script.findFirst({
      where: { id: scriptId, userId },
      include: {
        seoSuggestions: true,
        thumbnailConcepts: true,
        versions: { orderBy: { versionNumber: "desc" }, take: 5 },
      },
    });

    if (!script) {
      throw new NotFoundException("Script not found");
    }

    return script;
  }

  async delete(scriptId: string, userId: string) {
    const script = await this.prisma.script.findFirst({
      where: { id: scriptId, userId },
    });

    if (!script) {
      throw new NotFoundException("Script not found");
    }

    await this.prisma.script.delete({ where: { id: scriptId } });
    return { message: "Script deleted successfully" };
  }

  async generateThumbnails(scriptId: string, userId: string) {
    const script = await this.prisma.script.findFirst({
      where: { id: scriptId, userId },
      include: { seoSuggestions: true },
    });

    if (!script) {
      throw new NotFoundException("Script not found");
    }

    if (!script.content) {
      throw new BadRequestException("Script has no content. Generate the script first.");
    }

    // Check thumbnail credits
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.thumbnailCredits < 1) {
      throw new BadRequestException("Insufficient thumbnail credits. Please purchase more credits.");
    }

    const topic = script.topic;
    const content = script.content;
    const keywords = script.seoSuggestions?.keywords?.join(", ") || "";

    // Generate concept description using text model
    const conceptResult = await this.aiProvider.generateThumbnailConcepts(topic, content);
    let concepts;
    try {
      concepts = JSON.parse(conceptResult.content);
    } catch {
      concepts = [];
    }

    const firstConcept = Array.isArray(concepts) && concepts.length > 0
      ? concepts[0]
      : { conceptDescription: `A visually striking thumbnail for "${topic}" with bold colors and text overlay`, textOverlaySuggestion: topic.substring(0, 50) };

    // Build image prompt
    const imagePrompt = `YouTube thumbnail: ${firstConcept.conceptDescription || firstConcept.description || ""}. Text overlay: "${firstConcept.textOverlaySuggestion || ""}". Keywords: ${keywords}. Professional, high-contrast, eye-catching design suitable for a YouTube video thumbnail.`;

    // Generate the actual image — try models until one works
    let imageUrl: string | null = null;
    let imageModel = "";

    // Image models on OpenRouter use /chat/completions with output_modalities: ["image"]
    // Cheapest first: gemini-3.1-flash-lite-image ($0.00003/token),
    // gemini-3.1-flash-image ($0.00006/token), seedream-4.5 ($0.04/image)
    const imageModelsToTry = [
      "google/gemini-3.1-flash-lite-image",
      "google/gemini-3.1-flash-image",
      "bytedance-seed/seedream-4.5",
    ];

    for (const model of imageModelsToTry) {
      try {
        const result = await this.aiProvider.generateImage(imagePrompt, { model, size: "1024x1024" });
        if (result.url) {
          imageUrl = result.url;
          imageModel = model;
          break;
        }
      } catch (err: any) {
        this.logger.warn(`Image model ${model} failed: ${err.message}`);
      }
    }

    // Only deduct thumbnail credit if image was generated
    if (imageUrl) {
      const balanceAfter = user.thumbnailCredits - 1;
      await this.prisma.user.update({
        where: { id: userId },
        data: { thumbnailCredits: { decrement: 1 } },
      });
      await this.prisma.creditTransaction.create({
        data: {
          userId,
          type: "usage",
          amount: -1,
          balanceAfter,
          referenceId: scriptId,
          description: `Thumbnail: ${script.topic} (${imageModel})`,
        },
      });
    }

    // Delete old thumbnail concepts for this script
    await this.prisma.thumbnailConcept.deleteMany({ where: { scriptId } });

    // Save new thumbnail concept
    const thumbnail = await this.prisma.thumbnailConcept.create({
      data: {
        scriptId,
        conceptDescription: firstConcept.conceptDescription || firstConcept.description || `Thumbnail for ${topic}`,
        textOverlaySuggestion: firstConcept.textOverlaySuggestion || null,
        imageUrl,
      },
    });

    return {
      message: imageUrl ? "Thumbnail generated" : "Thumbnail concept saved but image generation failed. No credit charged.",
      thumbnail,
      imageGenerated: !!imageUrl,
    };
  }

  async regenerate(scriptId: string, userId: string) {
    const script = await this.prisma.script.findFirst({
      where: { id: scriptId, userId },
    });

    if (!script) {
      throw new NotFoundException("Script not found");
    }

    // Check and deduct 1 script credit
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.scriptCredits < 1) {
      throw new BadRequestException("Insufficient script credits. Please purchase more credits.");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { scriptCredits: { decrement: 1 } },
    });

    await this.prisma.creditTransaction.create({
      data: {
        userId,
        type: "usage",
        amount: -1,
        balanceAfter: user.scriptCredits - 1,
        referenceId: scriptId,
        description: `Script regeneration: ${script.topic}`,
      },
    });

    // Save current version
    if (script.content) {
      const versionCount = await this.prisma.scriptVersion.count({
        where: { scriptId },
      });

      await this.prisma.scriptVersion.create({
        data: {
          scriptId,
          content: script.content,
          versionNumber: versionCount + 1,
        },
      });
    }

    // Reset and regenerate — keep existing thumbnails and SEO
    await this.prisma.script.update({
      where: { id: scriptId },
      data: { status: "generating", content: null, outline: Prisma.DbNull },
    });

    this.generateScriptContent(
      scriptId,
      script.topic,
      script.videoType,
      script.nicheId || undefined,
    ).catch((err) =>
      this.logger.error(`Regeneration failed for ${scriptId}: ${err.message}`),
    );

    return { message: "Regeneration started" };
  }
}
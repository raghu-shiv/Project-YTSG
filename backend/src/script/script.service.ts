import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AiProviderService } from "../ai-provider/ai-provider.service";
import { ScriptGenerationService } from "../queue/script-generation.service";

@Injectable()
export class ScriptService {
  private readonly logger = new Logger(ScriptService.name);

  constructor(
    private prisma: PrismaService,
    private aiProvider: AiProviderService,
    private queueService: ScriptGenerationService,
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

    // Enqueue script generation via BullMQ for background processing
    this.queueService.enqueue(
      script.id,
      data.topic,
      data.videoType,
      userId,
      data.nicheId,
    ).catch((err) => {
      this.logger.error(
        `Failed to enqueue script generation for ${script.id}: ${err.message}`,
      );
    });

    return script;
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

    // Enqueue script regeneration via BullMQ
    this.queueService.enqueue(
      scriptId,
      script.topic,
      script.videoType,
      userId,
      script.nicheId || undefined,
    ).catch((err) =>
      this.logger.error(`Failed to enqueue regeneration for ${scriptId}: ${err.message}`),
    );

    return { message: "Regeneration started" };
  }
}
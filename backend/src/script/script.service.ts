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
    // Check credits
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.creditBalance < 1) {
      throw new BadRequestException(
        "Insufficient credits. Please purchase more credits.",
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

    // Deduct credit
    await this.prisma.user.update({
      where: { id: userId },
      data: { creditBalance: { decrement: 1 } },
    });

    await this.prisma.creditTransaction.create({
      data: {
        userId,
        type: "usage",
        amount: -1,
        balanceAfter: user.creditBalance - 1,
        referenceId: script.id,
        description: `Script generation: ${data.topic}`,
      },
    });

    // Generate script via AI (async - could be moved to queue)
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

      // Parse outline from content (simple heuristic - split by ## or numbered sections)
      const outline = this.parseOutline(result.content);

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
          userId: (await this.prisma.script.findUnique({
            where: { id: scriptId },
          }))!.userId,
          endpoint: "script",
          model: result.model,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          costUsd: result.costUsd,
        },
      });
    } catch (error: any) {
      // Refund credit on failure
      const script = await this.prisma.script.findUnique({
        where: { id: scriptId },
      });
      if (script) {
        await this.prisma.user.update({
          where: { id: script.userId },
          data: { creditBalance: { increment: 1 } },
        });

        await this.prisma.creditTransaction.create({
          data: {
            userId: script.userId,
            type: "refund",
            amount: 1,
            balanceAfter: (await this.prisma.user.findUnique({
              where: { id: script.userId },
            }))!.creditBalance,
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
    let currentSection: string | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.match(/^#{1,3}\s/) ||
        trimmed.match(/^\d+\.\s/) ||
        trimmed.match(/^\[.*\]/)
      ) {
        currentSection = trimmed
          .replace(/^#{1,3}\s/, "")
          .replace(/^\d+\.\s/, "");
        const timestampMatch = trimmed.match(/(\d{1,2}:\d{2})/);
        sections.push({
          title: currentSection,
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

  async regenerate(scriptId: string, userId: string) {
    const script = await this.prisma.script.findFirst({
      where: { id: scriptId, userId },
    });

    if (!script) {
      throw new NotFoundException("Script not found");
    }

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

    // Reset and regenerate
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

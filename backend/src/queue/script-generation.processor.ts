import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PrismaService } from "../prisma/prisma.service";
import { AiProviderService } from "../ai-provider/ai-provider.service";

@Processor("script-generation")
export class ScriptGenerationProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProvider: AiProviderService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    const { scriptId, topic, videoType, userId } = job.data;

    try {
      const result = await this.aiProvider.generateScript(topic, videoType);

      await this.prisma.script.update({
        where: { id: scriptId },
        data: {
          content: result.content,
          title: topic,
          wordCount: result.content?.split(/\s+/).length || 0,
          status: "completed",
        },
      });
    } catch (error) {
      await this.prisma.script.update({
        where: { id: scriptId },
        data: { status: "failed" },
      });

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const newBalance = (user?.scriptCredits || 0) + 1;

      await this.prisma.creditTransaction.create({
        data: {
          userId,
          amount: 1,
          type: "refund",
          balanceAfter: newBalance,
          description: `Refund for failed script generation: ${topic}`,
        },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: { scriptCredits: newBalance },
      });
    }
  }
}
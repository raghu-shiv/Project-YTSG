import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class ScriptGenerationService {
  private readonly logger = new Logger(ScriptGenerationService.name);

  constructor(
    @InjectQueue("script-generation") private readonly queue: Queue,
  ) {}

  /**
   * Enqueue a script generation job to be processed by BullMQ.
   * Returns the job id for tracking progress.
   */
  async enqueue(
    scriptId: string,
    topic: string,
    videoType: string,
    userId: string,
    nicheId?: string,
  ) {
    const job = await this.queue.add(
      "generate",
      { scriptId, topic, videoType, userId, nicheId },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { age: 60 * 60 * 24 }, // keep for 24h
        removeOnFail: { age: 60 * 60 * 24 * 7 }, // keep for 7d
      },
    );
    this.logger.log(`Enqueued script generation job ${job.id} for script ${scriptId}`);
    return job;
  }
}
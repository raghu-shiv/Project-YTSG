import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class ScriptGenerationService {
  constructor(
    @InjectQueue("script-generation") private readonly queue: Queue,
  ) {}

  async enqueue(
    scriptId: string,
    topic: string,
    videoType: string,
    userId: string,
  ) {
    const job = await this.queue.add("generate", {
      scriptId,
      topic,
      videoType,
      userId,
    });
    return job.id;
  }
}

import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ScriptGenerationService {
  private readonly logger = new Logger(ScriptGenerationService.name);

  /**
   * For MVP, scripts are generated synchronously in ScriptService.
   * This service is a placeholder for future BullMQ queue integration.
   */
  async enqueue(
    _scriptId: string,
    _topic: string,
    _videoType: string,
    _userId: string,
  ) {
    this.logger.warn("BullMQ queue not available — scripts generate synchronously");
    return null;
  }
}
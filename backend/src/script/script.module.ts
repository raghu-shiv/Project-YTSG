import { Module } from "@nestjs/common";
import { ScriptController } from "./script.controller";
import { ScriptService } from "./script.service";
import { QueueModule } from "../queue/queue.module";

@Module({
  imports: [QueueModule],
  controllers: [ScriptController],
  providers: [ScriptService],
  exports: [ScriptService],
})
export class ScriptModule {}

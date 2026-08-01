import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller("health")
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}

import { Controller, Get, Param, Res, Req } from "@nestjs/common";
import { Response, Request } from "express";
import { SseService } from "./sse.service";
import { Public } from "../common/decorators/public.decorator";

@Controller()
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Get("scripts/:id/stream")
  @Public()
  async streamScript(
    @Param("id") id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const subscription = this.sseService.subscribe(id).subscribe({
      next: (event: any) => {
        res.write(`event: ${event.type}\n`);
        res.write(`data: ${event.data}\n\n`);
      },
      error: () => res.end(),
      complete: () => res.end(),
    });

    req.on("close", () => {
      subscription.unsubscribe();
      res.end();
    });
  }
}

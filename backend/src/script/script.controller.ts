import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ScriptService } from "./script.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("scripts")
@UseGuards(JwtAuthGuard)
export class ScriptController {
  constructor(private scriptService: ScriptService) {}

  @Post()
  create(
    @Req() req: any,
    @Body() body: { topic: string; videoType: string; nicheId?: string },
  ) {
    return this.scriptService.create(req.user.id, body);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.scriptService.findAll(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get(":id")
  findOne(@Req() req: any, @Param("id") id: string) {
    return this.scriptService.findOne(id, req.user.id);
  }

  @Put(":id/regenerate")
  regenerate(@Req() req: any, @Param("id") id: string) {
    return this.scriptService.regenerate(id, req.user.id);
  }

  @Post(":id/generate-thumbnails")
  generateThumbnails(@Req() req: any, @Param("id") id: string) {
    return this.scriptService.generateThumbnails(id, req.user.id);
  }

  @Delete(":id")
  delete(@Req() req: any, @Param("id") id: string) {
    return this.scriptService.delete(id, req.user.id);
  }
}

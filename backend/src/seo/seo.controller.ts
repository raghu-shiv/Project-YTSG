import { Controller, Post, Body, UseGuards, Get, Query } from "@nestjs/common";
import { SeoService } from "./seo.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("seo")
@UseGuards(JwtAuthGuard)
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Post("suggestions")
  async getSuggestions(
    @Body() body: { topic: string; scriptContent: string },
  ) {
    const suggestions = await this.seoService.generateSeoSuggestions(
      body.topic,
      body.scriptContent,
    );
    return { success: true, data: suggestions };
  }

  @Post("analyze")
  async analyzeScore(
    @Body()
    body: {
      title: string;
      description: string;
      tags: string[];
      content: string;
    },
  ) {
    const score = await this.seoService.analyzeSeoScore(
      body.title,
      body.description,
      body.tags,
      body.content,
    );
    return { success: true, data: score };
  }
}
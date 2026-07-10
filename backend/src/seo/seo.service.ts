import { Injectable, Logger } from "@nestjs/common";
import { AiProviderService } from "../ai-provider/ai-provider.service";

export interface SeoSuggestions {
  keywords: string[];
  hashtags: string[];
  tags: string[];
  titleSuggestions: string[];
  description: string;
  bestPostingTime?: string;
  competitionLevel?: "low" | "medium" | "high";
}

export interface SeoScore {
  overall: number;
  titleScore: number;
  descriptionScore: number;
  tagsScore: number;
  hashtagsScore: number;
  suggestions: string[];
}

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);

  constructor(private readonly aiProvider: AiProviderService) {}

  /**
   * Generate SEO suggestions for a given topic and script content.
   */
  async generateSeoSuggestions(
    topic: string,
    scriptContent: string,
  ): Promise<SeoSuggestions> {
    try {
      const result = await this.aiProvider.generateSeoSuggestions(
        topic,
        scriptContent,
      );

      // Parse the JSON response from AI
      const parsed = this.parseSeoResponse(result.content);

      return {
        keywords: parsed.keywords || [],
        hashtags: parsed.hashtags || [],
        tags: parsed.tags || [],
        titleSuggestions: parsed.titleSuggestions || [],
        description: this.generateDescription(topic, parsed.keywords || []),
        bestPostingTime: this.getBestPostingTime(topic),
        competitionLevel: this.estimateCompetition(topic),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate SEO suggestions: ${error.message}`,
      );
      // Return fallback suggestions
      return this.getFallbackSuggestions(topic);
    }
  }

  /**
   * Analyze a script's SEO score and provide improvement suggestions.
   */
  async analyzeSeoScore(
    title: string,
    description: string,
    tags: string[],
    content: string,
  ): Promise<SeoScore> {
    const titleScore = this.calculateTitleScore(title);
    const descriptionScore = this.calculateDescriptionScore(description);
    const tagsScore = this.calculateTagsScore(tags, content);
    const hashtagsScore = this.calculateHashtagsScore(tags);

    const overall = Math.round(
      (titleScore + descriptionScore + tagsScore + hashtagsScore) / 4,
    );

    const suggestions: string[] = [];

    if (titleScore < 70) {
      suggestions.push(
        "Title should be under 60 characters and include primary keyword near the beginning",
      );
    }
    if (descriptionScore < 70) {
      suggestions.push(
        "Description should be 200+ characters with keywords in the first 2 sentences",
      );
    }
    if (tagsScore < 70) {
      suggestions.push(
        "Use 10-15 relevant tags including long-tail variations",
      );
    }
    if (hashtagsScore < 70) {
      suggestions.push(
        "Add 3-5 hashtags in the description for better discoverability",
      );
    }

    return {
      overall,
      titleScore,
      descriptionScore,
      tagsScore,
      hashtagsScore,
      suggestions,
    };
  }

  private calculateTitleScore(title: string): number {
    let score = 50;
    if (title.length >= 30 && title.length <= 60) score += 20;
    else if (title.length < 30) score += 10;
    if (title.includes("|") || title.includes("-")) score += 10;
    if (title.split(" ").length >= 5) score += 10;
    if (!/[A-Z]/.test(title[0])) score -= 10;
    return Math.min(100, Math.max(0, score));
  }

  private calculateDescriptionScore(description: string): number {
    let score = 40;
    if (description.length >= 200) score += 20;
    else if (description.length >= 100) score += 10;
    if (description.includes("http") || description.includes("link")) score += 10;
    if (description.includes("?")) score += 10;
    if (description.split(".").length >= 3) score += 10;
    if (description.split(" ").length >= 50) score += 10;
    return Math.min(100, Math.max(0, score));
  }

  private calculateTagsScore(tags: string[], content: string): number {
    let score = 40;
    if (tags.length >= 10) score += 20;
    else if (tags.length >= 5) score += 10;
    const contentLower = content.toLowerCase();
    const matchingTags = tags.filter((tag) =>
      contentLower.includes(tag.toLowerCase()),
    ).length;
    if (matchingTags >= tags.length * 0.5) score += 20;
    else if (matchingTags > 0) score += 10;
    return Math.min(100, Math.max(0, score));
  }

  private calculateHashtagsScore(tags: string[]): number {
    const hashtags = tags.filter((t) => t.startsWith("#"));
    let score = 50;
    if (hashtags.length >= 3) score += 30;
    else if (hashtags.length >= 1) score += 15;
    if (hashtags.every((h) => h.length <= 20)) score += 20;
    return Math.min(100, Math.max(0, score));
  }

  private parseSeoResponse(content: string): Partial<SeoSuggestions> {
    try {
      // Try direct JSON parse first
      const parsed = JSON.parse(content);
      return {
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        titleSuggestions: Array.isArray(parsed.titleSuggestions)
          ? parsed.titleSuggestions
          : [],
      };
    } catch {
      // Fallback: try to extract from markdown code block
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[1].trim());
          return {
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
            tags: Array.isArray(parsed.tags) ? parsed.tags : [],
            titleSuggestions: Array.isArray(parsed.titleSuggestions)
              ? parsed.titleSuggestions
              : [],
          };
        }
      } catch {
        // Ignore nested parse error
      }
      return {};
    }
  }

  private generateDescription(topic: string, keywords: string[]): string {
    const keywordStr =
      keywords.length > 0
        ? keywords.slice(0, 5).join(", ")
        : "YouTube, video, content";
    return `In this video, we explore ${topic}. Learn about the key aspects and insights that will help you understand this topic better. ${keywordStr ? `Keywords: ${keywordStr}.` : ""} Watch till the end for a complete overview and actionable takeaways. Don't forget to like, share, and subscribe for more content like this!`;
  }

  private getBestPostingTime(topic: string): string {
    const topicLower = topic.toLowerCase();
    if (
      topicLower.includes("tech") ||
      topicLower.includes("review") ||
      topicLower.includes("gadget")
    ) {
      return "Weekdays 12-2 PM EST (tech audience peak)";
    }
    if (
      topicLower.includes("education") ||
      topicLower.includes("tutorial") ||
      topicLower.includes("learn")
    ) {
      return "Weekdays 6-8 PM EST (after work/school)";
    }
    if (
      topicLower.includes("entertainment") ||
      topicLower.includes("vlog")
    ) {
      return "Weekends 10 AM - 2 PM EST (leisure browsing)";
    }
    return "Weekdays 2-4 PM EST (general peak)";
  }

  private estimateCompetition(topic: string): "low" | "medium" | "high" {
    const topicLower = topic.toLowerCase();
    const highCompetition = [
      "gaming",
      "reaction",
      "comedy",
      "music",
      "vlog",
      "challenge",
    ];
    const mediumCompetition = [
      "tech",
      "review",
      "tutorial",
      "how to",
      "education",
      "fitness",
    ];

    if (highCompetition.some((h) => topicLower.includes(h))) return "high";
    if (mediumCompetition.some((m) => topicLower.includes(m))) return "medium";
    return "low";
  }

  private getFallbackSuggestions(topic: string): SeoSuggestions {
    const words = topic.split(" ").filter((w) => w.length > 3);
    return {
      keywords: [topic, ...words.slice(0, 5)],
      hashtags: [
        `#${topic.replace(/\s+/g, "")}`,
        "#YouTubeTips",
        "#ContentCreation",
        "#VideoMarketing",
        "#ScriptWriting",
      ],
      tags: [
        topic,
        ...words.slice(0, 8),
        "YouTube script",
        "video content",
        "script writing",
      ],
      titleSuggestions: [
        `${topic}: Complete Guide for Beginners`,
        `How to Master ${topic} in 2026`,
        `${topic} Explained: Everything You Need to Know`,
        `The Ultimate ${topic} Tutorial`,
        `${topic} Tips & Tricks You Need to Know`,
      ],
      description: this.generateDescription(topic, words),
      bestPostingTime: this.getBestPostingTime(topic),
      competitionLevel: this.estimateCompetition(topic),
    };
  }
}
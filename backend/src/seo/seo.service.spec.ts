import { Test, TestingModule } from "@nestjs/testing";
import { SeoService } from "./seo.service";
import { AiProviderService } from "../ai-provider/ai-provider.service";

describe("SeoService", () => {
  let seoService: SeoService;
  let aiProvider: any;

  const mockAiProvider = {
    generateSeoSuggestions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeoService,
        { provide: AiProviderService, useValue: mockAiProvider },
      ],
    }).compile();

    seoService = module.get<SeoService>(SeoService);
    aiProvider = module.get(AiProviderService);
    jest.clearAllMocks();
  });

  describe("generateSeoSuggestions", () => {
    it("should parse AI response and return structured suggestions", async () => {
      mockAiProvider.generateSeoSuggestions.mockResolvedValue({
        content: JSON.stringify({
          keywords: ["youtube tips", "content creation", "video marketing"],
          hashtags: ["#YouTubeTips", "#ContentCreation"],
          tags: ["youtube", "content", "video", "marketing"],
          titleSuggestions: ["10 YouTube Tips", "How to Grow on YouTube"],
        }),
        model: "openai/gpt-4o-mini",
        promptTokens: 100,
        completionTokens: 50,
        costUsd: 0.0001,
      });

      const result = await seoService.generateSeoSuggestions(
        "YouTube Tips",
        "Script content here...",
      );

      expect(result.keywords).toContain("youtube tips");
      expect(result.hashtags).toContain("#YouTubeTips");
      expect(result.titleSuggestions).toHaveLength(2);
      expect(result.description).toBeDefined();
      expect(result.bestPostingTime).toBeDefined();
      expect(result.competitionLevel).toBeDefined();
    });

    it("should parse AI response from markdown code block", async () => {
      mockAiProvider.generateSeoSuggestions.mockResolvedValue({
        content: '```json\n{"keywords": ["test"], "hashtags": ["#test"], "tags": ["test"], "titleSuggestions": ["Test Title"]}\n```',
        model: "openai/gpt-4o-mini",
        promptTokens: 50,
        completionTokens: 30,
        costUsd: 0.00005,
      });

      const result = await seoService.generateSeoSuggestions("Test", "Content");

      expect(result.keywords).toContain("test");
      expect(result.hashtags).toContain("#test");
    });

    it("should return fallback suggestions when AI fails", async () => {
      mockAiProvider.generateSeoSuggestions.mockRejectedValue(
        new Error("AI service unavailable"),
      );

      const result = await seoService.generateSeoSuggestions(
        "Test Topic",
        "Content",
      );

      expect(result.keywords).toContain("Test Topic");
      expect(result.hashtags.length).toBeGreaterThan(0);
      expect(result.titleSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe("analyzeSeoScore", () => {
    it("should return SEO scores with suggestions", async () => {
      const result = await seoService.analyzeSeoScore(
        "Perfect Title for SEO | 2026 Guide",
        "This is a comprehensive description that covers all the key aspects of the topic. It includes multiple sentences and relevant keywords for better search engine optimization.",
        ["youtube", "seo", "content", "marketing", "tips", "guide", "tutorial", "video", "ranking", "optimization"],
        "This is the full content of the script that includes relevant keywords.",
      );

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(100);
      expect(result.titleScore).toBeGreaterThanOrEqual(0);
      expect(result.descriptionScore).toBeGreaterThanOrEqual(0);
      expect(result.tagsScore).toBeGreaterThanOrEqual(0);
      expect(result.hashtagsScore).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it("should provide actionable suggestions for low scores", async () => {
      const result = await seoService.analyzeSeoScore("Short", "Brief", [], "Short content");

      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("competition estimation", () => {
    it("should estimate high competition for gaming topics", async () => {
      mockAiProvider.generateSeoSuggestions.mockRejectedValue(new Error("Fail"));

      const result = await seoService.generateSeoSuggestions("gaming video", "Content");

      expect(result.competitionLevel).toBe("high");
    });

    it("should estimate low competition for niche topics", async () => {
      mockAiProvider.generateSeoSuggestions.mockRejectedValue(new Error("Fail"));

      const result = await seoService.generateSeoSuggestions("Quantum Physics for Beginners", "Content");

      expect(result.competitionLevel).toBe("low");
    });
  });
});
import { Test, TestingModule } from "@nestjs/testing";
import { AiProviderService } from "./ai-provider.service";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("AiProviderService", () => {
  let service: AiProviderService;

  const OLD_ENV = process.env;

  beforeAll(() => {
    process.env.OPENROUTER_API_KEY = "test-api-key";
    process.env.FRONTEND_URL = "http://localhost:3000";
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiProviderService],
    }).compile();

    service = module.get<AiProviderService>(AiProviderService);
    jest.clearAllMocks();
  });

  describe("generateCompletion", () => {
    const mockSuccessResponse = {
      data: {
        choices: [{ message: { content: "Test response content" } }],
        usage: { prompt_tokens: 50, completion_tokens: 100 },
      },
    };

    const mockErrorResponse = {
      response: { status: 429, data: { error: { message: "Rate limited" } } },
    };

    it("should generate completion successfully with preferred model", async () => {
      mockedAxios.post.mockResolvedValue(mockSuccessResponse);

      const result = await service.generateCompletion(
        "Test prompt",
        "Test system prompt",
        { model: "openai/gpt-4o-mini", temperature: 0.7, maxTokens: 1000 },
      );

      expect(result.content).toBe("Test response content");
      expect(result.model).toBe("openai/gpt-4o-mini");
      expect(result.promptTokens).toBe(50);
      expect(result.completionTokens).toBe(100);
      expect(result.costUsd).toBeGreaterThan(0);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should fallback to next model when preferred model fails", async () => {
      mockedAxios.post
        .mockRejectedValueOnce(mockErrorResponse)
        .mockResolvedValueOnce(mockSuccessResponse);

      const result = await service.generateCompletion(
        "Test prompt",
        "Test system prompt",
      );

      expect(result.content).toBe("Test response content");
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });

    it("should throw error when all models fail", async () => {
      mockedAxios.post.mockRejectedValue(mockErrorResponse);

      await expect(
        service.generateCompletion("Test prompt", "Test system prompt"),
      ).rejects.toThrow("AI generation failed after trying all models");
    });

    it("should handle empty API key gracefully", async () => {
      delete process.env.OPENROUTER_API_KEY;
      const module = await Test.createTestingModule({
        providers: [AiProviderService],
      }).compile();
      const serviceNoKey = module.get<AiProviderService>(AiProviderService);

      mockedAxios.post.mockRejectedValue(new Error("Unauthorized"));

      await expect(
        serviceNoKey.generateCompletion("test", "test"),
      ).rejects.toThrow();
    });
  });

  describe("generateScript", () => {
    it("should generate a script with proper prompts", async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          choices: [{ message: { content: "Generated script content" } }],
          usage: { prompt_tokens: 100, completion_tokens: 500 },
        },
      });

      const result = await service.generateScript("How to Code", "educational", "Technology");

      expect(result.content).toBe("Generated script content");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/chat/completions"),
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: "system" }),
            expect.objectContaining({ role: "user" }),
          ]),
        }),
        expect.any(Object),
      );
    });
  });

  describe("generateSeoSuggestions", () => {
    it("should generate SEO suggestions", async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                keywords: ["keyword1", "keyword2"],
                hashtags: ["#tag1", "#tag2"],
                tags: ["tag1", "tag2"],
                titleSuggestions: ["Title 1", "Title 2"],
              }),
            },
          }],
          usage: { prompt_tokens: 50, completion_tokens: 100 },
        },
      });

      const result = await service.generateSeoSuggestions("Test Topic", "Script content here");

      expect(result.content).toContain("keyword1");
    });
  });

  describe("generateImage", () => {
    const mockImageResponse = {
      data: {
        choices: [{
          message: {
            role: "assistant",
            content: "",
            images: [
              { type: "image_url", image_url: { url: "data:image/jpeg;base64,/9j/4AAQ==" } }
            ],
          },
        }],
        usage: { cost: 0.0001 },
      },
    };

    const mockErrorResponse = new Error("Model unavailable");

    it("should generate an image successfully via /chat/completions", async () => {
      mockedAxios.post.mockResolvedValue(mockImageResponse);

      const result = await service.generateImage("A test image prompt");

      expect(result.url).toBe("data:image/jpeg;base64,/9j/4AAQ==");
      expect(result.model).toBe("google/gemini-3.1-flash-lite-image");
      expect(result.costUsd).toBeGreaterThan(0);
      // Verify it uses the correct endpoint
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/chat/completions"),
        expect.objectContaining({
          output_modalities: ["image"],
        }),
        expect.any(Object),
      );
    });

    it("should throw error when image generation fails", async () => {
      mockedAxios.post.mockRejectedValue(mockErrorResponse);

      await expect(
        service.generateImage("Test prompt"),
      ).rejects.toThrow("Model unavailable");
    });
  });
});
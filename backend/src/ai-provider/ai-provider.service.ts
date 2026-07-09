import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AICompletionResult {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
}

interface ImageGenerationResult {
  url: string;
  model: string;
  costUsd: number;
}

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);
  private readonly baseUrl = "https://openrouter.ai/api/v1";
  private readonly apiKey: string;

  // Ordered list of models for automatic fallback
  private readonly modelPriority: string[] = [
    "openai/gpt-4o-mini", // Fast, cheap, reliable
    "google/gemini-1.5-flash", // Very cheap fallback
    "deepseek/deepseek-chat", // Cheap fallback
    "meta-llama/llama-3.1-8b-instruct", // Free/ultra-cheap fallback
    "openai/gpt-4o", // Premium fallback
    "anthropic/claude-3.5-sonnet", // Premium fallback
  ];

  // Image generation models
  private readonly imageModels: string[] = [
    "openai/dall-e-3",
    "stabilityai/stable-diffusion-xl",
    "black-forest-labs/flux-schnell",
  ];

  // Model pricing (per 1K tokens in USD) - approximate costs
  private readonly modelCosts: Record<
    string,
    { input: number; output: number }
  > = {
    "openai/gpt-4o-mini": { input: 0.00015, output: 0.0006 },
    "openai/gpt-4o": { input: 0.0025, output: 0.01 },
    "anthropic/claude-3.5-sonnet": { input: 0.003, output: 0.015 },
    "google/gemini-1.5-flash": { input: 0.000075, output: 0.0003 },
    "meta-llama/llama-3.1-8b-instruct": { input: 0.00005, output: 0.00005 },
    "deepseek/deepseek-chat": { input: 0.00014, output: 0.00028 },
  };

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    if (!this.apiKey) {
      this.logger.warn("OPENROUTER_API_KEY not set. AI features will fail.");
    }
  }

  async generateCompletion(
    prompt: string,
    systemPrompt: string,
    options: AICompletionOptions = {},
  ): Promise<AICompletionResult> {
    const preferredModel = options.model || "openai/gpt-4o-mini";
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 4096;

    // Build model list: preferred first, then fallbacks
    const modelsToTry = [
      preferredModel,
      ...this.modelPriority.filter((m) => m !== preferredModel),
    ];

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const result = await this.callOpenRouter(
          model,
          prompt,
          systemPrompt,
          temperature,
          maxTokens,
        );
        return result;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `Model ${model} failed: ${error.message}. Trying next model...`,
        );
        // Continue to next model
      }
    }

    this.logger.error(
      `All AI models failed. Last error: ${lastError?.message}`,
    );
    throw new Error(
      `AI generation failed after trying all models: ${lastError?.message}`,
    );
  }

  private async callOpenRouter(
    model: string,
    prompt: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
  ): Promise<AICompletionResult> {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
          "X-Title": "YouTube Script Generator",
        },
        timeout: 60000, // 60 second timeout
      },
    );

    const data = response.data;
    const content = data.choices[0]?.message?.content || "";
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0 };
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;

    // Calculate cost
    const costs = this.modelCosts[model] || {
      input: 0.00015,
      output: 0.0006,
    };
    const costUsd =
      (promptTokens / 1000) * costs.input +
      (completionTokens / 1000) * costs.output;

    return {
      content,
      model,
      promptTokens,
      completionTokens,
      costUsd: parseFloat(costUsd.toFixed(6)),
    };
  }

  async generateImage(
    prompt: string,
    options: { model?: string; size?: string } = {},
  ): Promise<ImageGenerationResult> {
    const preferredModel = options.model || "openai/dall-e-3";
    const size = options.size || "1024x1024";

    const modelsToTry = [
      preferredModel,
      ...this.imageModels.filter((m) => m !== preferredModel),
    ];

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const result = await this.callImageModel(model, prompt, size);
        return result;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(
          `Image model ${model} failed: ${error.message}. Trying next...`,
        );
      }
    }

    throw new Error(`Image generation failed: ${lastError?.message}`);
  }

  private async callImageModel(
    model: string,
    prompt: string,
    size: string,
  ): Promise<ImageGenerationResult> {
    const response = await axios.post(
      `${this.baseUrl}/image/generations`,
      {
        model,
        prompt,
        size,
        n: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
          "X-Title": "YouTube Script Generator",
        },
        timeout: 120000, // 2 minute timeout for image generation
      },
    );

    const data = response.data;
    const url = data.data?.[0]?.url || "";

    // Estimate cost (image models are typically $0.02-$0.08 per image)
    const costUsd = model.includes("dall-e") ? 0.04 : 0.02;

    return { url, model, costUsd };
  }

  async generateScript(
    topic: string,
    videoType: string,
    niche?: string,
  ): Promise<AICompletionResult> {
    const systemPrompt = `You are an expert YouTube script writer. Create a detailed, voiceover-ready script for a ${videoType} video.
The script should include:
1. An attention-grabbing hook (first 15 seconds)
2. Main content sections with clear transitions
3. A strong call-to-action at the end
4. Timestamps for each section
5. Visual/thumbnail suggestions in [brackets]

Format the output as a structured script with clear section headers.`;

    const prompt = `Write a YouTube script about: "${topic}"${niche ? `\nNiche: ${niche}` : ""}
Video Type: ${videoType}

Make it engaging, educational, and optimized for retention. Include timestamps and visual cues.`;

    return this.generateCompletion(prompt, systemPrompt, {
      model: "openai/gpt-4o-mini",
      temperature: 0.8,
      maxTokens: 4096,
    });
  }

  async generateSeoSuggestions(
    topic: string,
    scriptContent: string,
  ): Promise<AICompletionResult> {
    const systemPrompt = `You are a YouTube SEO expert. Analyze the given script and topic to provide:
1. 10-15 high-ranking keywords
2. 5-10 relevant hashtags
3. 5-10 tags
4. 3-5 attention-grabbing title suggestions

Return the response as a JSON object with keys: keywords, hashtags, tags, titleSuggestions.`;

    const prompt = `Topic: ${topic}\n\nScript:\n${scriptContent.substring(0, 3000)}`;

    return this.generateCompletion(prompt, systemPrompt, {
      model: "openai/gpt-4o-mini",
      temperature: 0.5,
      maxTokens: 2000,
    });
  }

  async generateThumbnailConcepts(
    topic: string,
    scriptContent: string,
  ): Promise<AICompletionResult> {
    const systemPrompt = `You are a YouTube thumbnail design expert. Based on the video topic and script, suggest:
1. 3-5 thumbnail concept descriptions (visual layout, colors, elements)
2. Text overlay suggestions for each concept
3. Recommended image styles (close-up, wide shot, text-heavy, etc.)

Return as a JSON array of objects with keys: conceptDescription, textOverlaySuggestion.`;

    const prompt = `Topic: ${topic}\n\nScript excerpt:\n${scriptContent.substring(0, 2000)}`;

    return this.generateCompletion(prompt, systemPrompt, {
      model: "openai/gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 2000,
    });
  }
}

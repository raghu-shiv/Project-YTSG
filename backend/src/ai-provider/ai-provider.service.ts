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

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
      "X-Title": "YT Scripts",
    };
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
        headers: this.getHeaders(),
        timeout: 60000,
      },
    );

    const data = response.data;
    const content = data.choices[0]?.message?.content || "";
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0 };
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;

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
    // Image generation uses the /chat/completions endpoint with output_modalities: ["image"]
    // Docs: https://openrouter.ai/docs/guides/overview/multimodal/image-generation
    const model = options.model || "google/gemini-3.1-flash-lite-image";

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: "user",
              content: `YouTube thumbnail: ${prompt}. Professional, high-contrast, eye-catching design suitable for a YouTube video thumbnail.`,
            },
          ],
          output_modalities: ["image"],
          max_tokens: 8192,
        },
        {
          headers: this.getHeaders(),
          timeout: 120000,
        },
      );

      const data = response.data;
      const message = data.choices?.[0]?.message;

      if (!message) {
        throw new Error("No message in response from image model");
      }

      // The image comes in the separate `images` field on the message
      // Response structure: { role, content, refusal, reasoning, reasoning_details, images }
      // images can be an array: [{"type":"image_url","image_url":{"url":"data:image/jpeg;base64,..."}}]
      // or an array-like object: {"0":{"type":"image_url","image_url":{"url":"..."}}}
      if (message.images) {
        // Normalize to array: handle both true arrays and array-like objects
        let imagesArray: any[] = [];
        if (Array.isArray(message.images)) {
          imagesArray = message.images;
        } else if (typeof message.images === "object") {
          // Try to extract values from array-like object
          imagesArray = Object.values(message.images);
        }

        if (imagesArray.length > 0) {
          const imageItem = imagesArray[0];

          // Image can be a data URL string directly
          if (typeof imageItem === "string") {
            return { url: imageItem, model, costUsd: data.usage?.cost || 0.0001 };
          }

          // Standard format: { type: "image_url", image_url: { url: "data:..." } }
          if (imageItem.image_url) {
            const imgUrl = typeof imageItem.image_url === "string" ? imageItem.image_url : imageItem.image_url.url;
            if (imgUrl) {
              return { url: imgUrl, model, costUsd: data.usage?.cost || 0.0001 };
            }
          }

          // Direct url field
          if (imageItem.url) {
            return { url: imageItem.url, model, costUsd: data.usage?.cost || 0.0001 };
          }

          // Base64 fields
          if (imageItem.b64_json || imageItem.base64) {
            const b64 = imageItem.b64_json || imageItem.base64;
            return { url: `data:image/png;base64,${b64}`, model, costUsd: data.usage?.cost || 0.0001 };
          }

          // Other common field names
          if (imageItem.data) {
            return { url: `data:image/png;base64,${imageItem.data}`, model, costUsd: data.usage?.cost || 0.0001 };
          }
          if (imageItem.image) {
            return { url: imageItem.image, model, costUsd: data.usage?.cost || 0.0001 };
          }
        }
      }

      // Fallback: check message.content as array of content parts
      if (message.content && Array.isArray(message.content)) {
        const imagePart = message.content.find(
          (part: any) => part.type === "image_url" && part.image_url?.url,
        );
        if (imagePart) {
          return { url: imagePart.image_url.url, model, costUsd: data.usage?.cost || 0.0001 };
        }
      }

      // Fallback: check for base64-encoded image attached to the message
      if (message.base64_image || message.b64_json) {
        const b64 = message.base64_image || message.b64_json;
        return { url: `data:image/png;base64,${b64}`, model, costUsd: data.usage?.cost || 0.0001 };
      }

      // Log the available keys to help debug
      this.logger.warn(
        `Could not extract image from response. Available keys: ${Object.keys(message).join(", ")}`,
      );

      throw new Error("No image data found in model response");
    } catch (error: any) {
      this.logger.warn(`Image model ${model} failed: ${error.message}`);
      throw error;
    }
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
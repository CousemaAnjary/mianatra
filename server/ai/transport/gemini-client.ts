import { GoogleGenAI, createPartFromBase64, createPartFromText, createUserContent, type Content, type GenerateContentConfig } from "@google/genai";
import type { AIConfig } from "../config/ai.config";
import type { AIGenerationOptions, AITokenUsage } from "../ai.types";

export type GeminiGenerateParams = {
  model: string;
  prompt: string;
  context?: string | null;
  imageBase64?: string;
  mimeType?: string;
  options?: AIGenerationOptions | null;
  request: {
    signal?: AbortSignal;
    timeoutMs: number;
  };
};

export type GeminiGenerateResponse = {
  text: string | undefined;
  finishReason: string | null;
  tokenUsage: AITokenUsage | null;
};

export type GeminiModel = {
  name?: string;
};

export interface GeminiTransport {
  generateContent(params: GeminiGenerateParams): Promise<GeminiGenerateResponse>;
  listModels(params: { signal?: AbortSignal; timeoutMs: number }): Promise<GeminiModel[]>;
}

function toThinkingBudget(level?: AIGenerationOptions["thinkingLevel"] | null) {
  if (!level) {
    return undefined;
  }
  return { low: 256, medium: 1024, high: 4096 }[level];
}

function buildPrompt(prompt: string, context?: string | null) {
  return context ? `${context.trim()}\n\n${prompt}` : prompt;
}

function toGenerateConfig(options: AIGenerationOptions | null | undefined, timeoutMs: number, signal?: AbortSignal): GenerateContentConfig {
  const thinkingBudget = toThinkingBudget(options?.thinkingLevel);
  return {
    abortSignal: signal,
    httpOptions: { timeout: timeoutMs },
    maxOutputTokens: options?.maxOutputTokens,
    responseMimeType: "text/plain",
    systemInstruction: options?.systemInstruction ?? undefined,
    temperature: options?.temperature ?? 0.2,
    ...(thinkingBudget === undefined ? {} : { thinkingConfig: { thinkingBudget } }),
  };
}

export class GoogleGenAITransport implements GeminiTransport {
  private readonly client: GoogleGenAI;

  constructor(config: AIConfig) {
    this.client = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }

  async generateContent(params: GeminiGenerateParams): Promise<GeminiGenerateResponse> {
    const contents = params.imageBase64
      ? createUserContent([
          createPartFromText(buildPrompt(params.prompt, params.context)),
          createPartFromBase64(params.imageBase64, params.mimeType ?? "image/jpeg"),
        ])
      : buildPrompt(params.prompt, params.context);
    const response = await this.client.models.generateContent({
      model: params.model,
      contents,
      config: toGenerateConfig(params.options, params.request.timeoutMs, params.request.signal),
    });

    return {
      text: response.text,
      finishReason: response.candidates?.[0]?.finishReason ?? null,
      tokenUsage: response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount ?? null,
            outputTokens: response.usageMetadata.candidatesTokenCount ?? null,
            totalTokens: response.usageMetadata.totalTokenCount ?? null,
          }
        : null,
    };
  }

  async listModels(params: { signal?: AbortSignal; timeoutMs: number }): Promise<GeminiModel[]> {
    const pager = await this.client.models.list({
      config: {
        abortSignal: params.signal,
        httpOptions: { timeout: params.timeoutMs },
        queryBase: true,
      },
    });
    const models: GeminiModel[] = [];
    for await (const model of pager) {
      models.push({ name: model.name });
    }
    return models;
  }
}

export type { Content };

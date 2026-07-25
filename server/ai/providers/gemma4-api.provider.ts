import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  AIAuthenticationError,
  AIError,
  AIInvalidResponseError,
  AIModelNotFoundError,
  AINetworkError,
  AIProviderUnavailableError,
  AIRateLimitError,
  AIRequestAbortedError,
  AITimeoutError,
  getAIErrorCode,
} from "../ai.errors";
import type { AIProvider } from "../ai-provider.interface";
import type { AIConfig } from "../config/ai.config";
import { DEFAULT_GEMMA_MAX_OUTPUT_TOKENS, type AIImageInput, type AILogger, type AIProviderStatus, type AIRequestOptions, type AITextInput, type AITextResponse } from "../ai.types";
import { GoogleGenAITransport, type GeminiTransport } from "../transport/gemini-client";

const textInputSchema = z.object({
  prompt: z.string().trim().min(1),
  context: z.string().trim().nullable().optional(),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxOutputTokens: z.number().int().positive().optional(),
      systemInstruction: z.string().trim().nullable().optional(),
      thinkingLevel: z.enum(["low", "medium", "high"]).nullable().optional(),
    })
    .nullable()
    .optional(),
});

const imageInputSchema = textInputSchema.extend({
  imageBase64: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !value.startsWith("data:"), "imageBase64 must not contain a data URL prefix."),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

const noopLogger: AILogger = {
  info: () => undefined,
  error: () => undefined,
};

export type Gemma4ApiProviderOptions = {
  config: AIConfig;
  transport?: GeminiTransport;
  logger?: AILogger;
};

function normalizeModelName(name: string) {
  return name.startsWith("models/") ? name.slice("models/".length) : name;
}

function isAbortError(error: unknown) {
  return error instanceof Error && (error.name === "AbortError" || /abort/i.test(error.message));
}

function readHttpStatus(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }
  const status = "status" in error ? error.status : "code" in error ? error.code : null;
  return typeof status === "number" ? status : null;
}

function mapProviderError(error: unknown, requestId: string | null) {
  if (error instanceof AIError) {
    return error;
  }
  if (error instanceof AITimeoutError || error instanceof AIRequestAbortedError) {
    return error;
  }
  if (isAbortError(error)) {
    return new AIRequestAbortedError("AI request was aborted by the caller.", { requestId, cause: error });
  }
  const httpStatus = readHttpStatus(error);
  if (httpStatus === 401 || httpStatus === 403) {
    return new AIAuthenticationError("AI provider rejected authentication.", { requestId, cause: error, httpStatus });
  }
  if (httpStatus === 404) {
    return new AIModelNotFoundError("Configured AI model is not available.", { requestId, cause: error, httpStatus });
  }
  if (httpStatus === 429) {
    return new AIRateLimitError("AI provider rate limit exceeded.", { requestId, cause: error, httpStatus });
  }
  if (httpStatus !== null && httpStatus >= 500) {
    return new AIProviderUnavailableError("AI provider returned a server error.", { requestId, cause: error, httpStatus });
  }
  if (error instanceof TypeError || (error instanceof Error && /network|fetch|econn|enotfound|timed out/i.test(error.message))) {
    return new AINetworkError("AI provider network request failed.", { requestId, cause: error, httpStatus });
  }
  return new AIProviderUnavailableError("AI provider request failed.", { requestId, cause: error, httpStatus });
}

function makeTimeoutController(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new AITimeoutError()), timeoutMs);
  return { controller, clear: () => clearTimeout(timeout) };
}

function linkSignals(externalSignal: AbortSignal | undefined, internalController: AbortController) {
  if (!externalSignal) {
    return () => undefined;
  }
  if (externalSignal.aborted) {
    internalController.abort();
    return () => undefined;
  }
  const abort = () => internalController.abort();
  externalSignal.addEventListener("abort", abort, { once: true });
  return () => externalSignal.removeEventListener("abort", abort);
}

export class Gemma4ApiProvider implements AIProvider {
  readonly name = "gemma4-api";
  private readonly config: AIConfig;
  private readonly transport: GeminiTransport;
  private readonly logger: AILogger;

  constructor(options: Gemma4ApiProviderOptions) {
    this.config = options.config;
    this.transport = options.transport ?? new GoogleGenAITransport(options.config);
    this.logger = options.logger ?? noopLogger;
  }

  async getStatus(options: AIRequestOptions = {}): Promise<AIProviderStatus> {
    const startedAt = Date.now();
    const requestId = options.requestId ?? randomUUID();
    try {
      const models = await this.callWithTimeout(
        "status",
        requestId,
        options,
        (signal, timeoutMs) => this.transport.listModels({ signal, timeoutMs }),
      );
      const availableModels = models.map((model) => normalizeModelName(model.name ?? ""));
      const modelAvailable = availableModels.includes(this.config.GEMMA_MODEL);
      return {
        provider: this.name,
        configured: true,
        available: modelAvailable,
        model: this.config.GEMMA_MODEL,
        modelAvailable,
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
        errorCode: modelAvailable ? null : "AI_MODEL_NOT_FOUND",
      };
    } catch (error) {
      const mapped = mapProviderError(error, requestId);
      return {
        provider: this.name,
        configured: true,
        available: false,
        model: this.config.GEMMA_MODEL,
        modelAvailable: false,
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
        errorCode: getAIErrorCode(mapped),
      };
    }
  }

  async generateText(input: AITextInput, options: AIRequestOptions = {}): Promise<AITextResponse> {
    const parsed = textInputSchema.parse(input);
    return this.generate("generateText", parsed, options);
  }

  async generateFromImage(input: AIImageInput, options: AIRequestOptions = {}): Promise<AITextResponse> {
    const parsed = imageInputSchema.parse(input);
    return this.generate("generateFromImage", parsed, options);
  }

  private async generate(operation: string, input: AITextInput | AIImageInput, options: AIRequestOptions) {
    const startedAt = Date.now();
    const requestId = options.requestId ?? randomUUID();
    try {
      const response = await this.callWithTimeout(operation, requestId, options, (signal, timeoutMs) =>
        this.transport.generateContent({
          model: this.config.GEMMA_MODEL,
          prompt: input.prompt,
          context: input.context,
          imageBase64: "imageBase64" in input ? input.imageBase64 : undefined,
          mimeType: "mimeType" in input ? input.mimeType : undefined,
          options: {
            temperature: input.options?.temperature ?? 0.2,
            maxOutputTokens: input.options?.maxOutputTokens ?? this.config.GEMMA_MAX_OUTPUT_TOKENS ?? DEFAULT_GEMMA_MAX_OUTPUT_TOKENS,
            systemInstruction: input.options?.systemInstruction ?? null,
            thinkingLevel: input.options?.thinkingLevel ?? "low",
          },
          request: { signal, timeoutMs },
        }),
      );
      const text = response.text?.trim();
      if (!text) {
        throw new AIInvalidResponseError("AI provider returned an empty text response.", { requestId });
      }
      const durationMs = Date.now() - startedAt;
      this.logger.info({ requestId, operation, provider: this.name, model: this.config.GEMMA_MODEL, durationMs, success: true, errorCode: null });
      return {
        text,
        provider: this.name,
        model: this.config.GEMMA_MODEL,
        requestId,
        durationMs,
        finishReason: response.finishReason,
        tokenUsage: response.tokenUsage,
      };
    } catch (error) {
      const mapped = mapProviderError(error, requestId);
      this.logger.error({
        requestId,
        operation,
        provider: this.name,
        model: this.config.GEMMA_MODEL,
        durationMs: Date.now() - startedAt,
        success: false,
        errorCode: mapped.code,
      });
      throw mapped;
    }
  }

  private async callWithTimeout<T>(
    operation: string,
    requestId: string,
    options: AIRequestOptions,
    run: (signal: AbortSignal, timeoutMs: number) => Promise<T>,
  ) {
    if (options.signal?.aborted) {
      throw new AIRequestAbortedError("AI request signal was already aborted.", { requestId });
    }
    const timeoutMs = options.timeoutMs ?? this.config.GEMMA_TIMEOUT_MS;
    const timeoutController = makeTimeoutController(timeoutMs);
    const unlink = linkSignals(options.signal, timeoutController.controller);
    try {
      return await run(timeoutController.controller.signal, timeoutMs);
    } catch (error) {
      if (timeoutController.controller.signal.aborted && !options.signal?.aborted) {
        throw new AITimeoutError(`AI ${operation} request exceeded ${timeoutMs}ms.`, { requestId, cause: error });
      }
      throw error;
    } finally {
      unlink();
      timeoutController.clear();
    }
  }
}

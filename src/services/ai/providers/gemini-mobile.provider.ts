import { z } from "zod";
import {
  AIAuthenticationError,
  AIError,
  AIInvalidResponseError,
  AIModelNotFoundError,
  AINetworkError,
  AIProviderUnavailableError,
  AIRequestAbortedError,
  AITimeoutError,
  getAIErrorCode,
} from "../ai.errors";
import type { AIProvider } from "../ai-provider.interface";
import {
  ALLOWED_GEMMA_MODELS,
  DEFAULT_GEMINI_MAX_OUTPUT_TOKENS,
  DEFAULT_GEMINI_TIMEOUT_MS,
  type AIImageInput,
  type AILogger,
  type AIProviderStatus,
  type AIRequestOptions,
  type AITextInput,
  type AITextResponse,
  type GemmaModel,
} from "../ai.types";
import { GeminiRestTransport, type GeminiFetch, type GeminiMobileTransport } from "../transport/gemini-rest.transport";

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

export type GeminiMobileProviderOptions = {
  apiKey: string;
  model: GemmaModel;
  transport?: GeminiMobileTransport;
  fetchFn?: GeminiFetch;
  logger?: AILogger;
  timeoutMs?: number;
};

function makeRequestId() {
  return globalThis.crypto?.randomUUID?.() ?? `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isAbortError(error: unknown) {
  return error instanceof Error && (error.name === "AbortError" || /abort/i.test(error.message));
}

function mapProviderError(error: unknown, requestId: string | null) {
  if (error instanceof AIError) {
    return error;
  }
  if (isAbortError(error)) {
    return new AIRequestAbortedError("AI request was aborted by the caller.", { requestId, cause: error });
  }
  if (error instanceof TypeError || (error instanceof Error && /network|fetch|econn|enotfound/i.test(error.message))) {
    return new AINetworkError("AI provider network request failed.", { requestId, cause: error });
  }
  return new AIProviderUnavailableError("AI provider request failed.", { requestId, cause: error });
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

export class GeminiMobileProvider implements AIProvider {
  readonly name = "gemini-mobile";
  private readonly apiKey: string;
  private readonly model: GemmaModel;
  private readonly transport: GeminiMobileTransport;
  private readonly logger: AILogger;
  private readonly timeoutMs: number;

  constructor(options: GeminiMobileProviderOptions) {
    this.apiKey = options.apiKey.trim();
    this.model = options.model;
    this.transport = options.transport ?? new GeminiRestTransport({ fetchFn: options.fetchFn });
    this.logger = options.logger ?? noopLogger;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_GEMINI_TIMEOUT_MS;
    if (!this.apiKey) {
      throw new AIAuthenticationError("Gemini API key is missing.");
    }
    if (!ALLOWED_GEMMA_MODELS.includes(this.model)) {
      throw new AIModelNotFoundError("Configured Gemma model is not supported.");
    }
  }

  async getStatus(options: AIRequestOptions = {}): Promise<AIProviderStatus> {
    const startedAt = Date.now();
    try {
      await this.generateText({ prompt: "Réponds uniquement: ok", options: { maxOutputTokens: 8 } }, options);
      return {
        provider: this.name,
        configured: true,
        available: true,
        model: this.model,
        modelAvailable: true,
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
        errorCode: null,
      };
    } catch (error) {
      const mapped = mapProviderError(error, options.requestId ?? null);
      return {
        provider: this.name,
        configured: true,
        available: false,
        model: this.model,
        modelAvailable: !(mapped instanceof AIModelNotFoundError),
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
    const requestId = options.requestId ?? makeRequestId();
    try {
      const response = await this.callWithTimeout(operation, requestId, options, (signal, timeoutMs) =>
        this.transport.generateContent({
          apiKey: this.apiKey,
          model: this.model,
          prompt: input.prompt,
          context: input.context,
          imageBase64: "imageBase64" in input ? input.imageBase64 : undefined,
          mimeType: "mimeType" in input ? input.mimeType : undefined,
          options: {
            temperature: input.options?.temperature ?? 0.2,
            maxOutputTokens: input.options?.maxOutputTokens ?? DEFAULT_GEMINI_MAX_OUTPUT_TOKENS,
            systemInstruction: input.options?.systemInstruction ?? null,
            thinkingLevel: input.options?.thinkingLevel ?? "low",
          },
          request: { signal, timeoutMs },
        }),
      );
      const text = response.text.trim();
      if (!text) {
        throw new AIInvalidResponseError("AI provider returned an empty text response.", { requestId });
      }
      const durationMs = Date.now() - startedAt;
      this.logger.info({ requestId, operation, provider: this.name, model: this.model, durationMs, success: true, errorCode: null });
      return {
        text,
        provider: this.name,
        model: this.model,
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
        model: this.model,
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
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
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

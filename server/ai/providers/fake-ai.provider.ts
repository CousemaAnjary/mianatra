import { AIInvalidResponseError, AIRequestAbortedError } from "../ai.errors";
import type { AIProvider } from "../ai-provider.interface";
import type { AIImageInput, AIProviderStatus, AIRequestOptions, AITextInput, AITextResponse } from "../ai.types";

export type FakeAICall = {
  operation: "getStatus" | "generateText" | "generateFromImage";
  requestId: string | null;
};

export type FakeAIProviderOptions = {
  textResponse?: string;
  imageResponse?: string;
  status?: AIProviderStatus;
  error?: Error;
  delayMs?: number;
};

function defaultResponse(text: string, requestId: string | null): AITextResponse {
  return {
    text,
    provider: "fake-ai",
    model: "fake-model",
    requestId: requestId ?? "fake-request",
    durationMs: 0,
    finishReason: "STOP",
    tokenUsage: null,
  };
}

function defaultStatus(): AIProviderStatus {
  return {
    provider: "fake-ai",
    configured: true,
    available: true,
    model: "fake-model",
    modelAvailable: true,
    checkedAt: new Date().toISOString(),
    latencyMs: 0,
    errorCode: null,
  };
}

export class FakeAIProvider implements AIProvider {
  readonly name = "fake-ai";
  readonly calls: FakeAICall[] = [];
  private readonly options: FakeAIProviderOptions;

  constructor(options: FakeAIProviderOptions = {}) {
    this.options = options;
  }

  async getStatus(options: AIRequestOptions = {}) {
    this.record("getStatus", options);
    await this.wait(options);
    if (this.options.error) {
      throw this.options.error;
    }
    return this.options.status ?? defaultStatus();
  }

  async generateText(input: AITextInput, options: AIRequestOptions = {}) {
    this.record("generateText", options);
    await this.wait(options);
    if (this.options.error) {
      throw this.options.error;
    }
    if (!input.prompt.trim()) {
      throw new AIInvalidResponseError("Fake input prompt is empty.");
    }
    return defaultResponse(this.options.textResponse ?? "fake text response", options.requestId ?? null);
  }

  async generateFromImage(input: AIImageInput, options: AIRequestOptions = {}) {
    this.record("generateFromImage", options);
    await this.wait(options);
    if (this.options.error) {
      throw this.options.error;
    }
    if (!input.imageBase64.trim()) {
      throw new AIInvalidResponseError("Fake image input is empty.");
    }
    return defaultResponse(this.options.imageResponse ?? this.options.textResponse ?? "fake image response", options.requestId ?? null);
  }

  private record(operation: FakeAICall["operation"], options: AIRequestOptions) {
    this.calls.push({ operation, requestId: options.requestId ?? null });
  }

  private async wait(options: AIRequestOptions) {
    if (options.signal?.aborted) {
      throw new AIRequestAbortedError("Fake AI request signal was already aborted.", { requestId: options.requestId ?? null });
    }
    if (!this.options.delayMs) {
      return;
    }
    await new Promise<void>((resolve) => setTimeout(resolve, this.options.delayMs));
  }
}

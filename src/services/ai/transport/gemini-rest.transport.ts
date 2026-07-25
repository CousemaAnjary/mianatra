import {
  AIAuthenticationError,
  AIInvalidResponseError,
  AIModelNotFoundError,
  AINetworkError,
  AIProviderUnavailableError,
  AIRequestInvalidError,
  AIRateLimitError,
} from "../ai.errors";
import type { AIGenerationOptions, AIResponseDiagnostics, AITokenUsage } from "../ai.types";

export type GeminiFetch = typeof fetch;

export type GeminiGenerateParams = {
  apiKey: string;
  model: string;
  prompt: string;
  context?: string | null;
  imageBase64?: string;
  mimeType?: "image/jpeg" | "image/png" | "image/webp";
  options?: AIGenerationOptions | null;
  request: {
    signal: AbortSignal;
    timeoutMs: number;
  };
};

export type GeminiGenerateResponse = {
  text: string;
  finishReason: string | null;
  tokenUsage: AITokenUsage | null;
  diagnostics?: AIResponseDiagnostics | null;
};

export interface GeminiMobileTransport {
  generateContent(params: GeminiGenerateParams): Promise<GeminiGenerateResponse>;
}

export type GeminiRestTransportOptions = {
  fetchFn?: GeminiFetch;
  endpoint?: string;
};

type GeminiRestPart =
  | { text: string }
  | { inline_data: { mime_type: "image/jpeg" | "image/png" | "image/webp"; data: string } };

function buildPrompt(params: GeminiGenerateParams) {
  return [params.context?.trim(), params.prompt.trim()].filter(Boolean).join("\n\n");
}

function readCandidates(response: unknown): unknown[] {
  if (typeof response !== "object" || response === null) {
    return [];
  }
  const candidates = "candidates" in response ? response.candidates : null;
  if (!Array.isArray(candidates)) {
    return [];
  }
  return candidates;
}

function readParts(candidate: unknown): unknown[] {
  if (typeof candidate !== "object" || candidate === null || !("content" in candidate)) {
    return [];
  }
  const content = candidate.content;
  if (typeof content !== "object" || content === null || !("parts" in content) || !Array.isArray(content.parts)) {
    return [];
  }
  return content.parts;
}

function isThoughtPart(part: unknown) {
  return typeof part === "object" && part !== null && "thought" in part && part.thought === true;
}

function partText(part: unknown) {
  return typeof part === "object" && part !== null && "text" in part && typeof part.text === "string" ? part.text : "";
}

function extractText(response: unknown) {
  return readCandidates(response)
    .flatMap((candidate) => readParts(candidate))
    .filter((part) => !isThoughtPart(part))
    .map(partText)
    .join("")
    .trim();
}

function extractFinishReason(response: unknown) {
  const candidate = readCandidates(response)[0];
  return typeof candidate === "object" && candidate !== null && "finishReason" in candidate && typeof candidate.finishReason === "string"
    ? candidate.finishReason
    : null;
}

function textEdge(value: string, edge: "first" | "last") {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return edge === "first" ? trimmed[0] : trimmed[trimmed.length - 1];
}

function extractDiagnostics(response: unknown, text: string): AIResponseDiagnostics {
  const candidates = readCandidates(response);
  const parts = candidates.flatMap((candidate) => readParts(candidate));
  const tokenUsage = extractTokenUsage(response);
  const finishReason = extractFinishReason(response);
  const trimmed = text.trimStart();
  return {
    candidateCount: candidates.length,
    partCount: parts.length,
    thoughtPartCount: parts.filter(isThoughtPart).length,
    responseTextLength: text.length,
    startsWithCodeFence: trimmed.startsWith("```"),
    firstNonWhitespaceCharacter: textEdge(text, "first"),
    lastNonWhitespaceCharacter: textEdge(text, "last"),
    finishReason,
    outputTokenCount: tokenUsage?.outputTokens ?? null,
  };
}

function diagnosticsDetails(diagnostics: AIResponseDiagnostics) {
  return {
    candidateCount: diagnostics.candidateCount,
    partCount: diagnostics.partCount,
    thoughtPartCount: diagnostics.thoughtPartCount,
    responseTextLength: diagnostics.responseTextLength,
    startsWithCodeFence: diagnostics.startsWithCodeFence,
    firstNonWhitespaceCharacter: diagnostics.firstNonWhitespaceCharacter,
    lastNonWhitespaceCharacter: diagnostics.lastNonWhitespaceCharacter,
    finishReason: diagnostics.finishReason,
    outputTokenCount: diagnostics.outputTokenCount,
  };
}

function generationConfig(options: AIGenerationOptions | null | undefined) {
  const base = {
    temperature: options?.temperature ?? 0.2,
    maxOutputTokens: options?.maxOutputTokens,
    thinkingConfig: {
      thinkingLevel: "minimal",
    },
  };
  if (!options?.responseJsonSchema) {
    return base;
  }
  return {
    ...base,
    responseMimeType: "application/json",
    responseJsonSchema: options.responseJsonSchema,
  };
}

function shortProviderMessage(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 180);
}

function readProviderError(body: unknown) {
  const error = typeof body === "object" && body !== null && "error" in body && typeof body.error === "object" && body.error !== null
    ? body.error
    : null;
  const message = error && "message" in error && typeof error.message === "string" ? shortProviderMessage(error.message) : null;
  const providerStatus = error && "status" in error && typeof error.status === "string" ? error.status : null;
  let providerReason: string | null = null;
  let providerField: string | null = null;
  if (error && "details" in error && Array.isArray(error.details)) {
    for (const detail of error.details) {
      if (typeof detail !== "object" || detail === null) {
        continue;
      }
      if ("reason" in detail && typeof detail.reason === "string") {
        providerReason = detail.reason;
      }
      if ("fieldViolations" in detail && Array.isArray(detail.fieldViolations)) {
        const fieldViolation = detail.fieldViolations.find((item: unknown) => typeof item === "object" && item !== null && "field" in item);
        if (typeof fieldViolation === "object" && fieldViolation !== null && "field" in fieldViolation && typeof fieldViolation.field === "string") {
          providerField = fieldViolation.field;
        }
      }
    }
  }
  return {
    providerStatus,
    providerMessage: message,
    providerReason,
    providerField,
  };
}

function extractTokenUsage(response: unknown): AITokenUsage | null {
  if (typeof response !== "object" || response === null || !("usageMetadata" in response)) {
    return null;
  }
  const usage = response.usageMetadata;
  if (typeof usage !== "object" || usage === null) {
    return null;
  }
  return {
    promptTokens: "promptTokenCount" in usage && typeof usage.promptTokenCount === "number" ? usage.promptTokenCount : null,
    outputTokens: "candidatesTokenCount" in usage && typeof usage.candidatesTokenCount === "number" ? usage.candidatesTokenCount : null,
    totalTokens: "totalTokenCount" in usage && typeof usage.totalTokenCount === "number" ? usage.totalTokenCount : null,
  };
}

function mapHttpError(status: number, body: unknown, generationConfigKeys: string[]) {
  const provider = readProviderError(body);
  const providerMessage = status === 400 ? "Gemini request was invalid." : provider.providerMessage;
  const details = {
    httpStatus: status,
    providerStatus: provider.providerStatus,
    providerMessage,
    providerReason: provider.providerReason,
    providerField: provider.providerField,
    generationConfigKeys: generationConfigKeys.join(","),
  };
  const message = providerMessage ?? `Gemini HTTP error ${status}.`;
  if (status === 400) {
    return new AIRequestInvalidError("Gemini rejected the request configuration.", { httpStatus: status, details });
  }
  if (status === 401 || status === 403) {
    return new AIAuthenticationError("Gemini API key was rejected.", { httpStatus: status, details });
  }
  if (status === 404) {
    return new AIModelNotFoundError("Gemini model was not found.", { httpStatus: status, details });
  }
  if (status === 429) {
    return new AIRateLimitError("Gemini quota exceeded.", { httpStatus: status, details });
  }
  if (status >= 500) {
    return new AIProviderUnavailableError("Gemini service is unavailable.", { httpStatus: status, details });
  }
  return new AIProviderUnavailableError(message, { httpStatus: status, details });
}

export class GeminiRestTransport implements GeminiMobileTransport {
  private readonly fetchFn: GeminiFetch;
  private readonly endpoint: string;

  constructor(options: GeminiRestTransportOptions = {}) {
    this.fetchFn = options.fetchFn ?? fetch;
    this.endpoint = options.endpoint ?? "https://generativelanguage.googleapis.com/v1beta";
  }

  async generateContent(params: GeminiGenerateParams): Promise<GeminiGenerateResponse> {
    const text = buildPrompt(params);
    const parts: GeminiRestPart[] = [{ text }];
    if (params.imageBase64 && params.mimeType) {
      parts.push({ inline_data: { mime_type: params.mimeType, data: params.imageBase64 } });
    }
    const url = `${this.endpoint}/models/${encodeURIComponent(params.model)}:generateContent`;
    let response: Response;
    const requestGenerationConfig = generationConfig(params.options);
    try {
      response = await this.fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": params.apiKey,
        },
        signal: params.request.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: requestGenerationConfig,
          systemInstruction: params.options?.systemInstruction ? { parts: [{ text: params.options.systemInstruction }] } : undefined,
        }),
      });
    } catch (error) {
      throw error instanceof Error && error.name === "AbortError"
        ? error
        : new AINetworkError("Gemini network request failed.", { cause: error });
    }
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw mapHttpError(response.status, body, Object.keys(requestGenerationConfig));
    }
    const outputText = extractText(body);
    const diagnostics = extractDiagnostics(body, outputText);
    if (!outputText) {
      throw new AIInvalidResponseError("Gemini returned an empty response.", { details: diagnosticsDetails(diagnostics) });
    }
    return {
      text: outputText,
      finishReason: diagnostics.finishReason,
      tokenUsage: extractTokenUsage(body),
      diagnostics,
    };
  }
}

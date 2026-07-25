import {
  AIAuthenticationError,
  AIInvalidResponseError,
  AIModelNotFoundError,
  AINetworkError,
  AIProviderUnavailableError,
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

function mapHttpError(status: number, body: unknown) {
  const message =
    typeof body === "object" && body !== null && "error" in body && typeof body.error === "object" && body.error !== null && "message" in body.error
      ? String(body.error.message)
      : `Gemini HTTP error ${status}.`;
  if (status === 401 || status === 403) {
    return new AIAuthenticationError("Gemini API key was rejected.", { httpStatus: status, details: { message } });
  }
  if (status === 404) {
    return new AIModelNotFoundError("Gemini model was not found.", { httpStatus: status, details: { message } });
  }
  if (status === 429) {
    return new AIRateLimitError("Gemini quota exceeded.", { httpStatus: status, details: { message } });
  }
  if (status >= 500) {
    return new AIProviderUnavailableError("Gemini service is unavailable.", { httpStatus: status, details: { message } });
  }
  return new AIProviderUnavailableError("Gemini request failed.", { httpStatus: status, details: { message } });
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
          generationConfig: {
            temperature: params.options?.temperature ?? 0.2,
            maxOutputTokens: params.options?.maxOutputTokens,
            responseMimeType: "application/json",
            thinkingConfig: {
              thinkingLevel: "minimal",
            },
          },
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
      throw mapHttpError(response.status, body);
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

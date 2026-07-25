export const ALLOWED_GEMMA_MODELS = ["gemma-4-26b-a4b-it", "gemma-4-31b-it"] as const;
export const DEFAULT_GEMMA_MODEL = "gemma-4-26b-a4b-it";
export const DEFAULT_GEMINI_TIMEOUT_MS = 30000;
export const DEFAULT_GEMINI_MAX_OUTPUT_TOKENS = 1024;

export type GemmaModel = (typeof ALLOWED_GEMMA_MODELS)[number];
export type AIThinkingLevel = "minimal" | "low" | "medium" | "high";

export type AIRequestOptions = {
  signal?: AbortSignal;
  requestId?: string;
  timeoutMs?: number;
};

export type AIProviderStatus = {
  provider: string;
  configured: boolean;
  available: boolean;
  model: string;
  modelAvailable: boolean;
  checkedAt: string;
  latencyMs: number | null;
  errorCode: string | null;
};

export type AIGenerationOptions = {
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string | null;
  thinkingLevel?: AIThinkingLevel | null;
  responseJsonSchema?: Record<string, unknown> | null;
};

export type AITextInput = {
  prompt: string;
  context?: string | null;
  options?: AIGenerationOptions | null;
};

export type AIImageInput = {
  prompt: string;
  imageBase64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  context?: string | null;
  options?: AIGenerationOptions | null;
};

export type AITokenUsage = {
  promptTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
};

export type AIResponseDiagnostics = {
  candidateCount: number;
  partCount: number;
  thoughtPartCount: number;
  responseTextLength: number;
  startsWithCodeFence: boolean;
  firstNonWhitespaceCharacter: string | null;
  lastNonWhitespaceCharacter: string | null;
  finishReason: string | null;
  outputTokenCount: number | null;
};

export type AITextResponse = {
  text: string;
  provider: string;
  model: string;
  requestId: string;
  durationMs: number;
  finishReason: string | null;
  tokenUsage: AITokenUsage | null;
  diagnostics?: AIResponseDiagnostics | null;
};

export type AILogEvent = {
  requestId: string | null;
  operation: string;
  provider: string;
  model: string | null;
  durationMs: number | null;
  success: boolean;
  errorCode: string | null;
  diagnostics?: AIResponseDiagnostics | null;
};

export type AILogger = {
  info(event: AILogEvent): void;
  error(event: AILogEvent): void;
};

export type AIErrorOptions = {
  requestId?: string | null;
  cause?: unknown;
  details?: Record<string, string | number | boolean | null>;
  httpStatus?: number | null;
};

export class AIError extends Error {
  public readonly requestId: string | null;
  public readonly details: Record<string, string | number | boolean | null>;
  public readonly httpStatus: number | null;

  constructor(
    public readonly code: string,
    message: string,
    options: AIErrorOptions = {},
  ) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.requestId = options.requestId ?? null;
    this.details = options.details ?? {};
    this.httpStatus = options.httpStatus ?? null;
  }
}

export class AIConfigurationError extends AIError {
  constructor(message = "AI configuration is invalid.", options?: AIErrorOptions) {
    super("AI_CONFIGURATION_ERROR", message, options);
  }
}

export class AIAuthenticationError extends AIError {
  constructor(message = "AI authentication failed.", options?: AIErrorOptions) {
    super("AI_AUTHENTICATION_ERROR", message, options);
  }
}

export class AIProviderUnavailableError extends AIError {
  constructor(message = "AI provider is unavailable.", options?: AIErrorOptions) {
    super("AI_PROVIDER_UNAVAILABLE", message, options);
  }
}

export class AIModelNotFoundError extends AIError {
  constructor(message = "AI model was not found.", options?: AIErrorOptions) {
    super("AI_MODEL_NOT_FOUND", message, options);
  }
}

export class AIRequestAbortedError extends AIError {
  constructor(message = "AI request was aborted.", options?: AIErrorOptions) {
    super("AI_REQUEST_ABORTED", message, options);
  }
}

export class AITimeoutError extends AIError {
  constructor(message = "AI request timed out.", options?: AIErrorOptions) {
    super("AI_TIMEOUT", message, options);
  }
}

export class AINetworkError extends AIError {
  constructor(message = "AI network error.", options?: AIErrorOptions) {
    super("AI_NETWORK_ERROR", message, options);
  }
}

export class AIRateLimitError extends AIError {
  constructor(message = "AI rate limit exceeded.", options?: AIErrorOptions) {
    super("AI_RATE_LIMIT", message, options);
  }
}

export class AIInvalidResponseError extends AIError {
  constructor(message = "AI provider returned an invalid response.", options?: AIErrorOptions) {
    super("AI_INVALID_RESPONSE", message, options);
  }
}

export class AIJsonParseError extends AIError {
  constructor(message = "AI response JSON could not be parsed.", options?: AIErrorOptions) {
    super("AI_JSON_PARSE_ERROR", message, options);
  }
}

export class AISchemaValidationError extends AIError {
  constructor(message = "AI response JSON does not match the schema.", options?: AIErrorOptions) {
    super("AI_SCHEMA_VALIDATION_ERROR", message, options);
  }
}

export function getAIErrorCode(error: unknown) {
  return error instanceof AIError ? error.code : "AI_UNKNOWN_ERROR";
}

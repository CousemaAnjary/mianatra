import { z } from "zod";
import type { AIProvider } from "./ai-provider.interface";
import { AIError, AIJsonParseError, AIJsonTruncatedError, AISchemaValidationError } from "./ai.errors";
import type { AIImageInput, AIRequestOptions, AITextInput, AITextResponse } from "./ai.types";
import { extractJsonValue } from "./json-response";
import { toSerializableJsonSchema } from "./zod-json-schema";

export type AIStructuredResult<T> = {
  data: T;
  response: AITextResponse;
};

export class AIService {
  constructor(private readonly provider: AIProvider) {}

  getStatus(options?: AIRequestOptions) {
    return this.provider.getStatus(options);
  }

  generateText(input: AITextInput, options?: AIRequestOptions) {
    return this.provider.generateText(input, options);
  }

  async generateStructured<T>(input: AITextInput, schema: z.ZodType<T>, options?: AIRequestOptions): Promise<T> {
    return (await this.generateStructuredWithMetadata(input, schema, options)).data;
  }

  async generateStructuredWithMetadata<T>(input: AITextInput, schema: z.ZodType<T>, options?: AIRequestOptions): Promise<AIStructuredResult<T>> {
    const response = await this.provider.generateText(this.withStructuredInstruction(input, schema), options);
    try {
      return { data: this.parseStructured(response.text, schema, response.requestId, response), response };
    } catch (error) {
      if (error instanceof AIError) {
        Object.assign(error.details, this.responseDiagnostics(response));
      }
      throw error;
    }
  }

  async generateStructuredFromImage<T>(input: AIImageInput, schema: z.ZodType<T>, options?: AIRequestOptions): Promise<T> {
    const response = await this.provider.generateFromImage(this.withStructuredInstruction(input, schema), options);
    return this.parseStructured(response.text, schema, response.requestId);
  }

  private withStructuredInstruction<T extends AITextInput | AIImageInput>(input: T, schema: z.ZodType<unknown>): T {
    return {
      ...input,
      options: {
        ...input.options,
        responseJsonSchema: toSerializableJsonSchema(schema),
      },
      prompt: `${input.prompt.trim()}\n\nReturn only valid JSON. Do not wrap it in Markdown. Do not add unknown properties. Do not invent missing data.`,
    };
  }

  private schemaDiagnostics(error: z.ZodError) {
    const firstIssue = error.issues[0];
    return {
      issueCount: error.issues.length,
      path: firstIssue?.path.join(".") ?? null,
      code: firstIssue?.code ?? null,
      message: firstIssue?.message ?? null,
    };
  }

  private jsonDiagnostics(text: string) {
    const trimmedStart = text.trimStart();
    const trimmed = text.trim();
    return {
      responseTextLength: text.length,
      startsWithCodeFence: trimmedStart.startsWith("```"),
      firstNonWhitespaceCharacter: trimmed.length > 0 ? trimmed[0] : null,
      lastNonWhitespaceCharacter: trimmed.length > 0 ? trimmed[trimmed.length - 1] : null,
      looksTruncated: trimmed.length > 0 && !/[}\]]$/.test(trimmed),
    };
  }

  private responseDiagnostics(response: AITextResponse) {
    return {
      durationMs: response.durationMs,
      candidateCount: response.diagnostics?.candidateCount ?? null,
      partCount: response.diagnostics?.partCount ?? null,
      thoughtPartCount: response.diagnostics?.thoughtPartCount ?? null,
      responseTextLength: response.diagnostics?.responseTextLength ?? response.text.length,
      finishReason: response.finishReason,
      inputTokenCount: response.tokenUsage?.promptTokens ?? null,
      outputTokenCount: response.tokenUsage?.outputTokens ?? response.diagnostics?.outputTokenCount ?? null,
    };
  }

  private parseStructured<T>(text: string, schema: z.ZodType<T>, requestId: string, response?: AITextResponse): T {
    let parsedValue: unknown;
    try {
      parsedValue = extractJsonValue(text);
    } catch (error) {
      if (error instanceof AIJsonParseError) {
        throw new AIJsonParseError(error.message, { requestId, cause: error.cause, details: this.jsonDiagnostics(text) });
      }
      if (error instanceof AIJsonTruncatedError) {
        throw new AIJsonTruncatedError(error.message, { requestId, cause: error.cause, details: this.jsonDiagnostics(text) });
      }
      throw error;
    }
    const parsedSchema = schema.safeParse(parsedValue);
    if (!parsedSchema.success) {
      throw new AISchemaValidationError("AI JSON response failed local schema validation.", {
        requestId,
        details: { ...this.schemaDiagnostics(parsedSchema.error), ...(response ? this.responseDiagnostics(response) : {}) },
        cause: parsedSchema.error,
      });
    }
    return parsedSchema.data;
  }
}

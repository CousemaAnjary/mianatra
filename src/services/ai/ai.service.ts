import { z } from "zod";
import type { AIProvider } from "./ai-provider.interface";
import { AISchemaValidationError } from "./ai.errors";
import type { AIImageInput, AIRequestOptions, AITextInput } from "./ai.types";
import { extractJsonValue } from "./json-response";
import { toSerializableJsonSchema } from "./zod-json-schema";

export class AIService {
  constructor(private readonly provider: AIProvider) {}

  getStatus(options?: AIRequestOptions) {
    return this.provider.getStatus(options);
  }

  generateText(input: AITextInput, options?: AIRequestOptions) {
    return this.provider.generateText(input, options);
  }

  async generateStructured<T>(input: AITextInput, schema: z.ZodType<T>, options?: AIRequestOptions): Promise<T> {
    const response = await this.provider.generateText(this.withStructuredInstruction(input, schema), options);
    return this.parseStructured(response.text, schema, response.requestId);
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

  private parseStructured<T>(text: string, schema: z.ZodType<T>, requestId: string): T {
    const parsedValue = extractJsonValue(text);
    const parsedSchema = schema.safeParse(parsedValue);
    if (!parsedSchema.success) {
      throw new AISchemaValidationError("AI JSON response failed local schema validation.", {
        requestId,
        details: this.schemaDiagnostics(parsedSchema.error),
        cause: parsedSchema.error,
      });
    }
    return parsedSchema.data;
  }
}

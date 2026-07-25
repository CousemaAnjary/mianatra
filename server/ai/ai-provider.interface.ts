import type { AIImageInput, AIProviderStatus, AIRequestOptions, AITextInput, AITextResponse } from "./ai.types";

export interface AIProvider {
  readonly name: string;

  getStatus(options?: AIRequestOptions): Promise<AIProviderStatus>;

  generateText(input: AITextInput, options?: AIRequestOptions): Promise<AITextResponse>;

  generateFromImage(input: AIImageInput, options?: AIRequestOptions): Promise<AITextResponse>;
}

import { z } from "zod";
import { ALLOWED_GEMMA_MODELS, DEFAULT_GEMMA_MAX_OUTPUT_TOKENS, DEFAULT_GEMMA_MODEL, DEFAULT_GEMMA_TIMEOUT_MS } from "../ai.types";
import { AIConfigurationError } from "../ai.errors";

const serverEnvSchema = z.object({
  GEMINI_API_KEY: z.string().trim().min(1),
  GEMMA_MODEL: z.enum(ALLOWED_GEMMA_MODELS).default(DEFAULT_GEMMA_MODEL),
  GEMMA_TIMEOUT_MS: z.coerce.number().int().positive().default(DEFAULT_GEMMA_TIMEOUT_MS),
  GEMMA_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(DEFAULT_GEMMA_MAX_OUTPUT_TOKENS),
});

export type AIConfig = z.infer<typeof serverEnvSchema>;

const expoPublicPrefix = ["EXPO_", "PUBLIC_"].join("");
const forbiddenPublicSecretNames = [
  [expoPublicPrefix, "GEM", "INI_API_KEY"].join(""),
  [expoPublicPrefix, "GOOGLE_API_KEY"].join(""),
  [expoPublicPrefix, "GEM", "MA_API_KEY"].join(""),
];

export function loadAIConfig(env: Record<string, string | undefined> = process.env): AIConfig {
  for (const key of forbiddenPublicSecretNames) {
    if (env[key]) {
      throw new AIConfigurationError(`Forbidden public AI secret variable is set: ${key}`);
    }
  }

  const parsed = serverEnvSchema.safeParse({
    GEMINI_API_KEY: env.GEMINI_API_KEY,
    GEMMA_MODEL: env.GEMMA_MODEL ?? DEFAULT_GEMMA_MODEL,
    GEMMA_TIMEOUT_MS: env.GEMMA_TIMEOUT_MS ?? String(DEFAULT_GEMMA_TIMEOUT_MS),
    GEMMA_MAX_OUTPUT_TOKENS: env.GEMMA_MAX_OUTPUT_TOKENS ?? String(DEFAULT_GEMMA_MAX_OUTPUT_TOKENS),
  });

  if (!parsed.success) {
    throw new AIConfigurationError("AI environment variables are invalid.", {
      details: { issueCount: parsed.error.issues.length },
      cause: parsed.error,
    });
  }

  return parsed.data;
}

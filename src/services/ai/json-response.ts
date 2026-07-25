import { AIJsonParseError } from "./ai.errors";

export function extractJsonValue(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced?.[1] ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch (error) {
    throw new AIJsonParseError("AI response did not contain valid JSON.", { cause: error });
  }
}

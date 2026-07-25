import { AIJsonParseError, AIJsonTruncatedError } from "./ai.errors";

type JsonCandidate = {
  value: string;
  endIndex: number;
  truncated: boolean;
};

function stripMarkdownFence(text: string) {
  const match = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match?.[1]?.trim() ?? null;
}

function findBalancedObject(text: string, fromIndex: number): JsonCandidate | null {
  const start = text.indexOf("{", fromIndex);
  if (start < 0) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return { value: text.slice(start, index + 1), endIndex: index + 1, truncated: false };
      }
    }
  }

  return { value: text.slice(start), endIndex: text.length, truncated: true };
}

function extractUniqueObject(text: string) {
  const first = findBalancedObject(text, 0);
  if (!first) {
    throw new AIJsonParseError("AI response does not contain one JSON object.");
  }
  if (first.truncated) {
    throw new AIJsonTruncatedError();
  }

  const second = findBalancedObject(text, first.endIndex);
  if (second) {
    throw second.truncated
      ? new AIJsonTruncatedError()
      : new AIJsonParseError("AI response contains more than one JSON object.");
  }
  return first.value;
}

export function extractJsonValue(text: string): unknown {
  const trimmed = text.trim();
  const candidate = stripMarkdownFence(trimmed) ?? extractUniqueObject(trimmed);

  try {
    return JSON.parse(candidate);
  } catch (error) {
    throw new AIJsonParseError("AI response contains invalid JSON syntax.", { cause: error });
  }
}

import { AIJsonParseError } from "./ai.errors";

type JsonCandidate = {
  value: string;
  trailing: string;
};

function extractStrictJson(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }
  return null;
}

function extractMarkdownJson(text: string): string | null {
  const match = text.trim().match(/^```json\s*([\s\S]*?)\s*```$/i);
  return match?.[1]?.trim() ?? null;
}

function findBalancedJson(text: string): JsonCandidate | null {
  const start = text.search(/[\[{]/);
  if (start < 0) {
    return null;
  }

  const opener = text[start];
  const closer = opener === "{" ? "}" : "]";
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
    if (char === opener) {
      depth += 1;
    } else if (char === closer) {
      depth -= 1;
      if (depth === 0) {
        return { value: text.slice(start, index + 1), trailing: text.slice(index + 1) };
      }
    }
  }

  return null;
}

export function extractJsonValue(text: string): unknown {
  const markdownJson = extractMarkdownJson(text);
  if (markdownJson) {
    try {
      return JSON.parse(markdownJson);
    } catch (error) {
      throw new AIJsonParseError("AI response contains invalid JSON syntax.", { cause: error });
    }
  }

  const candidates = [extractStrictJson(text)].filter((value): value is string => value !== null);
  const balanced = findBalancedJson(text.trim());
  if (balanced && balanced.trailing.trim().length === 0) {
    candidates.push(balanced.value);
  } else if (balanced) {
    throw new AIJsonParseError("AI response contains ambiguous text after JSON.");
  }

  const unique = [...new Set(candidates)];
  if (unique.length !== 1) {
    throw new AIJsonParseError("AI response does not contain one unambiguous JSON value.");
  }

  try {
    return JSON.parse(unique[0]);
  } catch (error) {
    throw new AIJsonParseError("AI response contains invalid JSON syntax.", { cause: error });
  }
}

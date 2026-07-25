import { createUuid, nowIso } from "../types";

export function createBaseFields() {
  const now = nowIso();

  return {
    id: createUuid(),
    createdAt: now,
    updatedAt: now,
  };
}

export function touchFields() {
  return {
    updatedAt: nowIso(),
  };
}

export function firstOrThrow<T>(rows: T[], message: string) {
  const row = rows[0];

  if (!row) {
    throw new Error(message);
  }

  return row;
}

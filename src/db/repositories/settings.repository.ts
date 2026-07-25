import { eq } from "drizzle-orm";
import { db } from "../client";
import { appSettings } from "../schema";
import type { JsonValue } from "../types";
import { parseJson, serializeJson } from "../types";
import { createBaseFields, firstOrThrow, touchFields } from "./repository-utils";

export const settingsRepository = {
  get<T extends JsonValue>(key: string, fallback: T, guard?: (parsed: unknown) => parsed is T) {
    const row = db.select().from(appSettings).where(eq(appSettings.key, key)).get();

    return parseJson(row?.valueJson ?? null, fallback, guard);
  },

  set(key: string, value: JsonValue) {
    const existing = db.select().from(appSettings).where(eq(appSettings.key, key)).get();
    const valueJson = serializeJson(value);

    if (!existing) {
      return firstOrThrow(
        db.insert(appSettings).values({ ...createBaseFields(), key, valueJson }).returning().all(),
        "Unable to create setting.",
      );
    }

    return firstOrThrow(
      db
        .update(appSettings)
        .set({ valueJson, ...touchFields() })
        .where(eq(appSettings.id, existing.id))
        .returning()
        .all(),
      "Setting not found.",
    );
  },
};

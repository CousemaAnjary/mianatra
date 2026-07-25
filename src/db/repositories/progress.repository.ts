import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { conceptProgress } from "../schema";
import type { ConceptProgressStatus, NewConceptProgress } from "../types";
import { createBaseFields, firstOrThrow, touchFields } from "./repository-utils";

export type UpsertConceptProgressInput = Omit<NewConceptProgress, "id" | "createdAt" | "updatedAt">;

export const progressRepository = {
  listByProfile(profileId: string) {
    return db.select().from(conceptProgress).where(eq(conceptProgress.profileId, profileId)).all();
  },

  find(profileId: string, conceptId: string) {
    return db
      .select()
      .from(conceptProgress)
      .where(and(eq(conceptProgress.profileId, profileId), eq(conceptProgress.conceptId, conceptId)))
      .get();
  },

  upsert(input: UpsertConceptProgressInput) {
    const existing = this.find(input.profileId, input.conceptId);

    if (!existing) {
      return firstOrThrow(
        db.insert(conceptProgress).values({ ...createBaseFields(), ...input }).returning().all(),
        "Unable to create concept progress.",
      );
    }

    return firstOrThrow(
      db
        .update(conceptProgress)
        .set({ ...input, ...touchFields() })
        .where(eq(conceptProgress.id, existing.id))
        .returning()
        .all(),
      "Concept progress not found.",
    );
  },

  updateStatus(profileId: string, conceptId: string, status: ConceptProgressStatus, masteryScore: number) {
    return this.upsert({
      profileId,
      conceptId,
      status,
      masteryScore,
      lastReviewedAt: new Date().toISOString(),
    });
  },
};

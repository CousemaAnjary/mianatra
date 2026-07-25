import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../client";
import { recommendations } from "../schema";
import type { NewRecommendation, RecommendationType } from "../types";
import { createBaseFields, firstOrThrow, touchFields } from "./repository-utils";

export type CreateRecommendationInput = Omit<NewRecommendation, "id" | "dismissedAt" | "createdAt" | "updatedAt">;

export const recommendationsRepository = {
  create(input: CreateRecommendationInput) {
    return firstOrThrow(
      db.insert(recommendations).values({ ...createBaseFields(), ...input }).returning().all(),
      "Unable to create recommendation.",
    );
  },

  listActive(profileId: string, type?: RecommendationType) {
    return db
      .select()
      .from(recommendations)
      .where(
        type
          ? and(eq(recommendations.profileId, profileId), eq(recommendations.type, type), isNull(recommendations.dismissedAt))
          : and(eq(recommendations.profileId, profileId), isNull(recommendations.dismissedAt)),
      )
      .orderBy(desc(recommendations.createdAt))
      .all();
  },

  dismiss(id: string) {
    return firstOrThrow(
      db
        .update(recommendations)
        .set({ dismissedAt: new Date().toISOString(), ...touchFields() })
        .where(eq(recommendations.id, id))
        .returning()
        .all(),
      "Recommendation not found.",
    );
  },
};

import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { concepts } from "./concepts.table";
import { userProfiles } from "./user-profiles.table";

export const conceptProgress = sqliteTable(
  "concept_progress",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    conceptId: text("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    status: text("status", {
      enum: ["not_started", "to_discover", "in_progress", "needs_reinforcement", "mastered"],
    }).notNull(),
    masteryScore: integer("mastery_score").notNull(),
    lastReviewedAt: text("last_reviewed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("uniq_concept_progress_profile_concept").on(table.profileId, table.conceptId),
    index("idx_concept_progress_profile_id").on(table.profileId),
    index("idx_concept_progress_concept_id").on(table.conceptId),
  ],
);

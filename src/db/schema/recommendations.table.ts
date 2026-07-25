import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { courses } from "./courses.table";
import { userProfiles } from "./user-profiles.table";

export const recommendations = sqliteTable(
  "recommendations",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    courseId: text("course_id").references(() => courses.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    type: text("type", { enum: ["resume", "targeted", "new_course"] }).notNull(),
    title: text("title").notNull(),
    reason: text("reason").notNull(),
    payloadJson: text("payload_json").notNull(),
    dismissedAt: text("dismissed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_recommendations_profile_id").on(table.profileId),
    index("idx_recommendations_course_id").on(table.courseId),
    index("idx_recommendations_type").on(table.type),
  ],
);

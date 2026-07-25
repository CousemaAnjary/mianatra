import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { courses } from "./courses.table";
import { userProfiles } from "./user-profiles.table";

export const studySessions = sqliteTable(
  "study_sessions",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: text("type", { enum: ["initial", "targeted", "retry"] }).notNull(),
    status: text("status", { enum: ["active", "completed", "abandoned"] }).notNull(),
    startedAt: text("started_at").notNull(),
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_study_sessions_profile_id").on(table.profileId),
    index("idx_study_sessions_course_id").on(table.courseId),
    index("idx_study_sessions_status").on(table.status),
  ],
);

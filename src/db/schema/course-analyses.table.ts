import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { courses } from "./courses.table";

export const courseAnalyses = sqliteTable(
  "course_analyses",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade", onUpdate: "cascade" }),
    summary: text("summary").notNull(),
    keyPointsJson: text("key_points_json").notNull(),
    weaknessesJson: text("weaknesses_json").notNull(),
    modelVersion: text("model_version"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("idx_course_analyses_course_id").on(table.courseId)],
);

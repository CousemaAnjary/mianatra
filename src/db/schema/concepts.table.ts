import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { courses } from "./courses.table";

export const concepts = sqliteTable(
  "concepts",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade", onUpdate: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    explanation: text("explanation"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("uniq_concepts_course_slug").on(table.courseId, table.slug),
    index("idx_concepts_course_id").on(table.courseId),
  ],
);

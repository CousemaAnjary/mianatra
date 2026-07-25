import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { courses } from "./courses.table";

export const revisionSheets = sqliteTable(
  "revision_sheets",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade", onUpdate: "cascade" }),
    title: text("title").notNull(),
    contentMarkdown: text("content_markdown").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("idx_revision_sheets_course_id").on(table.courseId)],
);

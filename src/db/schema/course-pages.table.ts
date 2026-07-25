import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { courses } from "./courses.table";

export const coursePages = sqliteTable(
  "course_pages",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade", onUpdate: "cascade" }),
    pageNumber: integer("page_number").notNull(),
    imageUri: text("image_uri").notNull(),
    extractedText: text("extracted_text"),
    qualityStatus: text("quality_status", { enum: ["good", "blurry", "unreadable"] }).notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("uniq_course_pages_course_page").on(table.courseId, table.pageNumber),
    index("idx_course_pages_course_id").on(table.courseId),
  ],
);

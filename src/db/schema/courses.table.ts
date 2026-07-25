import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { subjects } from "./subjects.table";
import { userProfiles } from "./user-profiles.table";

export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "restrict", onUpdate: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    grade: text("grade").notNull(),
    status: text("status", { enum: ["draft", "processing", "ready", "archived"] }).notNull(),
    coverImageUri: text("cover_image_uri"),
    sourceUri: text("source_uri"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    archivedAt: text("archived_at"),
  },
  (table) => [
    index("idx_courses_profile_id").on(table.profileId),
    index("idx_courses_subject_id").on(table.subjectId),
    index("idx_courses_status").on(table.status),
  ],
);

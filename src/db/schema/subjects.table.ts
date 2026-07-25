import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const subjects = sqliteTable(
  "subjects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    color: text("color"),
    iconName: text("icon_name"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("uniq_subjects_slug").on(table.slug),
    index("idx_subjects_name").on(table.name),
  ],
);

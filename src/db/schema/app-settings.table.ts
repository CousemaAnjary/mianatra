import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const appSettings = sqliteTable(
  "app_settings",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    valueJson: text("value_json").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("uniq_app_settings_key").on(table.key)],
);

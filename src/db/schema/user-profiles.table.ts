import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userProfiles = sqliteTable(
  "user_profiles",
  {
    id: integer("id").primaryKey(),
    displayName: text("display_name").notNull(),
    age: integer("age").notNull(),
    grade: text("grade").notNull(),
    series: text("series"),
    schoolName: text("school_name"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [check("chk_user_profiles_singleton", sql`${table.id} = 1`)],
);

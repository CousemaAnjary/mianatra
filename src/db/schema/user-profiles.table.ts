import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userProfiles = sqliteTable(
  "user_profiles",
  {
    id: text("id").primaryKey(),
    firstName: text("first_name").notNull(),
    displayName: text("display_name"),
    grade: text("grade").notNull(),
    age: integer("age"),
    avatarUri: text("avatar_uri"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("idx_user_profiles_grade").on(table.grade)],
);

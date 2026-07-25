import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { studySessions } from "./study-sessions.table";

export const sessionReports = sqliteTable(
  "session_reports",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => studySessions.id, { onDelete: "cascade", onUpdate: "cascade" }),
    score: integer("score").notNull(),
    correctCount: integer("correct_count").notNull(),
    totalCount: integer("total_count").notNull(),
    strengthsJson: text("strengths_json").notNull(),
    weaknessesJson: text("weaknesses_json").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("uniq_session_reports_session_id").on(table.sessionId),
    index("idx_session_reports_session_id").on(table.sessionId),
  ],
);

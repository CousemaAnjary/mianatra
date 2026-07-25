import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { exercises } from "./exercises.table";
import { studySessions } from "./study-sessions.table";

export const exerciseAttempts = sqliteTable(
  "exercise_attempts",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => studySessions.id, { onDelete: "cascade", onUpdate: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade", onUpdate: "cascade" }),
    answerJson: text("answer_json").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
    score: integer("score").notNull(),
    attemptedAt: text("attempted_at").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("uniq_exercise_attempts_session_exercise").on(table.sessionId, table.exerciseId),
    index("idx_exercise_attempts_session_id").on(table.sessionId),
    index("idx_exercise_attempts_exercise_id").on(table.exerciseId),
  ],
);

import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { concepts } from "./concepts.table";
import { courses } from "./courses.table";

export const exercises = sqliteTable(
  "exercises",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade", onUpdate: "cascade" }),
    conceptId: text("concept_id").references(() => concepts.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    type: text("type", {
      enum: ["multiple_choice", "short_answer", "true_false", "numeric", "explanation"],
    }).notNull(),
    prompt: text("prompt").notNull(),
    optionsJson: text("options_json"),
    answerJson: text("answer_json").notNull(),
    explanation: text("explanation"),
    difficulty: integer("difficulty").notNull(),
    generatedFromWeakness: text("generated_from_weakness", {
      enum: ["concept", "method", "calculation", "graph_reading", "memorization"],
    }),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_exercises_course_id").on(table.courseId),
    index("idx_exercises_concept_id").on(table.conceptId),
    index("idx_exercises_difficulty").on(table.difficulty),
  ],
);

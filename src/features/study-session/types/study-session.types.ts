import type { DemoExercise } from "@/src/data/demo-data";
import type { ExerciseCheckResult } from "@/src/features/exercises/utils/exercise-checker";

export type SessionMode = "initial" | "targeted";

export type SessionAttempt = ExerciseCheckResult & {
  conceptName: string;
  usedHint: boolean;
};

export type SessionSummary = {
  score: number;
  correctAnswers: number;
  totalExercises: number;
  progress: number;
  strength: string;
  notionToImprove: string;
  nextRecommendation: string;
  attempts: SessionAttempt[];
  targetedExercises: DemoExercise[];
};

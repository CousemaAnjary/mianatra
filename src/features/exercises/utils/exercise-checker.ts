import type { DemoExercise } from "@/src/data/demo-data";
import { normalizeAnswer } from "./answer-normalizer";

export type ExerciseCheckResult = {
  exerciseId: string;
  answer: string;
  normalizedAnswer: string;
  isCorrect: boolean;
  expectedAnswer: string;
};

export function checkExerciseAnswer(
  exercise: DemoExercise,
  answer: string,
): ExerciseCheckResult {
  const normalizedAnswer = normalizeAnswer(answer);
  const acceptedAnswers = [exercise.expectedAnswer, ...(exercise.acceptedAnswers ?? [])].map(
    normalizeAnswer,
  );

  return {
    exerciseId: exercise.id,
    answer,
    normalizedAnswer,
    isCorrect: acceptedAnswers.includes(normalizedAnswer),
    expectedAnswer: exercise.expectedAnswer,
  };
}

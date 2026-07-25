import type { Exercise } from "@/src/db";

export type RealSessionExercise = {
  id: string;
  title: string;
  question: string;
  conceptName: string;
  type: "short-answer" | "multiple-choice" | "true-false";
  expectedAnswer: string;
  acceptedAnswers?: string[];
  options?: string[];
  hint: string;
  explanation: string;
  correctionSteps: string[];
  difficulty: "facile" | "moyen" | "cible";
  generatedFromWeakness?: string;
};

function parseOptions(exercise: Exercise) {
  if (!exercise.optionsJson) {
    return undefined;
  }
  try {
    const value = JSON.parse(exercise.optionsJson);
    return Array.isArray(value) ? value.filter((option): option is string => typeof option === "string") : undefined;
  } catch {
    return undefined;
  }
}

function mapExerciseType(type: Exercise["type"]): RealSessionExercise["type"] {
  if (type === "multiple_choice") {
    return "multiple-choice";
  }
  if (type === "true_false") {
    return "true-false";
  }
  return "short-answer";
}

function mapDifficulty(value: number): RealSessionExercise["difficulty"] {
  if (value <= 1) {
    return "facile";
  }
  if (value <= 3) {
    return "moyen";
  }
  return "cible";
}

export function toSessionExercise(exercise: Exercise, conceptName: string): RealSessionExercise {
  return {
    id: exercise.id,
    title: conceptName,
    question: exercise.question,
    conceptName,
    type: mapExerciseType(exercise.type),
    expectedAnswer: exercise.expectedAnswer,
    acceptedAnswers: [exercise.expectedAnswer],
    options: parseOptions(exercise),
    hint: exercise.hint ?? "Relis la fiche avant de répondre.",
    explanation: exercise.explanation,
    correctionSteps: [exercise.explanation],
    difficulty: mapDifficulty(exercise.difficulty),
    generatedFromWeakness: exercise.generatedFromWeakness ? "Série ciblée" : undefined,
  };
}

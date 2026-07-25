import type { DemoExercise } from "@/src/data/demo-data";
import { demoSession, demoTargetedExercises } from "@/src/data/demo-data";
import type { SessionAttempt, SessionSummary } from "../types/study-session.types";

export function calculateSessionScore(attempts: SessionAttempt[], totalExercises: number) {
  if (totalExercises <= 0) {
    return 0;
  }

  const correctAnswers = attempts.filter((attempt) => attempt.isCorrect).length;

  return Math.round((correctAnswers / totalExercises) * 100);
}

export function calculateDemoProgress(attempts: SessionAttempt[], totalExercises: number) {
  if (totalExercises <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((attempts.length / totalExercises) * 100));
}

export function buildSessionSummary(
  attempts: SessionAttempt[],
  exercises: DemoExercise[],
  targetedExercises: DemoExercise[] = demoTargetedExercises,
): SessionSummary {
  const totalExercises = exercises.length;
  const correctAnswers = attempts.filter((attempt) => attempt.isCorrect).length;
  const incorrectAttempts = attempts.filter((attempt) => !attempt.isCorrect);
  const firstWeakness = incorrectAttempts[0]?.conceptName ?? demoSession.notionToImprove;

  return {
    score: calculateSessionScore(attempts, totalExercises),
    correctAnswers,
    totalExercises,
    progress: calculateDemoProgress(attempts, totalExercises),
    strength:
      correctAnswers > 0
        ? "Tu avances avec méthode et tu sais déjà mobiliser plusieurs repères du chapitre."
        : "Tu as commencé la série et tu disposes maintenant d'un point de départ clair.",
    notionToImprove: firstWeakness,
    nextRecommendation:
      incorrectAttempts.length > 0
        ? "Faire une courte série ciblée sur la notion à renforcer."
        : "Revenir à l'accueil ou refaire une série plus difficile plus tard.",
    attempts,
    targetedExercises,
  };
}

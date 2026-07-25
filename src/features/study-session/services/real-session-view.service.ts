import type { StudySession } from "@/src/db";
import { startSession } from "./study-session.service";
import { toSessionExercise, type RealSessionExercise } from "../utils/real-session-exercise";

export type RealSessionView =
  | { status: "missing" }
  | { status: "empty"; session: StudySession }
  | { status: "ready"; session: StudySession; exercises: RealSessionExercise[]; currentExercise: RealSessionExercise; currentIndex: number };

export async function startRealCourseSession(courseId: string) {
  const { exercisesRepository } = await import("@/src/db");
  const exercises = await exercisesRepository.findAllByCourse(courseId);
  if (exercises.length === 0) {
    return null;
  }
  return startSession({
    courseId,
    type: "initial",
    exerciseIds: exercises.map((exercise) => exercise.id),
    strategy: "provided_exercises",
  });
}

export async function countRealCourseExercises(courseId: string) {
  const { exercisesRepository } = await import("@/src/db");
  return (await exercisesRepository.findAllByCourse(courseId)).length;
}

export async function loadRealSessionView(sessionId: string): Promise<RealSessionView> {
  const { conceptsRepository, exercisesRepository, studySessionsRepository } = await import("@/src/db");
  const session = await studySessionsRepository.findById(sessionId);
  if (!session) {
    return { status: "missing" };
  }

  const exercises = await exercisesRepository.findAllByCourse(session.courseId);
  if (exercises.length === 0) {
    return { status: "empty", session };
  }

  const conceptIds = [...new Set(exercises.map((exercise) => exercise.conceptId))];
  const conceptPairs = await Promise.all(
    conceptIds.map(async (conceptId) => [conceptId, (await conceptsRepository.findById(conceptId))?.name ?? "Notion"] as const),
  );
  const conceptNames = new Map(conceptPairs);
  const mappedExercises = exercises.map((exercise) => toSessionExercise(exercise, conceptNames.get(exercise.conceptId) ?? "Notion"));
  const currentIndex = Math.min(session.currentExerciseIndex, mappedExercises.length - 1);

  return {
    status: "ready",
    session,
    exercises: mappedExercises,
    currentExercise: mappedExercises[currentIndex],
    currentIndex,
  };
}

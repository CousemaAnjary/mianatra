import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { createId, nowIso } from "../helpers";
import { exerciseAttempts } from "../schema";
import type { ExerciseAttempt, NewExerciseAttempt } from "../types";
import { assertNonEmpty, firstOrThrow } from "./repository-utils";

export type CreateAttemptInput = Omit<NewExerciseAttempt, "id" | "createdAt">;

function validateAttemptInput(input: CreateAttemptInput) {
  assertNonEmpty(input.exerciseId, "exerciseId");
  assertNonEmpty(input.sessionId, "sessionId");
  assertNonEmpty(input.userAnswer, "userAnswer");
  if (typeof input.isCorrect !== "boolean") {
    throw new Error("isCorrect must be a boolean.");
  }
  if (typeof input.usedHint !== "boolean") {
    throw new Error("usedHint must be a boolean.");
  }
  if (input.responseTimeMs !== null && input.responseTimeMs !== undefined && input.responseTimeMs <= 0) {
    throw new Error("responseTimeMs must be positive or null.");
  }
}

async function create(input: CreateAttemptInput): Promise<ExerciseAttempt> {
  validateAttemptInput(input);
  return firstOrThrow(
    db.insert(exerciseAttempts).values({ id: createId(), createdAt: nowIso(), ...input }).returning().all(),
    "Unable to create exercise attempt.",
  );
}

async function findAllBySession(sessionId: string): Promise<ExerciseAttempt[]> {
  return db.select().from(exerciseAttempts).where(eq(exerciseAttempts.sessionId, sessionId)).orderBy(desc(exerciseAttempts.createdAt)).all();
}

async function findAllByExercise(exerciseId: string): Promise<ExerciseAttempt[]> {
  return db.select().from(exerciseAttempts).where(eq(exerciseAttempts.exerciseId, exerciseId)).orderBy(desc(exerciseAttempts.createdAt)).all();
}

export const attemptsRepository = {
  create,
  findAllBySession,
  findAllByExercise,
};

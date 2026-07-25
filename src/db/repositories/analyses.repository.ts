import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { courseAnalyses } from "../schema";
import type { CourseAnalysis, NewCourseAnalysis } from "../types";
import { assertNonEmpty, createTimedIdFields, firstOrThrow } from "./repository-utils";

export type CreateAnalysisInput = Omit<NewCourseAnalysis, "id" | "createdAt">;

function validateAnalysisInput(input: CreateAnalysisInput) {
  assertNonEmpty(input.courseId, "courseId");
  assertNonEmpty(input.detectedTitle, "detectedTitle");
  assertNonEmpty(input.detectedSubject, "detectedSubject");
  assertNonEmpty(input.rawJson, "rawJson");
}

async function findLatestByCourse(courseId: string): Promise<CourseAnalysis | null> {
  return (
    db.select().from(courseAnalyses).where(eq(courseAnalyses.courseId, courseId)).orderBy(desc(courseAnalyses.createdAt), desc(courseAnalyses.id)).get() ??
    null
  );
}

async function findAllByCourse(courseId: string): Promise<CourseAnalysis[]> {
  return db.select().from(courseAnalyses).where(eq(courseAnalyses.courseId, courseId)).orderBy(desc(courseAnalyses.createdAt), desc(courseAnalyses.id)).all();
}

async function create(input: CreateAnalysisInput): Promise<CourseAnalysis> {
  validateAnalysisInput(input);
  return firstOrThrow(
    db.insert(courseAnalyses).values({ ...createTimedIdFields(), ...input }).returning().all(),
    "Unable to create course analysis.",
  );
}

export const analysesRepository = {
  findLatestByCourse,
  findAllByCourse,
  create,
};

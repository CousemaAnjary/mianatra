import { and, asc, eq } from "drizzle-orm";
import { db } from "../client";
import { concepts, courseAnalyses, coursePages, exercises, revisionSheets } from "../schema";
import type { Difficulty, NewConcept, NewCourseAnalysis, NewCoursePage, NewExercise, NewRevisionSheet } from "../types";
import { ensureDifficulty } from "../types";
import { createBaseFields, firstOrThrow } from "./repository-utils";

export type CreateCoursePageInput = Omit<NewCoursePage, "id" | "createdAt" | "updatedAt">;
export type CreateCourseAnalysisInput = Omit<NewCourseAnalysis, "id" | "createdAt" | "updatedAt">;
export type CreateConceptInput = Omit<NewConcept, "id" | "createdAt" | "updatedAt">;
export type CreateRevisionSheetInput = Omit<NewRevisionSheet, "id" | "createdAt" | "updatedAt">;
export type CreateExerciseInput = Omit<NewExercise, "id" | "createdAt" | "updatedAt" | "difficulty"> & {
  difficulty: Difficulty;
};

export const courseContentRepository = {
  createPage(input: CreateCoursePageInput) {
    return firstOrThrow(
      db.insert(coursePages).values({ ...createBaseFields(), ...input }).returning().all(),
      "Unable to create course page.",
    );
  },

  listPages(courseId: string) {
    return db.select().from(coursePages).where(eq(coursePages.courseId, courseId)).orderBy(asc(coursePages.pageNumber)).all();
  },

  upsertAnalysis(input: CreateCourseAnalysisInput) {
    return db.transaction((tx) => {
      tx.delete(courseAnalyses).where(eq(courseAnalyses.courseId, input.courseId)).run();
      return firstOrThrow(
        tx.insert(courseAnalyses).values({ ...createBaseFields(), ...input }).returning().all(),
        "Unable to create course analysis.",
      );
    });
  },

  createConcept(input: CreateConceptInput) {
    return firstOrThrow(
      db.insert(concepts).values({ ...createBaseFields(), ...input }).returning().all(),
      "Unable to create concept.",
    );
  },

  listConcepts(courseId: string) {
    return db.select().from(concepts).where(eq(concepts.courseId, courseId)).orderBy(asc(concepts.title)).all();
  },

  upsertRevisionSheet(input: CreateRevisionSheetInput) {
    return db.transaction((tx) => {
      tx.delete(revisionSheets).where(eq(revisionSheets.courseId, input.courseId)).run();
      return firstOrThrow(
        tx.insert(revisionSheets).values({ ...createBaseFields(), ...input }).returning().all(),
        "Unable to create revision sheet.",
      );
    });
  },

  createExercise(input: CreateExerciseInput) {
    ensureDifficulty(input.difficulty);
    return firstOrThrow(
      db.insert(exercises).values({ ...createBaseFields(), ...input }).returning().all(),
      "Unable to create exercise.",
    );
  },

  listExercisesByCourse(courseId: string) {
    return db.select().from(exercises).where(eq(exercises.courseId, courseId)).all();
  },

  listExercisesByConcept(courseId: string, conceptId: string) {
    return db
      .select()
      .from(exercises)
      .where(and(eq(exercises.courseId, courseId), eq(exercises.conceptId, conceptId)))
      .all();
  },
};

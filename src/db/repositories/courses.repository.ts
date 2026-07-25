import { and, desc, eq } from "drizzle-orm";
import { db } from "../client";
import { concepts, courseAnalyses, coursePages, courses, exercises, revisionSheets } from "../schema";
import type { CourseStatus, NewCourse } from "../types";
import { createBaseFields, firstOrThrow, touchFields } from "./repository-utils";

export type CreateCourseInput = Omit<NewCourse, "id" | "createdAt" | "updatedAt">;
export type UpdateCourseInput = Partial<Omit<CreateCourseInput, "profileId" | "subjectId">>;

export const coursesRepository = {
  create(input: CreateCourseInput) {
    return firstOrThrow(
      db.insert(courses).values({ ...createBaseFields(), ...input }).returning().all(),
      "Unable to create course.",
    );
  },

  findById(id: string) {
    return db.select().from(courses).where(eq(courses.id, id)).get();
  },

  listByProfile(profileId: string, status?: CourseStatus) {
    return db
      .select()
      .from(courses)
      .where(status ? and(eq(courses.profileId, profileId), eq(courses.status, status)) : eq(courses.profileId, profileId))
      .orderBy(desc(courses.updatedAt))
      .all();
  },

  update(id: string, input: UpdateCourseInput) {
    return firstOrThrow(
      db.update(courses).set({ ...input, ...touchFields() }).where(eq(courses.id, id)).returning().all(),
      "Course not found.",
    );
  },

  updateStatus(id: string, status: CourseStatus) {
    return this.update(id, { status });
  },

  archive(id: string) {
    return this.update(id, { status: "archived", archivedAt: new Date().toISOString() });
  },

  getDetail(id: string) {
    return {
      course: this.findById(id),
      pages: db.select().from(coursePages).where(eq(coursePages.courseId, id)).all(),
      analyses: db.select().from(courseAnalyses).where(eq(courseAnalyses.courseId, id)).all(),
      concepts: db.select().from(concepts).where(eq(concepts.courseId, id)).all(),
      revisionSheets: db.select().from(revisionSheets).where(eq(revisionSheets.courseId, id)).all(),
      exercises: db.select().from(exercises).where(eq(exercises.courseId, id)).all(),
    };
  },
};

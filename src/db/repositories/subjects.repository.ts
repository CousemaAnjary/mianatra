import { asc, eq } from "drizzle-orm";
import { db } from "../client";
import { subjects } from "../schema";
import type { NewSubject } from "../types";
import { createBaseFields, firstOrThrow, touchFields } from "./repository-utils";

export type CreateSubjectInput = Omit<NewSubject, "id" | "createdAt" | "updatedAt">;
export type UpdateSubjectInput = Partial<CreateSubjectInput>;

export const subjectsRepository = {
  create(input: CreateSubjectInput) {
    return firstOrThrow(
      db.insert(subjects).values({ ...createBaseFields(), ...input }).returning().all(),
      "Unable to create subject.",
    );
  },

  findBySlug(slug: string) {
    return db.select().from(subjects).where(eq(subjects.slug, slug)).get();
  },

  list() {
    return db.select().from(subjects).orderBy(asc(subjects.name)).all();
  },

  update(id: string, input: UpdateSubjectInput) {
    return firstOrThrow(
      db.update(subjects).set({ ...input, ...touchFields() }).where(eq(subjects.id, id)).returning().all(),
      "Subject not found.",
    );
  },
};

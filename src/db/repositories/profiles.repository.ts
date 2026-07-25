import { eq } from "drizzle-orm";
import { db } from "../client";
import { userProfiles } from "../schema";
import type { NewUserProfile } from "../types";
import { createBaseFields, firstOrThrow, touchFields } from "./repository-utils";

export type CreateProfileInput = Omit<NewUserProfile, "id" | "createdAt" | "updatedAt">;
export type UpdateProfileInput = Partial<Omit<CreateProfileInput, "id">>;

export const profilesRepository = {
  create(input: CreateProfileInput) {
    return firstOrThrow(
      db.insert(userProfiles).values({ ...createBaseFields(), ...input }).returning().all(),
      "Unable to create profile.",
    );
  },

  findById(id: string) {
    return db.select().from(userProfiles).where(eq(userProfiles.id, id)).get();
  },

  list() {
    return db.select().from(userProfiles).all();
  },

  update(id: string, input: UpdateProfileInput) {
    return firstOrThrow(
      db.update(userProfiles).set({ ...input, ...touchFields() }).where(eq(userProfiles.id, id)).returning().all(),
      "Profile not found.",
    );
  },
};

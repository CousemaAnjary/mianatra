import { eq } from "drizzle-orm";
import { db } from "../client";
import { nowIso } from "../helpers";
import { userProfiles } from "../schema";
import type { NewUserProfile, UserProfile } from "../types";
import { assertInteger, assertNonEmpty, firstOrThrow } from "./repository-utils";

const PROFILE_ID = 1;

export type SaveProfileInput = Omit<NewUserProfile, "id" | "createdAt" | "updatedAt">;
export type UpdateProfileInput = Partial<SaveProfileInput>;

function validateProfileInput(input: SaveProfileInput) {
  assertNonEmpty(input.displayName, "displayName");
  assertInteger(input.age, "age");
  assertNonEmpty(input.grade, "grade");
}

function validateProfilePatch(input: UpdateProfileInput) {
  if (input.displayName !== undefined) {
    assertNonEmpty(input.displayName, "displayName");
  }
  if (input.age !== undefined) {
    assertInteger(input.age, "age");
  }
  if (input.grade !== undefined) {
    assertNonEmpty(input.grade, "grade");
  }
}

async function get(): Promise<UserProfile | null> {
  return db.select().from(userProfiles).where(eq(userProfiles.id, PROFILE_ID)).get() ?? null;
}

async function save(input: SaveProfileInput): Promise<UserProfile> {
  validateProfileInput(input);
  const now = nowIso();
  const existing = await get();

  if (!existing) {
    return firstOrThrow(
      db.insert(userProfiles).values({ id: PROFILE_ID, createdAt: now, updatedAt: now, ...input }).returning().all(),
      "Unable to save profile.",
    );
  }

  return firstOrThrow(
    db.update(userProfiles).set({ ...input, updatedAt: now }).where(eq(userProfiles.id, PROFILE_ID)).returning().all(),
    "Profile not found.",
  );
}

async function update(input: UpdateProfileInput): Promise<UserProfile> {
  validateProfilePatch(input);
  return firstOrThrow(
    db.update(userProfiles).set({ ...input, updatedAt: nowIso() }).where(eq(userProfiles.id, PROFILE_ID)).returning().all(),
    "Profile not found.",
  );
}

async function remove(): Promise<void> {
  db.delete(userProfiles).where(eq(userProfiles.id, PROFILE_ID)).run();
}

async function exists(): Promise<boolean> {
  return (await get()) !== null;
}

export const profilesRepository = {
  get,
  save,
  update,
  remove,
  exists,
};

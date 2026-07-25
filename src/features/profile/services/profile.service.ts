import type { SaveProfileInput, UpdateProfileInput, UserProfile } from "@/src/db";
import { ProfileNotFoundError } from "@/src/features/shared";
import { profileInputSchema, profilePatchSchema, type ProfileInput, type ProfilePatch } from "../schemas/profile.schemas";

type ProfileRepository = {
  get: () => Promise<UserProfile | null>;
  exists: () => Promise<boolean>;
  save: (input: SaveProfileInput) => Promise<UserProfile>;
  update: (input: UpdateProfileInput) => Promise<UserProfile>;
  remove: () => Promise<void>;
};

export function createProfileService(repository: ProfileRepository) {
  return {
    getProfile: async () => {
      const profile = await repository.get();
      if (!profile) {
        throw new ProfileNotFoundError();
      }
      return profile;
    },
    hasProfile: () => repository.exists(),
    createProfile: (input: ProfileInput) => repository.save(profileInputSchema.parse(input) satisfies SaveProfileInput),
    updateProfile: async (input: ProfilePatch) => {
      const profile = await repository.get();
      if (!profile) {
        throw new ProfileNotFoundError();
      }
      return repository.update(profilePatchSchema.parse(input) satisfies UpdateProfileInput);
    },
    deleteProfile: () => repository.remove(),
  };
}

async function getRepository() {
  return (await import("@/src/db")).profilesRepository;
}

export async function getProfile() {
  return createProfileService(await getRepository()).getProfile();
}

export async function hasProfile() {
  return createProfileService(await getRepository()).hasProfile();
}

export async function createProfile(input: ProfileInput) {
  return createProfileService(await getRepository()).createProfile(input);
}

export async function updateProfile(input: ProfilePatch) {
  return createProfileService(await getRepository()).updateProfile(input);
}

export async function deleteProfile() {
  return createProfileService(await getRepository()).deleteProfile();
}

export const profileService = { createProfile, deleteProfile, getProfile, hasProfile, updateProfile };

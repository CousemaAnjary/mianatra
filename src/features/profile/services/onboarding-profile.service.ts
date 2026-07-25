import type { UserProfile } from "@/src/db";
import type { ProfileInput } from "../schemas/profile.schemas";

export const onboardingGrades = ["2nde", "1ère", "Tale"] as const;
export type OnboardingGrade = (typeof onboardingGrades)[number];

export type OnboardingProfileForm = {
  displayName: string;
  age: string;
  grade: string;
  series: string;
  schoolName: string;
};

export type OnboardingProfileValidationErrors = Partial<Record<keyof OnboardingProfileForm | "form", string>>;

export type OnboardingProfileValidationResult =
  | { success: true; input: ProfileInput }
  | { success: false; errors: OnboardingProfileValidationErrors };

type OnboardingProfileDeps = {
  hasProfile: () => Promise<boolean>;
  createProfile: (input: ProfileInput) => Promise<UserProfile>;
};

function nullableTrimmed(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed.length > 0 ? trimmed : null;
}

export function validateOnboardingProfileForm(form: OnboardingProfileForm): OnboardingProfileValidationResult {
  const displayName = form.displayName.trim().replace(/\s+/g, " ");
  const ageText = form.age.trim();
  const age = Number(ageText);
  const grade = form.grade.trim();
  const errors: OnboardingProfileValidationErrors = {};

  if (displayName.length === 0) {
    errors.displayName = "Indique un prénom ou un pseudonyme.";
  }
  if (ageText.length === 0 || !Number.isInteger(age)) {
    errors.age = "Indique un âge entier.";
  }
  if (grade.length === 0) {
    errors.grade = "Choisis ta classe.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    input: {
      displayName,
      age,
      grade,
      series: nullableTrimmed(form.series),
      schoolName: nullableTrimmed(form.schoolName),
    },
  };
}

export function createOnboardingProfileService(dependencies: OnboardingProfileDeps) {
  return {
    shouldRedirectExistingProfile: () => dependencies.hasProfile(),
    createProfileFromForm: async (form: OnboardingProfileForm) => {
      const validation = validateOnboardingProfileForm(form);
      if (!validation.success) {
        return validation;
      }
      await dependencies.createProfile(validation.input);
      return validation;
    },
  };
}

export async function shouldRedirectExistingOnboardingProfile() {
  const { hasProfile } = await import("./profile.service");
  return createOnboardingProfileService({
    hasProfile,
    createProfile: async () => {
      throw new Error("createProfile is not available in this context.");
    },
  }).shouldRedirectExistingProfile();
}

export async function createOnboardingProfileFromForm(form: OnboardingProfileForm) {
  const { createProfile, hasProfile } = await import("./profile.service");
  return createOnboardingProfileService({ createProfile, hasProfile }).createProfileFromForm(form);
}

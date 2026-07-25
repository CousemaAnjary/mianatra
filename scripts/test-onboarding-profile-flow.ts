import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { ProfileInput } from "../src/features/profile";
import { createAppStartService } from "../src/features/profile/services/app-start.service";
import { createOnboardingProfileService, validateOnboardingProfileForm } from "../src/features/profile/services/onboarding-profile.service";
import type { UserProfile } from "../src/db";

const now = "2026-07-25T00:00:00.000Z";

function profile(input: ProfileInput): UserProfile {
  return {
    id: 1,
    displayName: input.displayName,
    age: input.age,
    grade: input.grade,
    series: input.series ?? null,
    schoolName: input.schoolName ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

function form(input: Partial<Parameters<typeof validateOnboardingProfileForm>[0]> = {}) {
  return {
    displayName: "  Aina  ",
    age: " 31 ",
    grade: "2nde",
    series: "",
    schoolName: "",
    ...input,
  };
}

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  assert.equal(await createAppStartService({ hasProfile: async () => false }).resolveInitialRoute(), "/onboarding", "aucun profil -> onboarding");
  assert.equal(await createAppStartService({ hasProfile: async () => true }).resolveInitialRoute(), "/(tabs)", "profil présent -> onglets");
  assert.equal(await createAppStartService({ hasProfile: async () => true }).resolveInitialRoute(), "/(tabs)", "redémarrage simulé -> onglets");

  const savedProfiles: UserProfile[] = [];
  let saveCalls = 0;
  const service = createOnboardingProfileService({
    hasProfile: async () => savedProfiles.length > 0,
    createProfile: async (input) => {
      saveCalls += 1;
      const saved = profile(input);
      savedProfiles[0] = saved;
      return saved;
    },
  });

  const created = await service.createProfileFromForm(form({ schoolName: "" }));
  assert.equal(created.success, true, "profil singleton créé");
  const savedProfile = savedProfiles[0];
  assert.ok(savedProfile, "profil sauvegardé");
  assert.equal(savedProfile.id, 1, "identifiant singleton conservé");
  assert.equal(savedProfile.displayName, "Aina", "nom normalisé");
  assert.equal(savedProfile.age, 31, "aucune contrainte artificielle 12-30");
  assert.equal(savedProfile.schoolName, null, "établissement vide accepté si nullable");
  assert.equal(saveCalls, 1, "une seule création appelée");
  assert.equal(await service.shouldRedirectExistingProfile(), true, "ouverture onboarding avec profil existant redirige");

  assert.equal(validateOnboardingProfileForm(form({ displayName: "" })).success, false, "nom vide rejeté");
  assert.equal(validateOnboardingProfileForm(form({ displayName: "   " })).success, false, "espaces uniquement rejetés");
  assert.equal(validateOnboardingProfileForm(form({ age: "17.5" })).success, false, "âge non entier rejeté");
  assert.equal(validateOnboardingProfileForm(form({ age: "abc" })).success, false, "âge non numérique rejeté");
  assert.equal(validateOnboardingProfileForm(form({ grade: "   " })).success, false, "classe vide rejetée");
  const emptyOptional = validateOnboardingProfileForm(form({ series: "  ", schoolName: "  " }));
  assert.equal(emptyOptional.success, true, "champs optionnels vides acceptés");
  if (emptyOptional.success) {
    assert.equal(emptyOptional.input.series, null, "série vide normalisée null");
    assert.equal(emptyOptional.input.schoolName, null, "établissement vide normalisé null");
  }

  let failingCreateCalled = false;
  const failingService = createOnboardingProfileService({
    hasProfile: async () => false,
    createProfile: async () => {
      failingCreateCalled = true;
      throw new Error("DB_FAIL");
    },
  });
  await assert.rejects(() => failingService.createProfileFromForm(form()), /DB_FAIL/, "échec DB ne réussit pas silencieusement");
  assert.equal(failingCreateCalled, true, "échec DB atteint après validation");

  const onboardingSource = read("src/app/onboarding/index.tsx");
  const profileSource = read("src/features/profile/services/onboarding-profile.service.ts");
  const appIndexSource = read("src/app/index.tsx");

  assert.doesNotMatch(onboardingSource, /demoProfile|demoGrades|demo-data|Fara/, "aucune donnée demoProfile/demoGrades/Fara dans l'onboarding");
  assert.doesNotMatch(profileSource, /demoProfile|demoGrades|demo-data|Fara/, "aucune donnée démo dans les services profil");
  assert.doesNotMatch(onboardingSource, /drizzle|expo-sqlite|db\.|profileRepository/, "aucune requête Drizzle directe dans l'onboarding");
  assert.doesNotMatch(appIndexSource, /drizzle|expo-sqlite|db\.|profileRepository/, "aucune requête Drizzle directe dans la route initiale");
  assert.doesNotMatch(appIndexSource, /Redirect.*onboarding/, "aucune redirection initiale fixe");
  assert.match(onboardingSource, /isSubmittingRef\.current/, "double soumission bloquée dans l'écran");

  console.log("onboarding profile flow tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { ConceptProgress, Course, StudySession, UserProfile } from "../src/db";
import type { ProfileInput } from "../src/features/profile";
import { createProfileViewService } from "../src/features/profile/services/profile-view.service";

const now = "2026-07-25T00:00:00.000Z";

function profile(input: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 1,
    displayName: "Aina",
    age: 31,
    grade: "2nde",
    series: "Scientifique",
    schoolName: "Lycée central",
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

function course(input: Partial<Course> = {}): Course {
  return {
    id: "course-1",
    subjectId: "subject-1",
    title: "Fonctions",
    grade: "2nde",
    status: "ready",
    summary: null,
    pageCount: 1,
    lastReviewedAt: null,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

function progress(input: Partial<ConceptProgress> = {}): ConceptProgress {
  return {
    conceptId: "concept-1",
    status: "mastered",
    score: 100,
    attemptsCount: 1,
    correctCount: 1,
    lastPracticedAt: now,
    updatedAt: now,
    ...input,
  };
}

function session(input: Partial<StudySession> = {}): StudySession {
  return {
    id: "session-1",
    courseId: "course-1",
    type: "initial",
    status: "completed",
    currentExerciseIndex: 0,
    startedAt: now,
    completedAt: now,
    durationSeconds: 60,
    createdAt: now,
    ...input,
  };
}

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function harness(input: {
  profile?: UserProfile;
  courses?: Course[];
  progressByCourse?: Record<string, ConceptProgress[]>;
  sessions?: StudySession[];
  failProfile?: boolean;
  failUpdate?: boolean;
} = {}) {
  let storedProfile = input.profile ?? profile();
  const updates: ProfileInput[] = [];
  const courses = input.courses ?? [];
  const progressByCourse = input.progressByCourse ?? {};
  const sessions = input.sessions ?? [];
  return {
    updates,
    service: createProfileViewService({
      profile: {
        getProfile: async () => {
          if (input.failProfile) {
            throw new Error("PROFILE_FAIL");
          }
          return storedProfile;
        },
        updateProfile: async (next) => {
          if (input.failUpdate) {
            throw new Error("UPDATE_FAIL");
          }
          updates.push(next);
          storedProfile = { ...storedProfile, ...next, id: 1, updatedAt: now };
          return storedProfile;
        },
      },
      courses: {
        findAll: async () => courses,
      },
      progress: {
        findAllByCourse: async (courseId) => progressByCourse[courseId] ?? [],
      },
      sessions: {
        findAll: async () => sessions,
      },
    }),
  };
}

async function main() {
  const empty = await harness().service.loadProfileView();
  assert.equal(empty.displayName, "Aina", "profil réel chargé");
  assert.equal(empty.displayName, "Aina", "nom réel affiché");
  assert.equal(empty.age, 31, "âge réel affiché");
  assert.equal(empty.grade, "2nde", "classe réelle affichée");
  assert.equal(empty.series, "Scientifique", "série réelle affichée");
  assert.equal(empty.schoolName, "Lycée central", "établissement réel affiché");
  assert.equal(empty.statistics.courseCount, 0, "zéro cours");
  assert.equal(empty.statistics.completedSessionCount, 0, "zéro session terminée");
  assert.equal(empty.statistics.averageProgress, 0, "progression absente -> 0");

  await assert.rejects(() => harness({ failProfile: true }).service.loadProfileView(), /PROFILE_FAIL/, "profil absent ou erreur représentable");

  const populated = await harness({
    courses: [
      course({ id: "course-1" }),
      course({ id: "course-2" }),
      course({ id: "archived", status: "archived" }),
    ],
    progressByCourse: {
      "course-1": [
        progress({ conceptId: "mastered", status: "mastered", score: 100 }),
        progress({ conceptId: "progressing", status: "in_progress", score: 50 }),
      ],
      "course-2": [progress({ conceptId: "needs", status: "needs_reinforcement", score: 20 })],
      archived: [progress({ conceptId: "archived-progress", status: "mastered", score: 100 })],
    },
    sessions: [
      session({ id: "completed-1", status: "completed" }),
      session({ id: "active", status: "active", completedAt: null }),
      session({ id: "completed-2", status: "completed" }),
    ],
  }).service.loadProfileView();
  assert.equal(populated.statistics.courseCount, 2, "plusieurs cours, archived exclus");
  assert.equal(populated.statistics.completedSessionCount, 2, "sessions terminées comptées");
  assert.equal(populated.statistics.averageProgress, 57, "progression moyenne entre 0 et 100");
  assert.equal(populated.statistics.masteredConceptCount, 1, "compteur concepts maîtrisés réel");
  assert.equal(populated.statistics.progressingConceptCount, 1, "compteur concepts en progression réel");
  assert.equal(populated.statistics.needsWorkConceptCount, 1, "compteur concepts à renforcer réel");

  const updater = harness();
  const updateResult = await updater.service.updateProfileFromForm({
    displayName: "  Noro  ",
    age: "42",
    grade: "Tale",
    series: "",
    schoolName: "  Lycée Nord  ",
  });
  assert.equal(updateResult.success, true, "modification du profil persistée");
  assert.equal(updater.updates.length, 1, "singleton mis à jour sans recréation");
  assert.deepEqual(updater.updates[0], {
    displayName: "Noro",
    age: 42,
    grade: "Tale",
    series: null,
    schoolName: "Lycée Nord",
  }, "valeurs modifiées normalisées");
  assert.equal((await updater.service.loadProfileView()).displayName, "Noro", "modification rechargée");

  await assert.rejects(
    () =>
      harness({ failUpdate: true }).service.updateProfileFromForm({
        displayName: "Aina",
        age: "31",
        grade: "2nde",
        series: "",
        schoolName: "",
      }),
    /UPDATE_FAIL/,
    "erreur DB représentable",
  );

  const profileScreen = read("src/app/(tabs)/profile.tsx");
  const profileFeature = [
    "src/features/profile/services/profile-view.service.ts",
    "src/features/profile/hooks/use-profile-view.ts",
    "src/features/profile/types/profile-view.types.ts",
  ].map(read).join("\n");
  assert.match(profileScreen, /AISettingsCard/, "configuration Gemini conservée");
  assert.match(profileScreen, /saveInFlightRef\.current/, "double sauvegarde bloquée");
  assert.doesNotMatch(profileScreen + profileFeature, /demoProfile|demoProfileStats|demoProfileMenu|demo-data|Fara/, "aucune donnée démo");
  assert.doesNotMatch(profileScreen, /drizzle|expo-sqlite|db\.|Repository/, "aucun accès DB direct dans l'écran");
  assert.doesNotMatch(profileFeature + profileScreen, /gemini_api_key|GEMINI_API_KEY/, "configuration Gemini non manipulée par le profil");

  console.log("profile view ui tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

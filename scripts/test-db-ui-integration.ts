import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { ConceptProgress, Course, CourseDetail, Exercise, StudySession, Subject, UserProfile } from "../src/db";
import { demoCourses } from "../src/data/demo-data";
import { createAppStartService } from "../src/features/profile/services/app-start.service";
import { createOnboardingProfileService } from "../src/features/profile/services/onboarding-profile.service";
import { createCoursesListViewService } from "../src/features/courses/services/courses-list-view.service";
import { createHomeDashboardService } from "../src/features/home/services/home-dashboard.service";
import { createProfileViewService } from "../src/features/profile/services/profile-view.service";
import { buildRealCourseResults, isExplicitDemoId, resolveExerciseSessionTarget } from "../src/features/courses";

const now = "2026-07-26T00:00:00.000Z";

function profile(input: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 1,
    displayName: "Aina",
    age: 31,
    grade: "2nde",
    series: null,
    schoolName: null,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

function course(input: Partial<Course> = {}): Course {
  return {
    id: "sqlite-course-1",
    subjectId: "subject-1",
    title: "Cours SQLite",
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

function subject(): Subject {
  return { id: "subject-1", name: "SVT", icon: "leaf", color: "#2E7D70", isDefault: true, createdAt: now };
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

function detail(input: { sourceCourse?: Course; progressRows?: ConceptProgress[] } = {}): CourseDetail {
  const sourceCourse = input.sourceCourse ?? course();
  return {
    course: sourceCourse,
    subject: subject(),
    pages: [],
    concepts: (input.progressRows ?? []).map((row, index) => ({
      id: row.conceptId,
      courseId: sourceCourse.id,
      name: `Notion ${index + 1}`,
      description: null,
      orderIndex: index,
      createdAt: now,
      progress: row,
    })),
    latestAnalysis: null,
    latestRevisionSheet: null,
  };
}

function session(input: Partial<StudySession> = {}): StudySession {
  return {
    id: "sqlite-session-1",
    courseId: "sqlite-course-1",
    type: "initial",
    status: "active",
    currentExerciseIndex: 0,
    startedAt: now,
    completedAt: null,
    durationSeconds: 0,
    createdAt: now,
    ...input,
  };
}

function exercise(input: Partial<Exercise> = {}): Exercise {
  return {
    id: "exercise-1",
    courseId: "sqlite-course-1",
    conceptId: "concept-1",
    type: "numeric",
    question: "2+2",
    expectedAnswer: "4",
    optionsJson: null,
    hint: null,
    explanation: "Addition",
    difficulty: 1,
    generatedFromWeakness: false,
    createdAt: now,
    ...input,
  };
}

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  assert.equal(await createAppStartService({ hasProfile: async () => false }).resolveInitialRoute(), "/onboarding", "profil absent -> onboarding");
  assert.equal(await createAppStartService({ hasProfile: async () => true }).resolveInitialRoute(), "/(tabs)", "profil présent -> onglets");

  let storedProfile = profile();
  const onboarding = createOnboardingProfileService({
    hasProfile: async () => true,
    createProfile: async (input) => {
      storedProfile = { ...storedProfile, ...input, id: 1 };
      return storedProfile;
    },
  });
  const createdProfile = await onboarding.createProfileFromForm({ displayName: " Noro ", age: "42", grade: "Tale", series: "", schoolName: " Lycée " });
  assert.equal(createdProfile.success, true, "profil modifié persisté");
  assert.equal(storedProfile.id, 1, "singleton conservé");
  assert.equal(storedProfile.displayName, "Noro", "valeurs trimées");

  const courses = [
    course({ id: "new-course", title: "Nouveau", updatedAt: "2026-07-26T10:00:00.000Z" }),
    course({ id: "old-course", title: "Ancien", updatedAt: "2026-07-25T10:00:00.000Z" }),
    course({ id: "archived", status: "archived", updatedAt: "2026-07-27T10:00:00.000Z" }),
  ];
  const courseListService = createCoursesListViewService({
    courses: {
      findAll: async () => courses,
      findDetailById: async (id) => {
        const found = courses.find((row) => row.id === id);
        return found ? detail({ sourceCourse: found, progressRows: [] }) : null;
      },
    },
  });
  const courseItems = await courseListService.loadCoursesList();
  assert.deepEqual(courseItems.map((item) => item.id), ["new-course", "old-course"], "cours créé visible dans Mes cours, archivé absent");
  assert.equal((await courseListService.loadCoursesList()).some((item) => item.id === "new-course"), true, "cours toujours visible après rechargement simulé");

  const home = await createHomeDashboardService({
    profile: { getProfile: async () => storedProfile },
    coursesList: { loadCoursesList: async () => courseItems },
    courses: { findById: async (id) => courses.find((row) => row.id === id) ?? null },
    exercises: { findAllByCourse: async (courseId) => [exercise({ courseId })] },
    sessions: { findActive: async () => [session({ id: "active-session", courseId: "new-course" })] },
  }).loadHomeDashboard();
  assert.equal(home.displayName, "Noro", "Accueil utilise le profil réel");
  assert.equal(home.recentCourses[0]?.id, "new-course", "cours créé visible dans Accueil");
  assert.equal(home.activeSession?.id, "active-session", "vraie session active visible sur l'accueil");

  const emptyProfileStats = await createProfileViewService({
    profile: { getProfile: async () => storedProfile, updateProfile: async (input) => ({ ...storedProfile, ...input }) },
    courses: { findAll: async () => [] },
    progress: { findAllByCourse: async () => [] },
    sessions: { findAll: async () => [] },
  }).loadProfileView();
  assert.equal(emptyProfileStats.statistics.courseCount, 0, "aucune activité -> compteurs à zéro");
  assert.equal(emptyProfileStats.statistics.averageProgress, 0, "aucune activité -> progression zéro");

  const completedStats = await createProfileViewService({
    profile: { getProfile: async () => storedProfile, updateProfile: async (input) => ({ ...storedProfile, ...input }) },
    courses: { findAll: async () => [course({ id: "new-course" })] },
    progress: { findAllByCourse: async () => [progress({ score: 120 }), progress({ status: "needs_reinforcement", score: -20 })] },
    sessions: { findAll: async () => [session({ status: "completed", completedAt: now }), session({ status: "active" })] },
  }).loadProfileView();
  assert.equal(completedStats.statistics.completedSessionCount, 1, "fin de session mise à jour dans le profil");
  assert.equal(completedStats.statistics.averageProgress >= 0 && completedStats.statistics.averageProgress <= 100, true, "progression bornée 0-100");

  const realWithoutProgress = buildRealCourseResults(detail());
  assert.deepEqual(realWithoutProgress.counters, { mastered: 0, progressing: 0, needsWork: 0 }, "ID réel -> état vide réel sans démo");
  assert.equal(resolveExerciseSessionTarget({ isDemoCourse: false, demoSessionId: "demo-session", realSessionId: null }), null, "ID réel sans session -> aucun fallback demoSession");
  assert.equal(isExplicitDemoId(demoCourses[0].id, demoCourses.map((item) => item.id)), true, "ID démo explicite -> démo encore fonctionnelle");
  assert.equal(isExplicitDemoId("sqlite-course-1", demoCourses.map((item) => item.id)), false, "ID réel -> aucune donnée démo");

  await assert.rejects(
    () =>
      createHomeDashboardService({
        profile: { getProfile: async () => Promise.reject(new Error("DB_FAIL")) },
        coursesList: { loadCoursesList: async () => [] },
        courses: { findById: async () => null },
        exercises: { findAllByCourse: async () => [] },
        sessions: { findActive: async () => [] },
      }).loadHomeDashboard(),
    /DB_FAIL/,
    "erreur DB -> aucun fallback démo",
  );

  const appSources = [
    "src/app/index.tsx",
    "src/app/onboarding/index.tsx",
    "src/app/(tabs)/index.tsx",
    "src/app/(tabs)/courses.tsx",
    "src/app/(tabs)/profile.tsx",
  ].map(read).join("\n");
  assert.doesNotMatch(appSources, /demoProfile|demoHomeCourses|demoCourseResults|demoRevisionSheet|Fara/, "surfaces principales sans fuite démo");
  assert.doesNotMatch(appSources, /drizzle|expo-sqlite|db\./, "aucun accès DB direct dans les écrans principaux");
  assert.doesNotMatch(read("src/app/course/[courseId]/index.tsx"), /\?\? demoCourseResults/, "détail réel sans fallback demoCourseResults");
  assert.doesNotMatch(read("src/app/course/[courseId]/results.tsx"), /progression de démonstration\.<\/AppText>/, "résultats réels sans texte démo inconditionnel");

  console.log("db ui integration tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

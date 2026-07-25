import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { Course, Exercise, StudySession, UserProfile } from "../src/db";
import type { CourseListItem } from "../src/features/courses";
import { createHomeDashboardService } from "../src/features/home/services/home-dashboard.service";

const now = "2026-07-25T00:00:00.000Z";

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

function item(input: Partial<CourseListItem> = {}): CourseListItem {
  return {
    id: "course-1",
    title: "Fonctions",
    subject: "Mathématiques",
    subjectColor: "#2E7D70",
    iconName: "square-root-alt",
    grade: "2nde",
    pageCount: 1,
    progress: 0,
    masteredCount: 0,
    progressingCount: 0,
    needsWorkCount: 0,
    status: "ready",
    updatedAt: now,
    ...input,
  };
}

function session(input: Partial<StudySession> = {}): StudySession {
  return {
    id: "session-1",
    courseId: "course-1",
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
    courseId: "course-1",
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

function harness(input: {
  userProfile?: UserProfile;
  courses?: Course[];
  courseItems?: CourseListItem[];
  sessions?: StudySession[];
  exercises?: Exercise[];
} = {}) {
  const userProfile = input.userProfile ?? profile();
  const courses = input.courses ?? [course()];
  const courseItems = input.courseItems ?? [item()];
  const sessions = input.sessions ?? [];
  const exercises = input.exercises ?? [exercise()];
  return createHomeDashboardService({
    profile: {
      getProfile: async () => userProfile,
    },
    coursesList: {
      loadCoursesList: async () => courseItems,
    },
    courses: {
      findById: async (id) => courses.find((row) => row.id === id) ?? null,
    },
    exercises: {
      findAllByCourse: async (courseId) => exercises.filter((row) => row.courseId === courseId),
    },
    sessions: {
      findActive: async () => sessions,
    },
  });
}

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function routeForCourse(courseId: string) {
  return { pathname: "/course/[courseId]", params: { courseId } };
}

function routeForSession(sessionId: string) {
  return { pathname: "/session/[sessionId]", params: { sessionId } };
}

async function main() {
  const empty = await harness({ courseItems: [], courses: [], sessions: [] }).loadHomeDashboard();
  assert.equal(empty.displayName, "Aina", "profil réel chargé");
  assert.equal(empty.displayName, "Aina", "nom réel affichable");
  assert.deepEqual(empty.recentCourses, [], "zéro cours représenté");
  assert.equal(empty.activeSession, null, "aucune session -> section masquée");

  const moreThanThree = [
    item({ id: "course-new", title: "Nouveau", updatedAt: "2026-07-25T10:00:00.000Z", progress: 0 }),
    item({ id: "course-mid", title: "Milieu", updatedAt: "2026-07-25T09:00:00.000Z", progress: 42 }),
    item({ id: "course-old", title: "Ancien", updatedAt: "2026-07-25T08:00:00.000Z" }),
    item({ id: "course-extra", title: "Extra", updatedAt: "2026-07-25T07:00:00.000Z" }),
  ];
  const dashboard = await harness({
    courseItems: moreThanThree,
    courses: moreThanThree.map((courseItem) => course({ id: courseItem.id, title: courseItem.title, updatedAt: courseItem.updatedAt })),
  }).loadHomeDashboard();
  assert.deepEqual(dashboard.recentCourses.map((row) => row.id), ["course-new", "course-mid", "course-old"], "plus de trois cours -> seulement trois récents triés");
  assert.equal(dashboard.recentCourses[0].progress, 0, "progression absente -> 0%");
  assert.equal(dashboard.recentCourses.some((row) => row.id === "course-extra"), false, "quatrième cours masqué");
  assert.equal(dashboard.recentCourses.some((row) => row.status === "draft" || row.status === "processing" || row.status === "ready"), true, "statuts réels conservés");

  const archivedNotReturned = await harness({
    courseItems: [item({ id: "real-course" })],
    courses: [course({ id: "real-course" }), course({ id: "archived", status: "archived" })],
  }).loadHomeDashboard();
  assert.equal(archivedNotReturned.recentCourses.some((row) => row.id === "archived"), false, "cours archivés absents");

  const active = await harness({
    courses: [course({ id: "course-1", title: "SVT réelle" })],
    sessions: [session({ id: "session-real", courseId: "course-1", currentExerciseIndex: 2 })],
    exercises: [exercise({ id: "e1" }), exercise({ id: "e2" }), exercise({ id: "e3" })],
  }).loadHomeDashboard();
  assert.equal(active.activeSession?.id, "session-real", "session active réelle affichée");
  assert.equal(active.activeSession?.courseTitle, "SVT réelle", "titre de cours de session réel");
  assert.equal(active.activeSession?.totalExercises, 3, "total exercices réel");

  const newestActive = await harness({
    courses: [course({ id: "course-1" })],
    sessions: [
      session({ id: "older-session", startedAt: "2026-07-25T08:00:00.000Z" }),
      session({ id: "newer-session", startedAt: "2026-07-25T09:00:00.000Z" }),
    ],
  }).loadHomeDashboard();
  assert.equal(newestActive.activeSession?.id, "newer-session", "plusieurs sessions -> plus récente choisie");

  assert.deepEqual(routeForCourse("sqlite-course-id"), { pathname: "/course/[courseId]", params: { courseId: "sqlite-course-id" } }, "navigation vers vrai courseId");
  assert.deepEqual(routeForSession("sqlite-session-id"), { pathname: "/session/[sessionId]", params: { sessionId: "sqlite-session-id" } }, "navigation vers vrai sessionId");

  await assert.rejects(
    () =>
      createHomeDashboardService({
        profile: { getProfile: async () => Promise.reject(new Error("NO_PROFILE")) },
        coursesList: { loadCoursesList: async () => [] },
        courses: { findById: async () => null },
        exercises: { findAllByCourse: async () => [] },
        sessions: { findActive: async () => [] },
      }).loadHomeDashboard(),
    /NO_PROFILE/,
    "erreur de chargement représentable",
  );

  const homeSource = read("src/app/(tabs)/index.tsx");
  const featureSource = read("src/features/home/services/home-dashboard.service.ts") + read("src/features/home/hooks/use-home-dashboard.ts");
  assert.doesNotMatch(homeSource + featureSource, /demoProfile|demoHomeCourses|demoCourse|demoSession|demo-data|Fara/, "aucune donnée démo dans l'accueil");
  assert.doesNotMatch(homeSource, /drizzle|expo-sqlite|db\.|Repository/, "aucun accès DB direct dans l'écran");

  console.log("home dashboard ui tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

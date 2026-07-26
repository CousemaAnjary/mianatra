import assert from "node:assert/strict";
import {
  BusinessError,
  CourseHasNoPagesError,
  DuplicateSubjectNameError,
  InvalidSessionStateError,
  SessionNotFoundError,
  SubjectInUseError,
  SubjectNotFoundError,
} from "../src/features/shared";
import { createProfileService } from "../src/features/profile";
import { createSubjectService } from "../src/features/subjects";
import { createCourseService } from "../src/features/courses";
import { createCourseImportService, normalizeRotation } from "../src/features/course-import";
import {
  checkMultipleChoiceAnswer,
  checkNumericAnswer,
  checkShortAnswer,
  checkTrueFalseAnswer,
  normalizeAnswer,
  validateExerciseAnswer,
} from "../src/features/exercises";
import { buildCourseProgressSummary, calculateConceptScore, calculateCourseProgressValue, createProgressService, determineConceptStatus } from "../src/features/progress";
import { createStudySessionService } from "../src/features/study-session";
import { createReportService } from "../src/features/reports";
import { buildRecommendations, createRecommendationService, rankRecommendations } from "../src/features/recommendations";
import type { Concept, ConceptProgress, Course, CoursePage, Exercise, ExerciseAttempt, SessionReport, StudySession, Subject, UserProfile } from "../src/db";

const now = "2026-07-25T00:00:00.000Z";

function id(value: string) {
  return value;
}

function makeSubject(input: Partial<Subject> = {}): Subject {
  return { id: id("subject-1"), name: "Math", icon: "calculator", color: "#E54A24", isDefault: false, createdAt: now, ...input };
}

function makeCourse(input: Partial<Course> = {}): Course {
  return {
    id: id("course-1"),
    subjectId: id("subject-1"),
    title: "Fonctions",
    grade: "2nde",
    status: "ready",
    summary: null,
    pageCount: 0,
    lastReviewedAt: null,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

function makeConcept(input: Partial<Concept> = {}): Concept {
  return { id: id("concept-1"), courseId: id("course-1"), name: "Images", description: null, orderIndex: 0, createdAt: now, ...input };
}

function makeExercise(input: Partial<Exercise> = {}): Exercise {
  return {
    id: id("exercise-1"),
    courseId: id("course-1"),
    conceptId: id("concept-1"),
    type: "numeric",
    question: "2 + 2",
    expectedAnswer: "4",
    optionsJson: null,
    hint: null,
    explanation: "Addition.",
    difficulty: 1,
    generatedFromWeakness: false,
    createdAt: now,
    ...input,
  };
}

function makeSession(input: Partial<StudySession> = {}): StudySession {
  return {
    id: id("session-1"),
    courseId: id("course-1"),
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

async function main() {
assert.equal(normalizeAnswer("  Réponse,  A  "), "reponse,a", "normalisation espaces, casse et accents");
assert.equal(checkMultipleChoiceAnswer("B", " b ").status, "correct", "QCM déterministe");
assert.equal(checkTrueFalseAnswer("vrai", "true").status, "correct", "vrai/faux déterministe");
assert.equal(checkNumericAnswer("3.14", "3,1400004").status, "correct", "numérique avec tolérance 0.000001");
assert.equal(checkShortAnswer("Suite arithmétique", " suite   arithmetique ").status, "correct", "réponse courte normalisée");
assert.equal(validateExerciseAnswer(makeExercise({ type: "explanation", expectedAnswer: "Explique" }), "Parce que").status, "requires_ai_review");
assert.throws(() => normalizeAnswer("   "), BusinessError, "réponse absente rejetée");

let savedProfile: UserProfile | null = null;
const profileService = createProfileService({
  get: async () => savedProfile,
  exists: async () => savedProfile !== null,
  save: async (input) => {
    const nextProfile = { id: 1, createdAt: now, updatedAt: now, ...input, series: input.series ?? null, schoolName: input.schoolName ?? null };
    savedProfile = nextProfile;
    return nextProfile;
  },
  update: async (input) => {
    const nextProfile = { ...(savedProfile as UserProfile), ...input, series: input.series ?? savedProfile?.series ?? null, schoolName: input.schoolName ?? savedProfile?.schoolName ?? null, updatedAt: now };
    savedProfile = nextProfile;
    return nextProfile;
  },
  remove: async () => {
    savedProfile = null;
  },
});
const createdProfile = await profileService.createProfile({ displayName: " Fara ", age: 17, grade: "2nde", series: null, schoolName: null });
assert.equal(createdProfile.age, 17, "profil avec âge entier");
assert.throws(() => profileService.createProfile({ displayName: "Fara", age: 17.5, grade: "2nde", series: null, schoolName: null }), Error);

const subjectService = createSubjectService({
  subjects: {
    findAll: async () => [],
    findById: async () => makeSubject(),
    findByName: async () => null,
    create: async () => {
      throw new Error("UNIQUE constraint failed: subjects.name");
    },
    update: async () => makeSubject(),
    remove: async () => undefined,
  } as Parameters<typeof createSubjectService>[0]["subjects"],
  courses: { findAllBySubject: async () => [makeCourse()] } as Parameters<typeof createSubjectService>[0]["courses"],
});
await assert.rejects(() => subjectService.createSubject({ name: " Math ", icon: "book", color: "#111" }), DuplicateSubjectNameError);
await assert.rejects(() => subjectService.deleteSubject(id("subject-1")), SubjectInUseError);

const courseService = createCourseService({
  subjects: { findById: async () => null } as Parameters<typeof createCourseService>[0]["subjects"],
  courses: {} as Parameters<typeof createCourseService>[0]["courses"],
});
await assert.rejects(() => courseService.createDraftCourse({ subjectId: "missing", title: "Cours", grade: "2nde" }), SubjectNotFoundError);

const courseImportService = createCourseImportService({
  subjects: { findById: async () => makeSubject() } as Parameters<typeof createCourseImportService>[0]["subjects"],
  courses: {
    findById: async () => makeCourse({ pageCount: 0 }),
    createWithPages: async (input) => ({ course: makeCourse({ pageCount: input.pages.length }), pages: [] }),
    update: async (_id, input) => makeCourse({ pageCount: input.pageCount ?? 0, status: input.status ?? "draft" }),
  } as Parameters<typeof createCourseImportService>[0]["courses"],
  pages: {
    findAllByCourse: async () => [],
    createMany: async () => [],
    replaceOrder: async (_courseId, orderedPageIds) => orderedPageIds.map((pageId, pageIndex) => ({ id: pageId, courseId: id("course-1"), localUri: `file://${pageId}`, thumbnailUri: null, pageIndex, rotation: 0, qualityStatus: "good", createdAt: now })),
    updateRotation: async (_pageId, rotation) => ({ id: "page", courseId: id("course-1"), localUri: "file://p", thumbnailUri: null, pageIndex: 0, rotation, qualityStatus: "good", createdAt: now }),
    updateQualityStatus: async () => ({ id: "page", courseId: id("course-1"), localUri: "file://p", thumbnailUri: null, pageIndex: 0, rotation: 0, qualityStatus: "blurry", createdAt: now }),
    remove: async () => undefined,
    removeMany: async () => undefined,
  } as Parameters<typeof createCourseImportService>[0]["pages"],
});
assert.equal(normalizeRotation(-90), 270, "rotation normalisée");
await assert.rejects(() => courseImportService.compileCourse(id("course-1")), CourseHasNoPagesError);
assert.deepEqual((await courseImportService.reorderPages(id("course-1"), ["p2", "p1"])).map((page) => page.pageIndex), [0, 1], "ordre de pages continu");

assert.equal(calculateConceptScore({ attemptsCount: 0, correctCount: 0, usedHintCount: 0 }), 0, "score absent");
assert.equal(calculateConceptScore({ attemptsCount: 1, correctCount: 0, usedHintCount: 0 }), 0, "score minimum");
assert.equal(calculateConceptScore({ attemptsCount: 1, correctCount: 1, usedHintCount: 0 }), 100, "score maximum");
assert.equal(calculateConceptScore({ attemptsCount: 2, correctCount: 1, usedHintCount: 1 }), 47, "calcul score pénalisé");
assert.equal(determineConceptStatus(0, 0), "not_started", "statut not_started");
assert.equal(determineConceptStatus(2, 40), "needs_reinforcement", "statut needs_reinforcement");
assert.equal(determineConceptStatus(3, 90), "mastered", "statut mastered");
assert.equal(determineConceptStatus(2, 50), "in_progress", "statut seuil 50");
assert.equal(determineConceptStatus(3, 85), "mastered", "statut seuil 85");
assert.equal(calculateCourseProgressValue([{ score: 50 } as ConceptProgress, { score: 100 } as ConceptProgress]), 75, "progression cours 0-100");
assert.equal(buildCourseProgressSummary([]).progress, 0, "aucune notion -> progression 0");
assert.equal(
  buildCourseProgressSummary([
    { ...makeConcept({ id: "c1" }), progress: null },
    { ...makeConcept({ id: "c2" }), progress: null },
    { ...makeConcept({ id: "c3" }), progress: null },
    { ...makeConcept({ id: "c4" }), progress: null },
    { ...makeConcept({ id: "c5" }), progress: null },
  ]).progress,
  0,
  "5 notions sans progression -> 0",
);
assert.equal(
  buildCourseProgressSummary([
    { ...makeConcept({ id: "c1" }), progress: { score: 100, status: "mastered", attemptsCount: 2, lastPracticedAt: now, updatedAt: now } },
    { ...makeConcept({ id: "c2" }), progress: null },
    { ...makeConcept({ id: "c3" }), progress: null },
    { ...makeConcept({ id: "c4" }), progress: null },
    { ...makeConcept({ id: "c5" }), progress: null },
  ]).progress,
  20,
  "1 notion à 100 et 4 sans progression -> 20",
);

const attempts: ExerciseAttempt[] = [];
const savedProgressRows: ConceptProgress[] = [];
const progressService = createProgressService({
  attempts: {
    findAllByExercise: async () => attempts,
    findAllByConcept: async () => attempts,
  } as Parameters<typeof createProgressService>[0]["attempts"],
  concepts: { findAllByCourse: async () => [makeConcept(), makeConcept({ id: "concept-2", name: "Limites" })] } as Parameters<typeof createProgressService>[0]["concepts"],
  exercises: { findById: async () => makeExercise() } as Parameters<typeof createProgressService>[0]["exercises"],
  progress: {
    findByConcept: async () => null,
    findAll: async () => [],
    findAllByCourse: async () => [
      { conceptId: "concept-1", score: 90, status: "mastered", attemptsCount: 2, correctCount: 2, lastPracticedAt: now, updatedAt: now },
      { conceptId: "concept-2", score: 30, status: "needs_reinforcement", attemptsCount: 2, correctCount: 0, lastPracticedAt: now, updatedAt: now },
    ],
    upsert: async (conceptId, input) => {
      const nextProgress = { conceptId, updatedAt: now, ...input, lastPracticedAt: input.lastPracticedAt ?? null };
      savedProgressRows.push(nextProgress);
      return nextProgress;
    },
    remove: async () => undefined,
  } as Parameters<typeof createProgressService>[0]["progress"],
});
attempts.push({ id: "attempt-1", sessionId: "session-1", exerciseId: "exercise-1", userAnswer: "4", isCorrect: true, usedHint: false, mistakeType: null, responseTimeMs: null, createdAt: now });
const updatedProgress = await progressService.updateAfterAttempt(attempts[0]);
assert.equal(updatedProgress.status, "to_discover", "tentative enregistrée puis progression");
assert.equal(savedProgressRows.at(-1)?.score, 100, "progression persistée sans conversion 0-1");
assert.equal((await progressService.getStrongConcepts(id("course-1"))).length, 1, "notion forte");
assert.equal((await progressService.getWeakConcepts(id("course-1"))).length, 1, "notion faible");
attempts.length = 0;

let activeSession: StudySession | null = null;
const submittedProgressRows: ConceptProgress[] = [];
const sessionService = createStudySessionService({
  courses: { findById: async () => makeCourse() } as Parameters<typeof createStudySessionService>[0]["courses"],
  exercises: { findAllByCourse: async () => [makeExercise()], findById: async () => makeExercise() } as Parameters<typeof createStudySessionService>[0]["exercises"],
  sessions: {
    findById: async () => activeSession,
    findActive: async () => (activeSession ? [activeSession] : []),
    findActiveByCourse: async () => activeSession,
    create: async (input) => {
      activeSession = makeSession({ type: input.type });
      return activeSession;
    },
    updateCurrentExerciseIndex: async (_sessionId, index) => makeSession({ currentExerciseIndex: index }),
    complete: async () => makeSession({ status: "completed" }),
    abandon: async () => makeSession({ status: "abandoned" }),
  } as Parameters<typeof createStudySessionService>[0]["sessions"],
  attempts: {
    create: async () => {
      throw new Error("submitAnswer must use submitWithProgress");
    },
    findAllByExercise: async (exerciseId) => attempts.filter((attempt) => attempt.exerciseId === exerciseId),
    findAllByConcept: async (conceptId) => {
      const sessionExercises = [makeExercise({ conceptId })];
      const exerciseIds = new Set(sessionExercises.map((exercise) => exercise.id));
      return attempts.filter((attempt) => exerciseIds.has(attempt.exerciseId));
    },
    findAllBySession: async (sessionId) => attempts.filter((attempt) => attempt.sessionId === sessionId),
    submitWithProgress: async (input) => {
      const attempt = {
        id: `attempt-${attempts.length + 1}`,
        createdAt: now,
        ...input.attempt,
        mistakeType: input.attempt.mistakeType ?? null,
        responseTimeMs: input.attempt.responseTimeMs ?? null,
      };
      attempts.push(attempt);
      const nextProgress = { conceptId: input.progress.conceptId, updatedAt: now, ...input.progress.input, lastPracticedAt: input.progress.input.lastPracticedAt ?? null };
      submittedProgressRows.push(nextProgress);
      return { attempt, progress: nextProgress, session: null };
    },
  } as Parameters<typeof createStudySessionService>[0]["attempts"],
});
assert.equal((await sessionService.startSession({ courseId: id("course-1"), type: "initial" })).type, "initial", "session initiale");
activeSession = null;
assert.equal((await sessionService.startSession({ courseId: id("course-1"), type: "targeted", exerciseIds: ["exercise-1"], strategy: "provided_exercises" })).type, "targeted", "session ciblée");
assert.equal((await sessionService.resumeSession(id("course-1"))).status, "active", "reprise session");
assert.equal((await sessionService.submitAnswer({ sessionId: id("session-1"), exerciseId: id("exercise-1"), answer: "4" })).validation.status, "correct", "soumission tentative");
assert.equal(submittedProgressRows.at(-1)?.score, 100, "submitAnswer calcule un score 0-100");
assert.equal(submittedProgressRows.at(-1)?.attemptsCount, 1, "submitAnswer persiste tentative et progression ensemble");
activeSession = null;
await assert.rejects(() => sessionService.resumeSession(id("course-1")), SessionNotFoundError);
activeSession = makeSession({ status: "abandoned" });
await assert.rejects(() => sessionService.submitAnswer({ sessionId: id("session-1"), exerciseId: id("exercise-1"), answer: "4" }), InvalidSessionStateError);

let report: SessionReport | null = null;
const reportService = createReportService({
  sessions: { findById: async () => makeSession({ status: "completed" }) } as Parameters<typeof createReportService>[0]["sessions"],
  attempts: { findAllBySession: async () => attempts } as Parameters<typeof createReportService>[0]["attempts"],
  exercises: { findById: async () => makeExercise() } as Parameters<typeof createReportService>[0]["exercises"],
  reports: {
    findBySession: async () => report,
    create: async (input) => {
      const nextReport = { id: "report-1", createdAt: now, ...input, strongConceptId: input.strongConceptId ?? null, weakConceptId: input.weakConceptId ?? null };
      report = nextReport;
      return nextReport;
    },
    replaceForSession: async () => {
      throw new Error("unused");
    },
  } as Parameters<typeof createReportService>[0]["reports"],
});
assert.equal((await reportService.buildSessionReport(id("session-1"))).totalAnswers > 0, true, "rapport");

const drafts = buildRecommendations({
  interruptedSessions: [{ courseId: "c1", courseTitle: "Cours A" }],
  weakConcepts: [{ courseId: "c2", conceptId: "k1", conceptName: "Notion" }],
  staleCourses: [{ courseId: "c3", title: "Ancien" }],
  recentCourses: [{ courseId: "c4", title: "Nouveau" }],
  canCreateNewCourse: true,
});
assert.deepEqual(rankRecommendations(drafts).map((recommendation) => recommendation.priority), [1, 2, 3, 4, 5], "classement recommandations");

const recommendationService = createRecommendationService({
  courses: { findAll: async () => [makeCourse({ status: "draft" })], findDetailById: async () => ({ course: makeCourse(), subject: makeSubject(), pages: [] as CoursePage[], concepts: [], latestAnalysis: null, latestRevisionSheet: null }) } as Parameters<typeof createRecommendationService>[0]["courses"],
  sessions: { findActive: async () => [makeSession()] } as Parameters<typeof createRecommendationService>[0]["sessions"],
  recommendations: {
    findActive: async () => [],
    findAll: async () => [],
    findById: async () => null,
    create: async (input) => ({ id: `rec-${input.priority}`, completedAt: null, createdAt: now, ...input }),
    complete: async (recId) => ({ id: recId, courseId: null, conceptId: null, type: "new_course", title: "Done", description: "Done", estimatedMinutes: 1, priority: 9, completedAt: now, createdAt: now }),
    remove: async () => undefined,
  } as Parameters<typeof createRecommendationService>[0]["recommendations"],
});
assert.equal((await recommendationService.refreshRecommendations())[0].priority, 1, "recommandations actives déterministes");

console.log("business service tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

import assert from "node:assert/strict";
import type { Concept, Course, CourseAnalysis, CourseDetail, CoursePage, RevisionSheet, Subject } from "@/src/db";
import { demoCourseResults, demoCourses, demoRevisionSheet, demoSession } from "@/src/data/demo-data";
import {
  buildRealCourseResults,
  isExplicitDemoId,
  resolveExerciseSessionTarget,
} from "@/src/features/courses";
import { buildCourseProgressSummary } from "@/src/features/progress";

const now = "2026-07-26T00:00:00.000Z";

function course(input: Partial<Course> = {}): Course {
  return {
    id: "sqlite-course-1",
    subjectId: "subject-1",
    title: "Cours SQLite",
    grade: "2nde",
    status: "ready",
    pageCount: 1,
    summary: null,
    lastReviewedAt: null,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

function subject(): Subject {
  return { id: "subject-1", name: "SVT", icon: "book", color: "#D94B24", isDefault: false, createdAt: now };
}

function concept(input: Partial<Concept> = {}): CourseDetail["concepts"][number] {
  return {
    id: "concept-1",
    courseId: "sqlite-course-1",
    name: "Mitose",
    description: null,
    orderIndex: 0,
    createdAt: now,
    progress: null,
    ...input,
  };
}

function detail(input: Partial<CourseDetail> = {}): CourseDetail {
  return {
    course: course(),
    subject: subject(),
    pages: [] as CoursePage[],
    concepts: [concept()],
    latestAnalysis: null as CourseAnalysis | null,
    latestRevisionSheet: null as RevisionSheet | null,
    ...input,
  };
}

function main() {
  const realWithoutProgress = buildRealCourseResults(detail());
  assert.deepEqual(realWithoutProgress.counters, { totalConcepts: 1, mastered: 0, progressing: 0, needsWork: 0, notStarted: 1 }, "vrai cours sans progression: compteurs réels sans démo");
  assert.equal(realWithoutProgress.progress, 0, "vrai cours sans progression: progression zéro");
  assert.notDeepEqual(realWithoutProgress.counters, demoCourseResults.counters, "vrai cours ne retourne jamais demoCourseResults");

  const mixedSummary = buildCourseProgressSummary([
    { ...concept({ id: "c1" }), progress: { score: 100, status: "mastered", attemptsCount: 2, lastPracticedAt: now, updatedAt: now } },
    { ...concept({ id: "c2" }), progress: { score: 50, status: "in_progress", attemptsCount: 2, lastPracticedAt: now, updatedAt: now } },
    { ...concept({ id: "c3" }), progress: { score: 0, status: "to_discover", attemptsCount: 1, lastPracticedAt: now, updatedAt: now } },
    { ...concept({ id: "c4" }), progress: null },
  ]);
  assert.equal(mixedSummary.progress, 38, "scores 100, 50, 0, null -> 38");
  assert.deepEqual(
    {
      totalConcepts: mixedSummary.totalConcepts,
      mastered: mixedSummary.mastered,
      progressing: mixedSummary.progressing,
      needsWork: mixedSummary.needsWork,
      notStarted: mixedSummary.notStarted,
    },
    { totalConcepts: 4, mastered: 1, progressing: 2, needsWork: 0, notStarted: 1 },
    "statuts canoniques agrégés",
  );

  assert.equal(
    resolveExerciseSessionTarget({ isDemoCourse: false, demoSessionId: demoSession.id, realSessionId: null }),
    null,
    "vrai cours sans session réelle ne navigue jamais vers demoSession.id",
  );
  assert.equal(
    resolveExerciseSessionTarget({ isDemoCourse: false, demoSessionId: demoSession.id, realSessionId: "sqlite-session-1" }),
    "sqlite-session-1",
    "vrai cours utilise une session SQLite",
  );
  assert.equal(
    resolveExerciseSessionTarget({ isDemoCourse: true, demoSessionId: demoSession.id, realSessionId: null }),
    demoSession.id,
    "session démo explicite continue de fonctionner",
  );

  const demoIds = demoCourses.map((item) => item.id);
  assert.equal(isExplicitDemoId(demoCourses[0].id, demoIds), true, "cours démo explicite continue de fonctionner");
  assert.equal(isExplicitDemoId("sqlite-course-1", demoIds), false, "courseId SQLite ne peut pas utiliser la démo");
  assert.equal(demoRevisionSheet.courseId === "sqlite-course-1" && isExplicitDemoId("sqlite-course-1", demoIds), false, "fiche réelle absente n'affiche pas demoRevisionSheet");

  console.log("real route data tests OK");
}

main();

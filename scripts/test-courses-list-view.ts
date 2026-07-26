import assert from "node:assert/strict";
import type { ConceptProgress, Course, CourseDetail, Subject } from "../src/db";
import { buildCourseGradeFilters, createCoursesListViewService } from "../src/features/courses/services/courses-list-view.service";

const now = "2026-07-25T00:00:00.000Z";

function course(input: Partial<Course> = {}): Course {
  return {
    id: "course-1",
    subjectId: "subject-1",
    title: "Fonctions affines",
    grade: "2nde",
    status: "ready",
    summary: null,
    pageCount: 2,
    lastReviewedAt: null,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

function subject(input: Partial<Subject> = {}): Subject {
  return {
    id: "subject-1",
    name: "Mathématiques",
    icon: "square-root-alt",
    color: "#2E7D70",
    isDefault: true,
    createdAt: now,
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

function detail(input: { course?: Course; subject?: Subject | null; progressRows?: ConceptProgress[] } = {}): CourseDetail {
  const sourceCourse = input.course ?? course();
  return {
    course: sourceCourse,
    subject: input.subject === undefined ? subject({ id: sourceCourse.subjectId }) : input.subject,
    pages: [],
    concepts: (input.progressRows ?? []).map((item, index) => ({
      id: item.conceptId,
      courseId: sourceCourse.id,
      name: `Notion ${index + 1}`,
      description: null,
      orderIndex: index,
      createdAt: now,
      progress: item,
    })),
    latestAnalysis: null,
    latestRevisionSheet: null,
  };
}

async function main() {
  const courses = [
    course({ id: "newest", title: "SVT réelle", subjectId: "subject-svt", grade: "1ère", pageCount: 3, updatedAt: "2026-07-25T10:00:00.000Z" }),
    course({ id: "archived", title: "Archivé", status: "archived", updatedAt: "2026-07-25T11:00:00.000Z" }),
    course({ id: "oldest", title: "Cours sans progression", subjectId: "missing-subject", grade: "2nde", pageCount: 1, updatedAt: "2026-07-24T10:00:00.000Z" }),
    course({ id: "deleted-between-list-and-detail", title: "Supprimé", updatedAt: "2026-07-25T09:00:00.000Z" }),
  ];
  const details = new Map<string, CourseDetail | null>([
    [
      "newest",
      detail({
        course: courses[0],
        subject: subject({ id: "subject-svt", name: "SVT", icon: "leaf", color: "#2E7D70" }),
        progressRows: [
          progress({ conceptId: "concept-mastered", status: "mastered", score: 100 }),
          progress({ conceptId: "concept-progressing", status: "in_progress", score: 50 }),
          progress({ conceptId: "concept-work", status: "needs_reinforcement", score: 20 }),
        ],
      }),
    ],
    ["oldest", detail({ course: courses[2], subject: null, progressRows: [] })],
    ["deleted-between-list-and-detail", null],
  ]);
  const service = createCoursesListViewService({
    courses: {
      findAll: async () => courses,
      findDetailById: async (id) => details.get(id) ?? null,
    },
  });

  const items = await service.loadCoursesList();

  assert.deepEqual(items.map((item) => item.id), ["newest", "oldest"], "liste triée par updatedAt décroissant sans archivé ni cours disparu");
  assert.equal(items[0].title, "SVT réelle", "titre réel conservé");
  assert.equal(items[0].subject, "SVT", "matière réelle chargée");
  assert.equal(items[0].iconName, "leaf", "icône matière réelle chargée");
  assert.equal(items[0].subjectColor, "#2E7D70", "couleur matière réelle chargée");
  assert.equal(items[0].pageCount, 3, "pageCount conservé depuis le cours");
  assert.equal(items[0].masteredCount, 1, "compteur maîtrisé réel");
  assert.equal(items[0].progressingCount, 1, "compteur en progression réel");
  assert.equal(items[0].needsWorkCount, 1, "compteur à renforcer réel");
  assert.equal(items[0].notStartedCount, 0, "compteur non commencé réel");
  assert.equal(items[0].lastReviewedAt, null, "dernière révision conservée");
  assert.equal(items[0].progress, 57, "progression réelle moyenne arrondie");
  assert.equal(items[1].subject, "Matière inconnue", "fallback matière absent");
  assert.equal(items[1].iconName, "book-open", "fallback icône matière absent");
  assert.equal(items[1].subjectColor, null, "fallback couleur matière absent");
  assert.equal(items[1].progress, 0, "progression zéro sans progression");
  assert.equal(items[1].masteredCount + items[1].progressingCount + items[1].needsWorkCount, 0, "compteurs maîtrisé/progression/renfort zéro sans progression");
  assert.deepEqual(buildCourseGradeFilters(items), ["Tous", "1ère", "2nde"], "filtres issus des vraies classes");
  assert.deepEqual(buildCourseGradeFilters([]), ["Tous"], "filtre Tous seul sans cours");
  assert.equal(items.some((item) => item.id.startsWith("demo-")), false, "aucune donnée de démonstration");

  console.log("courses list view tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

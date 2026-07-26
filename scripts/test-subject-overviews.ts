import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { ConceptProgress, Course, CourseDetail, Subject } from "../src/db";
import { buildSubjectGradeFilters, createSubjectOverviewService } from "../src/features/subjects";

const now = "2026-07-26T00:00:00.000Z";

function subject(input: Partial<Subject> = {}): Subject {
  return {
    id: "subject-math",
    name: "Mathématiques",
    icon: "square-root-alt",
    color: "#2E7D70",
    isDefault: true,
    createdAt: now,
    ...input,
  };
}

function course(input: Partial<Course> = {}): Course {
  return {
    id: "course-1",
    subjectId: "subject-math",
    title: "Chapitre 1",
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

function detail(sourceCourse: Course, progressRows: ConceptProgress[] = []): CourseDetail {
  return {
    course: sourceCourse,
    subject: subject({ id: sourceCourse.subjectId, name: sourceCourse.subjectId === "subject-svt" ? "SVT" : "Mathématiques" }),
    pages: [],
    concepts: progressRows.map((row, index) => ({
      id: row.conceptId,
      courseId: sourceCourse.id,
      name: index === 0 ? "Mitose" : "Probabilité",
      description: null,
      orderIndex: index,
      createdAt: now,
      progress: row,
    })),
    latestAnalysis: null,
    latestRevisionSheet: null,
  };
}

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  const subjects = [
    subject(),
    subject({ id: "subject-svt", name: "SVT", icon: "leaf", color: "#D94B24" }),
    subject({ id: "subject-empty", name: "Sans cours" }),
  ];
  const courses = [
    course({ id: "math-new", subjectId: "subject-math", title: "Fonctions", grade: "2nde", updatedAt: "2026-07-26T10:00:00.000Z", lastReviewedAt: "2026-07-26T11:00:00.000Z" }),
    course({ id: "math-old", subjectId: "subject-math", title: "Vecteurs", grade: "1ère", updatedAt: "2026-07-25T10:00:00.000Z" }),
    course({ id: "svt-new", subjectId: "subject-svt", title: "Cellule", grade: "2nde", updatedAt: "2026-07-27T10:00:00.000Z" }),
    course({ id: "archived", subjectId: "subject-svt", title: "Archivé", status: "archived", updatedAt: "2026-07-28T10:00:00.000Z" }),
  ];
  const details = new Map<string, CourseDetail>([
    [
      "math-new",
      detail(courses[0], [
        progress({ conceptId: "m1", status: "mastered", score: 100 }),
        progress({ conceptId: "m2", status: "needs_reinforcement", score: 20, updatedAt: "2026-07-26T09:00:00.000Z" }),
      ]),
    ],
    ["math-old", detail(courses[1], [])],
    ["svt-new", detail(courses[2], [progress({ conceptId: "s1", status: "in_progress", score: 60 })])],
  ]);
  const service = createSubjectOverviewService({
    subjects: {
      findAll: async () => subjects,
      findById: async (id) => subjects.find((row) => row.id === id) ?? null,
    },
    courses: {
      findAll: async () => courses,
      findAllBySubject: async (subjectId) => courses.filter((row) => row.subjectId === subjectId),
      findDetailById: async (id) => details.get(id) ?? null,
    },
  });

  const overviews = await service.loadSubjectOverviews();
  assert.deepEqual(overviews.map((item) => item.id), ["subject-svt", "subject-math"], "matières triées par activité récente et sans matière vide");
  assert.equal(overviews.some((item) => item.id === "subject-empty"), false, "matières sans cours exclues");
  assert.equal(overviews.some((item) => item.id === "archived"), false, "cours archivés jamais exposés comme matière");

  const math = overviews.find((item) => item.id === "subject-math");
  assert.ok(math, "matière avec plusieurs chapitres présente");
  assert.equal(math.chapterCount, 2, "chapterCount agrège plusieurs cours");
  assert.equal(math.progress, 60, "progression matière agrège toutes les notions actives");
  assert.equal(math.masteredCount, 1, "notions maîtrisées agrégées");
  assert.equal(math.needsWorkCount, 1, "notions à renforcer agrégées");
  assert.equal(math.notStartedCount, 0, "notions non commencées agrégées");
  assert.equal(math.mainWeakness, "Probabilité", "principale notion à renforcer détectée");
  assert.equal(math.lastReviewedAt, "2026-07-26T11:00:00.000Z", "dernière révision la plus récente");
  assert.deepEqual(math.grades, ["1ère", "2nde"], "classes agrégées par matière");

  const svt = overviews.find((item) => item.id === "subject-svt");
  assert.ok(svt, "matière avec un chapitre présente");
  assert.equal(svt.chapterCount, 1, "une matière avec un chapitre reste une matière");
  assert.equal(svt.progress, 60, "progression d'un seul chapitre conservée");
  assert.equal(svt.progressingCount, 1, "notion en progression agrégée");

  const noProgressService = createSubjectOverviewService({
    subjects: {
      findAll: async () => [subject()],
      findById: async () => subject(),
    },
    courses: {
      findAll: async () => [course()],
      findAllBySubject: async () => [course()],
      findDetailById: async (id) => detail(course({ id }), []),
    },
  });
  assert.equal((await noProgressService.loadSubjectOverviews())[0]?.progress, 0, "progression absente = 0");

  const detailView = await service.loadSubjectDetail("subject-math");
  assert.equal(detailView?.subject.id, "subject-math", "détail matière chargé par subjectId");
  assert.deepEqual(detailView?.chapters.map((item) => item.id), ["math-new", "math-old"], "détail liste les vrais courseId");
  assert.equal(detailView?.chapters[0]?.title, "Fonctions", "chapitre réel affichable");
  assert.equal(await service.loadSubjectDetail("missing"), null, "matière introuvable représentée");
  assert.deepEqual(buildSubjectGradeFilters(overviews), ["Tous", "1ère", "2nde"], "filtres de classe issus des matières avec cours");

  const coursesScreen = read("src/app/(tabs)/courses.tsx");
  const homeScreen = read("src/app/(tabs)/index.tsx");
  const subjectScreen = read("src/app/subject/[subjectId]/index.tsx");
  assert.doesNotMatch(coursesScreen, /CourseCard|openCourse|\/course\/\[courseId\]/, "Mes cours n'ouvre plus un cours individuel");
  assert.doesNotMatch(homeScreen, /CourseCard|openCourse|recentCourses/, "Accueil n'affiche plus des cours individuels");
  assert.match(coursesScreen + homeScreen, /\/subject\/\[subjectId\]/, "navigation vers subjectId présente");
  assert.match(subjectScreen, /\/course\/\[courseId\]/, "chapitre ouvre le vrai courseId");
  assert.doesNotMatch(coursesScreen + homeScreen + subjectScreen, /demoCourse|demoCourses|demo-data/, "aucun fallback démo dans la hiérarchie matières");
  assert.doesNotMatch(read("src/db/schema/index.ts") + read("src/db/migrations/migrations.js"), /SubjectOverviewItem/, "aucun changement de schéma pour la vue matière");

  console.log("subject overviews tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

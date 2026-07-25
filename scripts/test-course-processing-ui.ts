import assert from "node:assert/strict";
import type { Concept, Course, CourseAnalysis, CourseDetail, CoursePage, Exercise, RevisionSheet, StudySession, Subject } from "../src/db";
import {
  createCourseProcessingController,
  type CourseProcessingDeps,
  type CourseProcessingSnapshot,
} from "../src/features/course-processing/services/course-processing.controller";
import { AllCoursePagesAnalysisFailedError, type MultiPageCourseAnalysis } from "../src/features/course-analysis";
import { parseRevisionSheetContent } from "../src/features/revision-sheet/services/revision-sheet-view.service";
import { toSessionExercise } from "../src/features/study-session/utils/real-session-exercise";

const now = "2026-07-25T00:00:00.000Z";

function course(input: Partial<Course> = {}): Course {
  return {
    id: "course-1",
    subjectId: "subject-1",
    title: "Fonctions",
    grade: "2nde",
    status: "draft",
    summary: null,
    pageCount: 2,
    lastReviewedAt: null,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

function subject(): Subject {
  return { id: "subject-1", name: "Mathématiques", icon: "calculator", color: "#D94B24", isDefault: false, createdAt: now };
}

function concept(input: Partial<Concept> = {}): Concept {
  return { id: "concept-1", courseId: "course-1", name: "Fonction affine", description: null, orderIndex: 0, createdAt: now, ...input };
}

function analysis(input: Partial<CourseAnalysis> = {}): CourseAnalysis {
  return {
    id: "analysis-1",
    courseId: "course-1",
    detectedTitle: "Fonctions",
    detectedSubject: "Mathématiques",
    detectedLevel: "2nde",
    rawJson: "{}",
    confidence: 0.8,
    validatedByUser: true,
    createdAt: now,
    ...input,
  };
}

function page(index: number): CoursePage {
  return {
    id: `page-${index}`,
    courseId: "course-1",
    localUri: `data:image/png;base64,page-${index}`,
    thumbnailUri: null,
    pageIndex: index,
    rotation: 0,
    qualityStatus: "good",
    createdAt: now,
  };
}

function sheet(input: Partial<RevisionSheet> = {}): RevisionSheet {
  return {
    id: "sheet-1",
    courseId: "course-1",
    title: "Fiche",
    summary: "Résumé",
    contentJson: JSON.stringify({
      title: "Fiche",
      summary: "Résumé",
      keyConcepts: ["Fonction affine"],
      definitions: ["Définition"],
      formulas: [],
      examples: ["Exemple"],
      commonMistakes: ["Erreur"],
      importantPoints: ["Point"],
    }),
    version: 1,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
}

function exercise(input: Partial<Exercise> = {}): Exercise {
  return {
    id: "exercise-1",
    courseId: "course-1",
    conceptId: "concept-1",
    type: "multiple_choice",
    question: "Quelle est la forme ?",
    expectedAnswer: "f(x)=ax+b",
    optionsJson: JSON.stringify(["f(x)=ax+b", "f(x)=x²"]),
    hint: "Cherche a et b.",
    explanation: "Une fonction affine s'écrit ax+b.",
    difficulty: 1,
    generatedFromWeakness: false,
    createdAt: now,
    ...input,
  };
}

function multiPageAnalysis(input: Partial<MultiPageCourseAnalysis> = {}): MultiPageCourseAnalysis {
  return {
    detectedTitle: "Fonctions",
    detectedSubject: "Mathématiques",
    detectedLevel: "2nde",
    concepts: [{ name: "Fonction affine", description: null, sourcePageIndexes: [0] }],
    definitions: ["Définition"],
    formulas: [],
    examples: [],
    dates: [],
    keywords: ["fonction"],
    summary: "Résumé de l'analyse.",
    warnings: [],
    confidence: 0.8,
    successfulPageCount: 2,
    failedPageCount: 0,
    pageResults: [],
    inconsistencies: [],
    ...input,
  };
}

function detail(input: Partial<CourseDetail> = {}): CourseDetail {
  return {
    course: course(),
    subject: subject(),
    pages: [page(0), page(1)],
    concepts: [],
    latestAnalysis: null,
    latestRevisionSheet: null,
    ...input,
  };
}

function deps(input: {
  detail?: CourseDetail | null;
  pages?: CoursePage[];
  analysisResult?: MultiPageCourseAnalysis;
  analysisError?: unknown;
  sheetError?: unknown;
  exercisesError?: unknown;
} = {}) {
  const snapshots: CourseProcessingSnapshot[] = [];
  const dependency: CourseProcessingDeps = {
    courses: { findDetailById: async () => input.detail ?? detail() },
    pages: {
      findAllByCourse: async () => input.pages ?? [page(0), page(1)],
      prepare: async (coursePage) => ({ pageId: coursePage.id, pageIndex: coursePage.pageIndex, imageBase64: "ZmFrZS1wYWdl", mimeType: "image/png" }),
    },
    analysis: {
      analyzeCoursePages: async (_payload, onPageDone) => {
        onPageDone();
        onPageDone();
        if (input.analysisError) {
          throw input.analysisError;
        }
        return input.analysisResult ?? multiPageAnalysis();
      },
      persistCourseAnalysis: async () => ({ analysis: analysis(), concepts: [concept()] }),
    },
    generation: {
      generateRevisionSheet: async () => {
        if (input.sheetError) {
          throw input.sheetError;
        }
        return { sheet: sheet() };
      },
      generateExercises: async () => {
        if (input.exercisesError) {
          throw input.exercisesError;
        }
        return { exercises: [exercise(), exercise({ id: "exercise-2" }), exercise({ id: "exercise-3" })] };
      },
    },
  };
  const controller = createCourseProcessingController("course-1", dependency);
  controller.subscribe((snapshot) => snapshots.push(snapshot));
  return { controller, snapshots };
}

async function main() {
  const withoutPages = deps({ pages: [] });
  await assert.rejects(() => withoutPages.controller.startProcessing(), /COURSE_WITHOUT_PAGES/, "cours sans page refusé");
  assert.equal(withoutPages.snapshots.at(-1)?.status, "error", "erreur cours sans page");

  const successful = deps();
  const analyzed = await successful.controller.startProcessing();
  assert.equal(analyzed.detectedTitle, "Fonctions", "analyse réussie");
  assert.equal(successful.snapshots.some((snapshot) => snapshot.status === "analyzing"), true, "étape analyzing visible");
  assert.equal(successful.snapshots.at(-1)?.pendingAnalysis?.summary, "Résumé de l'analyse.", "analyse en attente de confirmation");
  assert.equal(successful.snapshots.at(-1)?.progress.currentPage, 2, "progression des pages");
  await successful.controller.confirmAndContinue();
  assert.equal(successful.snapshots.some((snapshot) => snapshot.status === "persisting"), true, "confirmation et persistance");
  assert.equal(successful.snapshots.some((snapshot) => snapshot.status === "generating_sheet"), true, "génération fiche");
  assert.equal(successful.snapshots.some((snapshot) => snapshot.status === "generating_exercises"), true, "génération exercices");
  assert.equal(successful.snapshots.at(-1)?.status, "completed", "état final");

  const partial = deps({ analysisResult: multiPageAnalysis({ failedPageCount: 1, warnings: ["Page 2 floue."] }) });
  await partial.controller.startProcessing();
  assert.deepEqual(partial.snapshots.at(-1)?.result.warnings, ["Page 2 floue.", "1 page(s) non analysée(s)."], "analyse partielle avertie");

  const failed = deps({ analysisError: new AllCoursePagesAnalysisFailedError([]) });
  await assert.rejects(() => failed.controller.startProcessing(), AllCoursePagesAnalysisFailedError, "analyse totalement échouée");

  const sheetFailure = deps({ sheetError: new Error("SHEET_FAIL") });
  await sheetFailure.controller.startProcessing();
  await assert.rejects(() => sheetFailure.controller.confirmAndContinue(), /SHEET_FAIL/, "échec fiche");
  const exercisesFailure = deps({
    detail: detail({ course: course({ status: "ready", summary: "Résumé" }), latestAnalysis: analysis(), latestRevisionSheet: sheet(), concepts: [{ ...concept(), progress: null }] }),
    exercisesError: new Error("EXERCISES_FAIL"),
  });
  await assert.rejects(() => exercisesFailure.controller.generateAssetsFromPersisted(), /EXERCISES_FAIL/, "échec exercices sans appel Gemini réel");

  assert.equal(parseRevisionSheetContent(sheet()).status, "ready", "fiche réelle affichable");
  assert.equal(parseRevisionSheetContent(sheet({ contentJson: "{bad" })).status, "invalid", "fiche invalide gérée");

  const mapped = toSessionExercise(exercise(), "Fonction affine");
  assert.equal(mapped.type, "multiple-choice", "exercice réel adapté à l'écran session");
  assert.deepEqual(mapped.options, ["f(x)=ax+b", "f(x)=x²"], "options réelles chargées");

  const session: StudySession = {
    id: "session-1",
    courseId: "course-1",
    type: "initial",
    status: "active",
    currentExerciseIndex: 0,
    startedAt: now,
    completedAt: null,
    durationSeconds: 0,
    createdAt: now,
  };
  assert.equal(session.type, "initial", "session réelle initiale représentée");

  console.log("course processing ui tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

import assert from "node:assert/strict";
import type { Concept, Course, CourseAnalysis, CourseDetail, CoursePage, Exercise, RevisionSheet, StudySession, Subject } from "../src/db";
import {
  createCourseProcessingController,
  type CourseProcessingDeps,
  type CourseProcessingSnapshot,
} from "../src/features/course-processing/services/course-processing.controller";
import { AllCoursePagesAnalysisFailedError, type CoursePageAnalysis, type MultiPageCourseAnalysis } from "../src/features/course-analysis";
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

function pageAnalysis(input: Partial<CoursePageAnalysis> = {}): CoursePageAnalysis {
  return {
    detectedTitle: "Fonctions",
    detectedSubject: "Mathématiques",
    detectedLevel: "2nde",
    concepts: [{ name: "Fonction affine", description: "Forme ax+b" }],
    definitions: ["Définition"],
    formulas: [],
    examples: [],
    dates: [],
    keywords: ["fonction"],
    partialSummary: "Résumé de page.",
    warnings: [],
    confidence: 0.8,
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
  holdAnalysis?: boolean;
  holdExercises?: boolean;
} = {}) {
  const snapshots: CourseProcessingSnapshot[] = [];
  let releaseAnalysis: (() => void) | null = null;
  let releaseExercises: (() => void) | null = null;
  let analysisCalls = 0;
  let exerciseCalls = 0;
  const dependency: CourseProcessingDeps = {
    courses: { findDetailById: async () => input.detail ?? detail() },
    pages: {
      findAllByCourse: async () => input.pages ?? [page(0), page(1)],
      prepare: async (coursePage) => ({ pageId: coursePage.id, pageIndex: coursePage.pageIndex, imageBase64: "ZmFrZS1wYWdl", mimeType: "image/png" }),
    },
    analysis: {
      analyzeCoursePages: async (payload, callbacks) => {
        analysisCalls += 1;
        if (input.holdAnalysis) {
          await new Promise<void>((resolve) => {
            releaseAnalysis = resolve;
          });
        }
        for (const pageInput of payload.pages) {
          callbacks.onPageAttempt({ pageIndex: pageInput.pageIndex, attemptNumber: 1, maxAttempts: 2, retryReason: null });
          callbacks.onPageAttemptDone({ pageIndex: pageInput.pageIndex, attemptNumber: 1, durationMs: 10, errorCode: null, httpStatus: null });
          callbacks.onPageDone({
            pageId: pageInput.pageId ?? null,
            pageIndex: pageInput.pageIndex,
            status: "success",
            analysis: pageAnalysis(),
            errorCode: null,
            errorMessage: null,
            attemptsCount: 1,
          });
        }
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
        exerciseCalls += 1;
        if (input.holdExercises) {
          await new Promise<void>((resolve) => {
            releaseExercises = resolve;
          });
        }
        if (input.exercisesError) {
          throw input.exercisesError;
        }
        return { exercises: [exercise(), exercise({ id: "exercise-2" }), exercise({ id: "exercise-3" })] };
      },
    },
  };
  const controller = createCourseProcessingController("course-1", dependency);
  controller.subscribe((snapshot) => snapshots.push(snapshot));
  return {
    controller,
    snapshots,
    get analysisCalls() {
      return analysisCalls;
    },
    get exerciseCalls() {
      return exerciseCalls;
    },
    releaseAnalysis: () => releaseAnalysis?.(),
    releaseExercises: () => releaseExercises?.(),
  };
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
  assert.equal(successful.snapshots.at(-1)?.progress.processedPages, 2, "pages traitées séparées des tentatives");
  await successful.controller.confirmAndContinue();
  assert.equal(successful.snapshots.some((snapshot) => snapshot.status === "persisting"), true, "confirmation et persistance");
  assert.equal(successful.snapshots.some((snapshot) => snapshot.status === "generating_sheet"), true, "génération fiche");
  assert.equal(successful.snapshots.some((snapshot) => snapshot.status === "generating_exercises"), true, "génération exercices");
  assert.equal(successful.snapshots.at(-1)?.status, "completed", "état final");

  const onePageDoubleNotification = deps({
    detail: detail({ course: course({ pageCount: 1 }), pages: [page(0)] }),
    pages: [page(0)],
    analysisResult: multiPageAnalysis({ successfulPageCount: 1 }),
  });
  await onePageDoubleNotification.controller.startProcessing();
  assert.equal(onePageDoubleNotification.snapshots.at(-1)?.progress.currentPage, 1, "progression bornée au nombre de pages");
  assert.equal(onePageDoubleNotification.snapshots.at(-1)?.progress.totalPages, 1, "total de pages conservé");

  const onePageAttempt = deps({
    detail: detail({ course: course({ pageCount: 1 }), pages: [page(0)] }),
    pages: [page(0)],
    analysisResult: multiPageAnalysis({ successfulPageCount: 1 }),
  });
  await onePageAttempt.controller.startProcessing();
  assert.equal(onePageAttempt.snapshots.some((snapshot) => snapshot.progress.attemptNumber === 1), true, "tentative IA visible séparément");
  assert.equal(
    onePageAttempt.snapshots.every((snapshot) => snapshot.progress.currentPage <= snapshot.progress.totalPages),
    true,
    "les tentatives ne gonflent jamais le compteur de pages",
  );

  const doubleStart = deps({ holdAnalysis: true });
  const firstStart = doubleStart.controller.startProcessing();
  const secondStart = doubleStart.controller.startProcessing();
  await new Promise((resolve) => setTimeout(resolve, 0));
  doubleStart.releaseAnalysis();
  await Promise.all([firstStart, secondStart]);
  assert.equal(doubleStart.analysisCalls, 1, "double clic analyse ignoré pendant un traitement actif");

  const partial = deps({ analysisResult: multiPageAnalysis({ failedPageCount: 1, warnings: ["Page 2 floue."] }) });
  await partial.controller.startProcessing();
  assert.deepEqual(partial.snapshots.at(-1)?.result.warnings, ["Page 2 floue.", "1 page(s) non analysée(s)."], "analyse partielle avertie");

  const failed = deps({ analysisError: new AllCoursePagesAnalysisFailedError([]) });
  await assert.rejects(() => failed.controller.startProcessing(), AllCoursePagesAnalysisFailedError, "analyse totalement échouée");

  const keyMissing = deps({
    analysisError: new AllCoursePagesAnalysisFailedError([
      {
        pageId: "page-0",
        pageIndex: 0,
        status: "failed",
        analysis: null,
        errorCode: "COURSE_ANALYSIS_KEY_MISSING",
        errorMessage: "CoursePageAnalysisKeyMissingError",
        attemptsCount: 1,
      },
    ]),
  });
  await assert.rejects(() => keyMissing.controller.startProcessing(), AllCoursePagesAnalysisFailedError, "erreur clé propagée");
  assert.equal(keyMissing.snapshots.at(-1)?.error, "Configure ta clé Gemini avant de lancer l'analyse.", "erreur IA non masquée en page illisible");

  const sheetFailure = deps({ sheetError: new Error("SHEET_FAIL") });
  await sheetFailure.controller.startProcessing();
  await assert.rejects(() => sheetFailure.controller.confirmAndContinue(), /SHEET_FAIL/, "échec fiche");
  const exercisesFailure = deps({
    detail: detail({ course: course({ status: "ready", summary: "Résumé" }), latestAnalysis: analysis(), latestRevisionSheet: sheet(), concepts: [{ ...concept(), progress: null }] }),
    exercisesError: new Error("EXERCISES_FAIL"),
  });
  await assert.rejects(() => exercisesFailure.controller.generateAssetsFromPersisted(), /EXERCISES_FAIL/, "échec exercices sans appel Gemini réel");
  assert.equal(exercisesFailure.analysisCalls, 0, "aucune nouvelle analyse image pendant génération exercices persistée");

  const exercisesAfterConfirmation = deps({ exercisesError: new Error("EXERCISES_FAIL") });
  await exercisesAfterConfirmation.controller.startProcessing();
  await assert.rejects(() => exercisesAfterConfirmation.controller.confirmAndContinue(), /EXERCISES_FAIL/, "échec exercices après confirmation");
  assert.equal(exercisesAfterConfirmation.snapshots.at(-1)?.pendingAnalysis, null, "confirmer masqué après persistance");
  assert.equal(exercisesAfterConfirmation.snapshots.at(-1)?.result.revisionSheet?.id, "sheet-1", "fiche conservée après échec exercices");
  assert.equal(exercisesAfterConfirmation.analysisCalls, 1, "analyse initiale unique");
  await assert.rejects(() => exercisesAfterConfirmation.controller.retry(), /EXERCISES_FAIL/, "retry relance uniquement exercices");
  assert.equal(exercisesAfterConfirmation.analysisCalls, 1, "retry exercices sans nouvelle analyse image");
  assert.equal(exercisesAfterConfirmation.exerciseCalls, 2, "retry appelle les exercices une fois de plus");

  const doubleExercises = deps({
    detail: detail({ course: course({ status: "ready", summary: "Résumé" }), latestAnalysis: analysis(), latestRevisionSheet: sheet(), concepts: [{ ...concept(), progress: null }] }),
    holdExercises: true,
  });
  const firstExercises = doubleExercises.controller.generateAssetsFromPersisted();
  const secondExercises = doubleExercises.controller.generateAssetsFromPersisted();
  await new Promise((resolve) => setTimeout(resolve, 0));
  doubleExercises.releaseExercises();
  await Promise.all([firstExercises, secondExercises]);
  assert.equal(doubleExercises.exerciseCalls, 1, "double clic génération exercices bloqué");

  assert.equal(parseRevisionSheetContent(sheet()).status, "ready", "fiche réelle affichable");
  assert.equal(parseRevisionSheetContent(sheet({ contentJson: "{bad" })).status, "invalid", "fiche invalide gérée");

  const mapped = toSessionExercise(exercise(), "Fonction affine");
  assert.equal(mapped.type, "multiple_choice", "exercice réel adapté à l'écran session avec type SQLite exact");
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

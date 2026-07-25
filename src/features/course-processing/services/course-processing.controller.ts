import type { CourseAnalysis, CourseDetail, CoursePage, RevisionSheet, Concept, Exercise } from "@/src/db";
import type { AnalyzeCoursePagesInput, MultiPageCourseAnalysis } from "@/src/features/course-analysis";
import { AllCoursePagesAnalysisFailedError } from "@/src/features/course-analysis";

export type CourseProcessingStatus =
  | "idle"
  | "analyzing"
  | "persisting"
  | "generating_sheet"
  | "generating_exercises"
  | "completed"
  | "error";

export type CourseProcessingProgress = {
  currentPage: number;
  totalPages: number;
  percent: number;
  message: string;
};

export type CourseProcessingResult = {
  analysis: MultiPageCourseAnalysis | null;
  persistedAnalysis: CourseAnalysis | null;
  concepts: Concept[];
  revisionSheet: RevisionSheet | null;
  exercises: Exercise[];
  warnings: string[];
};

export type CourseProcessingSnapshot = {
  status: CourseProcessingStatus;
  progress: CourseProcessingProgress;
  error: string | null;
  result: CourseProcessingResult;
  detail: CourseDetail | null;
  pendingAnalysis: MultiPageCourseAnalysis | null;
};

export type CourseProcessingDeps = {
  courses: {
    findDetailById: (courseId: string) => Promise<CourseDetail | null>;
  };
  pages: {
    findAllByCourse: (courseId: string) => Promise<CoursePage[]>;
    prepare: (page: CoursePage) => Promise<AnalyzeCoursePagesInput["pages"][number]>;
  };
  analysis: {
    analyzeCoursePages: (input: AnalyzeCoursePagesInput, onPageDone: () => void) => Promise<MultiPageCourseAnalysis>;
    persistCourseAnalysis: (input: {
      courseId: string;
      analysis: MultiPageCourseAnalysis;
      title?: string | null;
      subjectId?: string | null;
      grade?: string | null;
    }) => Promise<{ analysis: CourseAnalysis; concepts: Concept[] }>;
  };
  generation: {
    generateRevisionSheet: (courseId: string) => Promise<{ sheet: RevisionSheet }>;
    generateExercises: (courseId: string) => Promise<{ exercises: Exercise[] }>;
  };
};

const initialProgress: CourseProcessingProgress = {
  currentPage: 0,
  totalPages: 0,
  percent: 0,
  message: "Prêt",
};

function emptyResult(): CourseProcessingResult {
  return {
    analysis: null,
    persistedAnalysis: null,
    concepts: [],
    revisionSheet: null,
    exercises: [],
    warnings: [],
  };
}

function userMessage(error: unknown) {
  if (error instanceof AllCoursePagesAnalysisFailedError) {
    const codes = new Set(error.pageErrorCodes.map((item) => item.errorCode).filter(Boolean));
    if (codes.has("COURSE_ANALYSIS_KEY_MISSING")) {
      return "Configure ta clé Gemini avant de lancer l'analyse.";
    }
    if (codes.has("COURSE_ANALYSIS_KEY_INVALID")) {
      return "La clé Gemini configurée est invalide.";
    }
    if (codes.has("COURSE_ANALYSIS_MODEL_UNAVAILABLE")) {
      return "Le modèle IA configuré n'est pas disponible.";
    }
    if (codes.has("COURSE_ANALYSIS_QUOTA_EXCEEDED")) {
      return "Quota Gemini dépassé. Réessaie plus tard.";
    }
    if (codes.has("COURSE_ANALYSIS_TIMEOUT")) {
      return "La demande IA a expiré. Réessaie.";
    }
    if (codes.has("COURSE_ANALYSIS_PROVIDER_UNAVAILABLE") || codes.has("COURSE_ANALYSIS_JSON_INVALID") || codes.has("COURSE_ANALYSIS_SCHEMA_INVALID")) {
      return "L'analyse IA a échoué. Réessaie avec une image plus nette ou relance plus tard.";
    }
    return "Toutes les pages sont illisibles ou n'ont pas pu être analysées.";
  }
  if (error instanceof Error && error.name.includes("GeminiApiKeyMissing")) {
    return "Configure ta clé Gemini avant de lancer l'analyse.";
  }
  if (error instanceof Error && error.name.includes("GeminiApiKeyInvalid")) {
    return "La clé Gemini configurée est invalide.";
  }
  if (error instanceof Error && "code" in error && typeof error.code === "string") {
    if (error.code.includes("RATE_LIMIT") || error.code.includes("QUOTA")) {
      return "Quota Gemini dépassé. Réessaie plus tard.";
    }
    if (error.code.includes("TIMEOUT")) {
      return "La demande IA a expiré. Réessaie.";
    }
    if (error.code.includes("NO_COURSE_PAGES") || error.code.includes("IMAGE")) {
      return "Ce cours n'a pas encore de pages exploitables.";
    }
    if (error.code.includes("INVALID")) {
      return "La sortie IA est invalide. Réessaie.";
    }
    if (error.code.includes("PERSISTENCE") || error.code.includes("FAILED")) {
      return "Impossible d'enregistrer le résultat.";
    }
  }
  if (error instanceof Error && error.message === "COURSE_WITHOUT_PAGES") {
    return "Ce cours ne contient aucune page à analyser.";
  }
  return "Une erreur est survenue pendant le traitement.";
}

export function createCourseProcessingController(courseId: string, deps: CourseProcessingDeps) {
  let snapshot: CourseProcessingSnapshot = {
    status: "idle",
    progress: initialProgress,
    error: null,
    result: emptyResult(),
    detail: null,
    pendingAnalysis: null,
  };
  const listeners = new Set<(snapshot: CourseProcessingSnapshot) => void>();
  let lastFailedAction: "analysis" | "sheet" | "exercises" | null = null;

  function emit(next: Partial<CourseProcessingSnapshot>) {
    snapshot = { ...snapshot, ...next };
    listeners.forEach((listener) => listener(snapshot));
  }

  function setProgress(progress: Partial<CourseProcessingProgress>) {
    emit({ progress: { ...snapshot.progress, ...progress } });
  }

  async function refreshDetail() {
    const detail = await deps.courses.findDetailById(courseId);
    emit({ detail });
    return detail;
  }

  async function startProcessing() {
    lastFailedAction = null;
    emit({
      status: "analyzing",
      error: null,
      pendingAnalysis: null,
      progress: { currentPage: 0, totalPages: 0, percent: 0, message: "Préparation des pages" },
    });

    try {
      const detail = await refreshDetail();
      if (!detail) {
        throw new Error("COURSE_NOT_FOUND");
      }
      const pages = await deps.pages.findAllByCourse(courseId);
      if (pages.length === 0) {
        throw new Error("COURSE_WITHOUT_PAGES");
      }
      setProgress({ totalPages: pages.length, message: "Lecture des pages" });
      const preparedPages = [];
      for (const page of pages) {
        preparedPages.push(await deps.pages.prepare(page));
      }
      let completedPages = 0;
      const analysis = await deps.analysis.analyzeCoursePages(
        {
          courseId,
          pages: preparedPages,
          knownSubject: detail.subject?.name ?? null,
          knownGrade: detail.course.grade,
        },
        () => {
          completedPages = Math.min(pages.length, completedPages + 1);
          setProgress({
            currentPage: completedPages,
            totalPages: pages.length,
            percent: Math.round((completedPages / pages.length) * 40),
            message: `Analyse des pages ${completedPages}/${pages.length}`,
          });
        },
      );
      const warnings = analysis.warnings.length > 0 || analysis.failedPageCount > 0
        ? [...analysis.warnings, ...(analysis.failedPageCount > 0 ? [`${analysis.failedPageCount} page(s) non analysée(s).`] : [])]
        : [];
      emit({
        status: "idle",
        pendingAnalysis: analysis,
        result: { ...snapshot.result, analysis, warnings },
        progress: { currentPage: pages.length, totalPages: pages.length, percent: 45, message: "Analyse prête à confirmer" },
      });
      return analysis;
    } catch (error) {
      lastFailedAction = "analysis";
      emit({ status: "error", error: userMessage(error) });
      throw error;
    }
  }

  async function confirmAndContinue() {
    if (!snapshot.pendingAnalysis) {
      return null;
    }
    try {
      emit({ status: "persisting", error: null, progress: { ...snapshot.progress, percent: 55, message: "Enregistrement de l'analyse" } });
      const detail = snapshot.detail ?? await refreshDetail();
      const persisted = await deps.analysis.persistCourseAnalysis({
        courseId,
        analysis: snapshot.pendingAnalysis,
        title: snapshot.pendingAnalysis.detectedTitle,
        subjectId: detail?.course.subjectId ?? null,
        grade: snapshot.pendingAnalysis.detectedLevel ?? detail?.course.grade ?? null,
      });

      emit({
        status: "generating_sheet",
        result: {
          ...snapshot.result,
          persistedAnalysis: persisted.analysis,
          concepts: persisted.concepts,
        },
        progress: { ...snapshot.progress, percent: 70, message: "Génération de la fiche" },
      });
      const revisionSheet = await deps.generation.generateRevisionSheet(courseId);

      emit({
        status: "generating_exercises",
        result: { ...snapshot.result, revisionSheet: revisionSheet.sheet },
        progress: { ...snapshot.progress, percent: 85, message: "Génération des exercices" },
      });
      const exercises = await deps.generation.generateExercises(courseId);

      emit({
        status: "completed",
        pendingAnalysis: null,
        result: { ...snapshot.result, exercises: exercises.exercises },
        progress: { ...snapshot.progress, percent: 100, message: "Cours prêt à réviser" },
      });
      await refreshDetail();
      return snapshot.result;
    } catch (error) {
      lastFailedAction = snapshot.result.revisionSheet ? "exercises" : "sheet";
      emit({ status: "error", error: userMessage(error) });
      throw error;
    }
  }

  async function generateAssetsFromPersisted() {
    try {
      const detail = snapshot.detail ?? await refreshDetail();
      if (!detail?.latestAnalysis) {
        throw new Error("ANALYSIS_NOT_FOUND");
      }

      let revisionSheet = snapshot.result.revisionSheet ?? detail.latestRevisionSheet;
      if (!revisionSheet) {
        emit({ status: "generating_sheet", error: null, progress: { ...snapshot.progress, percent: 70, message: "Génération de la fiche" } });
        revisionSheet = (await deps.generation.generateRevisionSheet(courseId)).sheet;
      }

      emit({
        status: "generating_exercises",
        result: { ...snapshot.result, revisionSheet },
        progress: { ...snapshot.progress, percent: 85, message: "Génération des exercices" },
      });
      const exercises = await deps.generation.generateExercises(courseId);
      emit({
        status: "completed",
        result: { ...snapshot.result, revisionSheet, exercises: exercises.exercises },
        progress: { ...snapshot.progress, percent: 100, message: "Cours prêt à réviser" },
      });
      await refreshDetail();
      return snapshot.result;
    } catch (error) {
      lastFailedAction = snapshot.result.revisionSheet || snapshot.detail?.latestRevisionSheet ? "exercises" : "sheet";
      emit({ status: "error", error: userMessage(error) });
      throw error;
    }
  }

  async function retry() {
    if (lastFailedAction === "sheet" && snapshot.pendingAnalysis) {
      return confirmAndContinue();
    }
    if (lastFailedAction === "exercises") {
      try {
        emit({ status: "generating_exercises", error: null, progress: { ...snapshot.progress, percent: 85, message: "Génération des exercices" } });
        const exercises = await deps.generation.generateExercises(courseId);
        emit({
          status: "completed",
          pendingAnalysis: null,
          result: { ...snapshot.result, exercises: exercises.exercises },
          progress: { ...snapshot.progress, percent: 100, message: "Cours prêt à réviser" },
        });
        await refreshDetail();
        return snapshot.result;
      } catch (error) {
        lastFailedAction = "exercises";
        emit({ status: "error", error: userMessage(error) });
        throw error;
      }
    }
    return startProcessing();
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: (snapshot: CourseProcessingSnapshot) => void) => {
      listeners.add(listener);
      listener(snapshot);
      return () => {
        listeners.delete(listener);
      };
    },
    refreshDetail,
    startProcessing,
    confirmAndContinue,
    generateAssetsFromPersisted,
    retry,
  };
}

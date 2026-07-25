import type { Concept, Course, CourseAnalysis, Exercise, Subject } from "@/src/db";
import type { AIService } from "@/src/services/ai/ai.service";
import { AISchemaValidationError } from "@/src/services/ai/ai.errors";
import { buildCourseExercisesPrompt } from "../prompts/course-exercises.prompt";
import { generatedExercisesSchema, type GeneratedExercise } from "../schemas/generated-exercises.schema";
import {
  ExerciseGenerationAINotConfiguredError,
  ExerciseGenerationAnalysisNotFoundError,
  ExerciseGenerationConceptsNotFoundError,
  ExerciseGenerationCourseNotFoundError,
  ExerciseGenerationCourseNotReadyError,
  ExerciseGenerationInvalidOutputError,
  ExerciseGenerationPersistenceFailedError,
} from "../errors/exercise-generation.errors";

export type ExerciseCourseData = {
  course: Course;
  subject: Subject | null;
  concepts: Concept[];
  latestAnalysis: CourseAnalysis | null;
};

type AITextGenerator = Pick<AIService, "generateStructured">;

export type GenerateCourseExercisesOptions = {
  count?: number;
};

export type PersistGeneratedExerciseInput = {
  courseId: string;
  conceptId: string;
  type: GeneratedExercise["type"];
  question: string;
  expectedAnswer: string;
  optionsJson: string | null;
  hint: string | null;
  explanation: string;
  difficulty: number;
  generatedFromWeakness: boolean;
};

export type GenerateCourseExercisesDependencies = {
  aiService: AITextGenerator | null | (() => Promise<AITextGenerator | null>);
  courses: {
    findDetailById: (courseId: string) => Promise<ExerciseCourseData | null>;
  };
  exercises: {
    findAllByCourse: (courseId: string) => Promise<Exercise[]>;
    createMany: (inputs: PersistGeneratedExerciseInput[]) => Promise<Exercise[]>;
  };
};

export type GenerateCourseExercisesResult = {
  exercises: Exercise[];
  requestedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  warnings: string[];
};

type AcceptedExercise = {
  input: PersistGeneratedExerciseInput;
  normalizedQuestion: string;
};

function clampRequestedCount(value: number | undefined) {
  if (value === undefined) {
    return 3;
  }
  if (!Number.isInteger(value) || value < 3 || value > 5) {
    throw new ExerciseGenerationInvalidOutputError();
  }
  return value;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeKey(value: string) {
  return normalizeText(value)
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeQuestion(value: string) {
  return normalizeKey(value).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function normalizeBooleanAnswer(value: string) {
  const normalized = normalizeKey(value);
  if (["vrai", "true", "1", "oui"].includes(normalized)) {
    return "vrai";
  }
  if (["faux", "false", "0", "non"].includes(normalized)) {
    return "faux";
  }
  return null;
}

async function resolveAIService(dependencies: GenerateCourseExercisesDependencies) {
  const service = typeof dependencies.aiService === "function" ? await dependencies.aiService() : dependencies.aiService;
  if (!service) {
    throw new ExerciseGenerationAINotConfiguredError();
  }
  return service;
}

function assertCourseData(courseId: string, data: ExerciseCourseData | null) {
  if (!courseId.trim() || !data) {
    throw new ExerciseGenerationCourseNotFoundError();
  }
  if (data.course.status !== "ready" || !data.subject || !data.course.grade.trim() || !data.course.summary?.trim()) {
    throw new ExerciseGenerationCourseNotReadyError();
  }
  if (!data.latestAnalysis) {
    throw new ExerciseGenerationAnalysisNotFoundError();
  }
  if (data.concepts.length === 0) {
    throw new ExerciseGenerationConceptsNotFoundError();
  }
}

function validateExerciseForPersistence(
  exercise: GeneratedExercise,
  course: Course,
  conceptsByName: Map<string, Concept>,
  seenQuestions: Set<string>,
  existingQuestions: Set<string>,
): { accepted: AcceptedExercise | null; warning: string | null } {
  const normalizedQuestion = normalizeQuestion(exercise.question);
  if (!normalizedQuestion || seenQuestions.has(normalizedQuestion) || existingQuestions.has(normalizedQuestion)) {
    return { accepted: null, warning: "question dupliquée rejetée" };
  }

  if (exercise.difficulty < 1 || exercise.difficulty > 3) {
    return { accepted: null, warning: "difficulté hors MVP rejetée" };
  }

  const concept = conceptsByName.get(normalizeKey(exercise.conceptReference));
  if (!concept) {
    return { accepted: null, warning: "concept introuvable rejeté" };
  }

  if (exercise.type === "multiple_choice") {
    const options = exercise.options ?? [];
    const distinctOptions = new Set(options.map(normalizeKey));
    if (distinctOptions.size < 2 || !distinctOptions.has(normalizeKey(exercise.expectedAnswer))) {
      return { accepted: null, warning: "QCM invalide rejeté" };
    }
  }

  if (exercise.type !== "multiple_choice" && exercise.options !== null) {
    return { accepted: null, warning: "options non QCM rejetées" };
  }

  if (exercise.type === "true_false" && !normalizeBooleanAnswer(exercise.expectedAnswer)) {
    return { accepted: null, warning: "vrai/faux invalide rejeté" };
  }

  seenQuestions.add(normalizedQuestion);
  return {
    accepted: {
      normalizedQuestion,
      input: {
        courseId: course.id,
        conceptId: concept.id,
        type: exercise.type,
        question: normalizeText(exercise.question),
        expectedAnswer: normalizeText(exercise.expectedAnswer),
        optionsJson: exercise.options ? JSON.stringify(exercise.options.map(normalizeText)) : null,
        hint: exercise.hint ? normalizeText(exercise.hint) : null,
        explanation: normalizeText(exercise.explanation),
        difficulty: exercise.difficulty,
        generatedFromWeakness: false,
      },
    },
    warning: null,
  };
}

function prepareExercisesForPersistence(
  generated: GeneratedExercise[],
  data: ExerciseCourseData & { subject: Subject; latestAnalysis: CourseAnalysis },
  existingExercises: Exercise[],
) {
  const conceptsByName = new Map(data.concepts.map((concept) => [normalizeKey(concept.name), concept]));
  const existingQuestions = new Set(existingExercises.map((exercise) => normalizeQuestion(exercise.question)));
  const seenQuestions = new Set<string>();
  const warnings: string[] = [];
  const accepted: AcceptedExercise[] = [];

  for (const exercise of generated) {
    const result = validateExerciseForPersistence(exercise, data.course, conceptsByName, seenQuestions, existingQuestions);
    if (result.accepted) {
      accepted.push(result.accepted);
    }
    if (result.warning) {
      warnings.push(result.warning);
    }
  }

  if (accepted.length < 3) {
    throw new ExerciseGenerationInvalidOutputError();
  }

  const acceptedConceptIds = new Set(accepted.map((exercise) => exercise.input.conceptId));
  if (data.concepts.length > 1 && acceptedConceptIds.size < 2) {
    throw new ExerciseGenerationInvalidOutputError();
  }

  return { inputs: accepted.map((exercise) => exercise.input), warnings };
}

export async function generateCourseExercises(
  courseId: string,
  options: GenerateCourseExercisesOptions,
  dependencies: GenerateCourseExercisesDependencies,
): Promise<GenerateCourseExercisesResult> {
  const requestedCount = clampRequestedCount(options.count);
  const data = await dependencies.courses.findDetailById(courseId);
  assertCourseData(courseId, data);

  const courseData = data as ExerciseCourseData & {
    subject: Subject;
    latestAnalysis: CourseAnalysis;
  };
  const aiService = await resolveAIService(dependencies);

  let generated: GeneratedExercise[];
  try {
    const output = await aiService.generateStructured(
      {
        prompt: buildCourseExercisesPrompt({
          course: courseData.course,
          subject: courseData.subject,
          analysis: courseData.latestAnalysis,
          concepts: courseData.concepts,
          requestedCount,
        }),
        options: { temperature: 0.35, maxOutputTokens: 2200 },
      },
      generatedExercisesSchema,
    );
    generated = output.exercises;
  } catch (error) {
    if (error instanceof AISchemaValidationError) {
      throw new ExerciseGenerationInvalidOutputError(error);
    }
    throw error;
  }

  const existingExercises = await dependencies.exercises.findAllByCourse(courseData.course.id);
  const prepared = prepareExercisesForPersistence(generated, courseData, existingExercises);

  try {
    const created = await dependencies.exercises.createMany(prepared.inputs);
    return {
      exercises: created,
      requestedCount,
      acceptedCount: created.length,
      rejectedCount: generated.length - prepared.inputs.length,
      warnings: prepared.warnings,
    };
  } catch (error) {
    throw new ExerciseGenerationPersistenceFailedError(error);
  }
}

export function createGenerateCourseExercisesService(dependencies: GenerateCourseExercisesDependencies) {
  return {
    generateCourseExercises: (courseId: string, options: GenerateCourseExercisesOptions = {}) =>
      generateCourseExercises(courseId, options, dependencies),
  };
}

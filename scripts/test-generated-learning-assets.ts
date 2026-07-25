import assert from "node:assert/strict";
import { z } from "zod";
import type { Concept, Course, CourseAnalysis, Exercise, RevisionSheet, Subject } from "../src/db";
import { AISchemaValidationError } from "../src/services/ai/ai.errors";
import type { AIRequestOptions, AITextInput } from "../src/services/ai";
import {
  ExerciseGenerationAINotConfiguredError,
  ExerciseGenerationAnalysisNotFoundError,
  ExerciseGenerationConceptsNotFoundError,
  ExerciseGenerationCourseNotFoundError,
  ExerciseGenerationCourseNotReadyError,
  ExerciseGenerationInvalidOutputError,
  ExerciseGenerationPersistenceFailedError,
  generateCourseExercises,
  type ExerciseCourseData,
  type PersistGeneratedExerciseInput,
} from "../src/features/exercises";
import {
  RevisionSheetAINotConfiguredError,
  RevisionSheetAnalysisNotFoundError,
  RevisionSheetConceptsNotFoundError,
  RevisionSheetCourseNotFoundError,
  RevisionSheetCourseNotReadyError,
  RevisionSheetInvalidOutputError,
  RevisionSheetPersistenceFailedError,
  generateCourseRevisionSheet,
  type RevisionSheetCourseData,
} from "../src/features/revision-sheet";

const now = "2026-07-25T00:00:00.000Z";

class FakeAIService {
  calls: AITextInput[] = [];
  output: unknown = validRevisionSheetOutput();
  error: unknown = null;

  async generateStructured<T>(input: AITextInput, schema: z.ZodType<T>, _options?: AIRequestOptions): Promise<T> {
    this.calls.push(input);
    if (this.error) {
      throw this.error;
    }
    const parsed = schema.safeParse(this.output);
    if (!parsed.success) {
      throw new AISchemaValidationError("fake schema validation failed", { cause: parsed.error });
    }
    return parsed.data;
  }
}

function course(input: Partial<Course> = {}): Course {
  return {
    id: "course-1",
    subjectId: "subject-1",
    title: "Fonctions affines",
    grade: "2nde",
    status: "ready",
    summary: "Résumé validé du cours.",
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
    icon: "calculator",
    color: "#D94B24",
    isDefault: false,
    createdAt: now,
    ...input,
  };
}

function analysis(input: Partial<CourseAnalysis> = {}): CourseAnalysis {
  return {
    id: "analysis-1",
    courseId: "course-1",
    detectedTitle: "Fonctions affines",
    detectedSubject: "Mathématiques",
    detectedLevel: "2nde",
    rawJson: JSON.stringify({
      summary: "Les fonctions affines sont de la forme ax+b.",
      concepts: [{ name: "Fonction affine" }, { name: "Coefficient directeur" }],
      formulas: ["f(x)=ax+b"],
    }),
    confidence: 0.9,
    validatedByUser: true,
    createdAt: now,
    ...input,
  };
}

function concepts(): Concept[] {
  return [
    {
      id: "concept-1",
      courseId: "course-1",
      name: "Fonction affine",
      description: "Expression de la forme ax+b.",
      orderIndex: 0,
      createdAt: now,
    },
    {
      id: "concept-2",
      courseId: "course-1",
      name: "Coefficient directeur",
      description: "Nombre qui indique la pente.",
      orderIndex: 1,
      createdAt: now,
    },
  ];
}

function courseData(input: Partial<RevisionSheetCourseData & ExerciseCourseData> = {}) {
  return {
    course: course(),
    subject: subject(),
    concepts: concepts(),
    latestAnalysis: analysis(),
    ...input,
  };
}

function validRevisionSheetOutput() {
  return {
    title: "Fiche - Fonctions affines",
    summary: "Une fonction affine s'écrit f(x)=ax+b.",
    keyConcepts: ["Fonction affine", "Coefficient directeur"],
    definitions: ["Une fonction affine associe x à ax+b."],
    formulas: ["f(x)=ax+b"],
    examples: ["Si a=2 et b=3, f(x)=2x+3."],
    commonMistakes: ["Confondre a et b."],
    importantPoints: ["Le coefficient directeur indique la pente."],
  };
}

function validGeneratedExercises() {
  return {
    exercises: [
      {
        type: "multiple_choice",
        question: "Quelle est la forme d'une fonction affine ?",
        expectedAnswer: "f(x)=ax+b",
        options: ["f(x)=ax+b", "f(x)=ax²"],
        hint: null,
        explanation: "Une fonction affine est de la forme ax+b.",
        conceptReference: "Fonction affine",
        difficulty: 1,
        generatedFromWeakness: false,
      },
      {
        type: "true_false",
        question: "Le coefficient directeur indique la pente.",
        expectedAnswer: "vrai",
        options: null,
        hint: "Regarde le rôle de a.",
        explanation: "Dans ax+b, a est le coefficient directeur.",
        conceptReference: "Coefficient directeur",
        difficulty: 1,
        generatedFromWeakness: false,
      },
      {
        type: "short_answer",
        question: "Quel est le coefficient directeur de f(x)=3x+2 ?",
        expectedAnswer: "3",
        options: null,
        hint: null,
        explanation: "Le coefficient directeur est le nombre devant x.",
        conceptReference: "Coefficient directeur",
        difficulty: 2,
        generatedFromWeakness: false,
      },
    ],
  };
}

function revisionDeps(data: RevisionSheetCourseData | null, ai = new FakeAIService()) {
  const sheets: RevisionSheet[] = [];
  let failPersistence = false;
  return {
    ai,
    sheets,
    setFailPersistence: () => {
      failPersistence = true;
    },
    deps: {
      aiService: ai,
      courses: {
        findDetailById: async () => data,
      },
      revisionSheets: {
        createVersion: async (input: { courseId: string; title: string; summary: string; contentJson: string }) => {
          if (failPersistence) {
            throw new Error("DB_FAIL");
          }
          const sheet: RevisionSheet = {
            id: `sheet-${sheets.length + 1}`,
            version: sheets.length + 1,
            createdAt: now,
            updatedAt: now,
            ...input,
          };
          sheets.push(sheet);
          return sheet;
        },
      },
    },
  };
}

function exerciseFromInput(input: PersistGeneratedExerciseInput, index: number): Exercise {
  return {
    id: `exercise-${index + 1}`,
    createdAt: now,
    ...input,
    type: input.type,
    difficulty: input.difficulty,
  };
}

function exerciseDeps(data: ExerciseCourseData | null, ai = new FakeAIService()) {
  const exercises: Exercise[] = [];
  let failPersistence = false;
  return {
    ai,
    exercises,
    setExisting: (items: Exercise[]) => {
      exercises.push(...items);
    },
    setFailPersistence: () => {
      failPersistence = true;
    },
    deps: {
      aiService: ai,
      courses: {
        findDetailById: async () => data,
      },
      exercises: {
        findAllByCourse: async () => exercises,
        createMany: async (inputs: PersistGeneratedExerciseInput[]) => {
          if (failPersistence) {
            throw new Error("DB_FAIL");
          }
          const created = inputs.map((input, index) => exerciseFromInput(input, exercises.length + index));
          exercises.push(...created);
          return created;
        },
      },
    },
  };
}

async function testRevisionSheets() {
  const valid = revisionDeps(courseData());
  const result = await generateCourseRevisionSheet("course-1", valid.deps);
  assert.equal(result.version, 1, "fiche version 1");
  assert.equal(valid.sheets.length, 1, "fiche persistée");
  assert.equal(JSON.parse(valid.sheets[0].contentJson).title, "Fiche - Fonctions affines", "contenu structuré persisté");

  const second = await generateCourseRevisionSheet("course-1", valid.deps);
  assert.equal(second.version, 2, "version suivante");
  assert.equal(valid.sheets.length, 2, "versions précédentes conservées");

  await assert.rejects(() => generateCourseRevisionSheet("missing", revisionDeps(null).deps), RevisionSheetCourseNotFoundError, "cours absent");
  await assert.rejects(
    () => generateCourseRevisionSheet("course-1", revisionDeps(courseData({ course: course({ status: "draft" }) })).deps),
    RevisionSheetCourseNotReadyError,
    "cours non ready",
  );
  await assert.rejects(
    () => generateCourseRevisionSheet("course-1", revisionDeps(courseData({ latestAnalysis: null })).deps),
    RevisionSheetAnalysisNotFoundError,
    "analyse absente",
  );
  await assert.rejects(
    () => generateCourseRevisionSheet("course-1", revisionDeps(courseData({ concepts: [] })).deps),
    RevisionSheetConceptsNotFoundError,
    "concepts absents",
  );
  await assert.rejects(
    () => generateCourseRevisionSheet("course-1", revisionDeps(courseData(), null as unknown as FakeAIService).deps),
    RevisionSheetAINotConfiguredError,
    "IA non configurée",
  );

  const invalid = revisionDeps(courseData());
  invalid.ai.output = { ...validRevisionSheetOutput(), title: "" };
  await assert.rejects(() => generateCourseRevisionSheet("course-1", invalid.deps), RevisionSheetInvalidOutputError, "sortie Zod invalide");
  assert.equal(invalid.sheets.length, 0, "sortie invalide sans persistance");

  const unknownConcept = revisionDeps(courseData());
  unknownConcept.ai.output = { ...validRevisionSheetOutput(), keyConcepts: ["Concept inconnu"] };
  await assert.rejects(() => generateCourseRevisionSheet("course-1", unknownConcept.deps), RevisionSheetInvalidOutputError, "concept incohérent rejeté");

  const aiFailure = revisionDeps(courseData());
  aiFailure.ai.error = new Error("AI_FAIL");
  await assert.rejects(() => generateCourseRevisionSheet("course-1", aiFailure.deps), /AI_FAIL/, "échec IA");
  assert.equal(aiFailure.sheets.length, 0, "échec IA sans persistance");

  const dbFailure = revisionDeps(courseData());
  dbFailure.setFailPersistence();
  await assert.rejects(() => generateCourseRevisionSheet("course-1", dbFailure.deps), RevisionSheetPersistenceFailedError, "échec DB");
  assert.equal(dbFailure.sheets.length, 0, "échec DB sans fiche partielle");
}

async function testExercises() {
  const valid = exerciseDeps(courseData());
  valid.ai.output = validGeneratedExercises();
  const result = await generateCourseExercises("course-1", { count: 3 }, valid.deps);
  assert.equal(result.exercises.length, 3, "génération de 3 exercices valides");
  assert.equal(result.acceptedCount, 3, "3 exercices acceptés");
  assert.equal(result.rejectedCount, 0, "aucun rejet");
  assert.equal(valid.exercises[0].conceptId, "concept-1", "mapping nom vers concept_id");
  assert.equal(valid.exercises[0].optionsJson, JSON.stringify(["f(x)=ax+b", "f(x)=ax²"]), "QCM valide sérialisé");

  await assert.rejects(() => generateCourseExercises("missing", {}, exerciseDeps(null).deps), ExerciseGenerationCourseNotFoundError, "cours absent");
  await assert.rejects(
    () => generateCourseExercises("course-1", {}, exerciseDeps(courseData({ course: course({ status: "draft" }) })).deps),
    ExerciseGenerationCourseNotReadyError,
    "cours non ready",
  );
  await assert.rejects(
    () => generateCourseExercises("course-1", {}, exerciseDeps(courseData({ latestAnalysis: null })).deps),
    ExerciseGenerationAnalysisNotFoundError,
    "analyse absente",
  );
  await assert.rejects(
    () => generateCourseExercises("course-1", {}, exerciseDeps(courseData({ concepts: [] })).deps),
    ExerciseGenerationConceptsNotFoundError,
    "concepts absents",
  );
  await assert.rejects(
    () => generateCourseExercises("course-1", {}, exerciseDeps(courseData(), null as unknown as FakeAIService).deps),
    ExerciseGenerationAINotConfiguredError,
    "IA non configurée",
  );

  const invalidQcm = exerciseDeps(courseData());
  invalidQcm.ai.output = {
    exercises: [
      ...validGeneratedExercises().exercises,
      { ...validGeneratedExercises().exercises[0], question: "QCM sans réponse ?", expectedAnswer: "C", options: ["A", "B"] },
    ],
  };
  const invalidQcmResult = await generateCourseExercises("course-1", { count: 4 }, invalidQcm.deps);
  assert.equal(invalidQcmResult.acceptedCount, 3, "QCM invalide rejeté si 3 valides restent");
  assert.equal(invalidQcmResult.rejectedCount, 1, "un QCM rejeté");

  const invalidDifficulty = exerciseDeps(courseData());
  invalidDifficulty.ai.output = {
    exercises: [
      ...validGeneratedExercises().exercises,
      { ...validGeneratedExercises().exercises[0], question: "Difficulté trop haute ?", difficulty: 4 },
    ],
  };
  assert.equal((await generateCourseExercises("course-1", { count: 4 }, invalidDifficulty.deps)).rejectedCount, 1, "difficulté invalide rejetée");

  const unknownConcept = exerciseDeps(courseData());
  unknownConcept.ai.output = {
    exercises: [
      ...validGeneratedExercises().exercises,
      { ...validGeneratedExercises().exercises[0], question: "Concept inconnu ?", conceptReference: "Inconnu" },
    ],
  };
  assert.equal((await generateCourseExercises("course-1", { count: 4 }, unknownConcept.deps)).rejectedCount, 1, "concept inconnu rejeté");

  const duplicate = exerciseDeps(courseData());
  duplicate.setExisting([
    exerciseFromInput(
      {
        courseId: "course-1",
        conceptId: "concept-1",
        type: "numeric",
        question: "Quelle est la forme d'une fonction affine ?",
        expectedAnswer: "4",
        optionsJson: null,
        hint: null,
        explanation: "Ancien exercice.",
        difficulty: 1,
        generatedFromWeakness: false,
      },
      0,
    ),
  ]);
  duplicate.ai.output = {
    exercises: [
      ...validGeneratedExercises().exercises,
      { ...validGeneratedExercises().exercises[0], question: "Donne une formule affine simple." },
    ],
  };
  const duplicateResult = await generateCourseExercises("course-1", { count: 4 }, duplicate.deps);
  assert.equal(duplicateResult.acceptedCount, 3, "question dupliquée rejetée");
  assert.equal(duplicate.exercises.length, 4, "aucune suppression des exercices existants");

  const tooFew = exerciseDeps(courseData());
  tooFew.ai.output = { exercises: [{ ...validGeneratedExercises().exercises[0], difficulty: 4 }] };
  await assert.rejects(() => generateCourseExercises("course-1", {}, tooFew.deps), ExerciseGenerationInvalidOutputError, "aucun exercice valide restant");

  const oneConceptOnly = exerciseDeps(courseData());
  oneConceptOnly.ai.output = {
    exercises: validGeneratedExercises().exercises.map((exercise, index) => ({
      ...exercise,
      question: `${exercise.question} ${index}`,
      conceptReference: "Fonction affine",
    })),
  };
  await assert.rejects(() => generateCourseExercises("course-1", {}, oneConceptOnly.deps), ExerciseGenerationInvalidOutputError, "au moins deux concepts couverts");

  const dbFailure = exerciseDeps(courseData());
  dbFailure.ai.output = validGeneratedExercises();
  dbFailure.setFailPersistence();
  await assert.rejects(() => generateCourseExercises("course-1", {}, dbFailure.deps), ExerciseGenerationPersistenceFailedError, "échec persistance");
  assert.equal(dbFailure.exercises.length, 0, "rollback complet simulé");

  assert.equal(valid.ai.calls.length > 0, true, "faux AIService appelé");
}

async function main() {
  await testRevisionSheets();
  await testExercises();
  console.log("generated learning assets tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

import assert from "node:assert/strict";
import { z } from "zod";
import type { Concept, Course, CourseAnalysis, Exercise, RevisionSheet, Subject } from "../src/db";
import { AIJsonParseError, AISchemaValidationError } from "../src/services/ai/ai.errors";
import { toSerializableJsonSchema, type AIRequestOptions, type AITextInput, type AITextResponse } from "../src/services/ai";
import {
  ExerciseGenerationAINotConfiguredError,
  ExerciseGenerationAnalysisNotFoundError,
  ExerciseGenerationConceptsNotFoundError,
  ExerciseGenerationCourseNotFoundError,
  ExerciseGenerationCourseNotReadyError,
  ExerciseGenerationInvalidOutputError,
  ExerciseGenerationPersistenceFailedError,
  exerciseGenerationSchema,
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
  response: AITextResponse = {
    text: "",
    provider: "fake",
    model: "fake-model",
    requestId: "fake-request",
    durationMs: 12,
    finishReason: "STOP",
    tokenUsage: { promptTokens: 7, outputTokens: 11, totalTokens: 18 },
    diagnostics: {
      candidateCount: 1,
      partCount: 1,
      thoughtPartCount: 0,
      responseTextLength: 64,
      startsWithCodeFence: false,
      firstNonWhitespaceCharacter: "{",
      lastNonWhitespaceCharacter: "}",
      finishReason: "STOP",
      outputTokenCount: 11,
    },
  };

  async generateStructured<T>(input: AITextInput, schema: z.ZodType<T>, _options?: AIRequestOptions): Promise<T> {
    this.calls.push({ ...input, options: { ...input.options, responseJsonSchema: toSerializableJsonSchema(schema) } });
    if (this.error) {
      throw this.error;
    }
    const parsed = schema.safeParse(this.output);
    if (!parsed.success) {
      throw new AISchemaValidationError("fake schema validation failed", { cause: parsed.error });
    }
    return parsed.data;
  }

  async generateStructuredWithMetadata<T>(input: AITextInput, schema: z.ZodType<T>, _options?: AIRequestOptions) {
    const data = await this.generateStructured(input, schema);
    return { data, response: this.response };
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

function fiveGeneratedExercises() {
  const base = validGeneratedExercises().exercises;
  return {
    exercises: [
      ...base,
      {
        ...base[0],
        type: "numeric" as const,
        question: "Quel est le coefficient directeur dans f(x)=5x+1 ?",
        expectedAnswer: "5",
        options: null,
        conceptReference: "Coefficient directeur",
      },
      {
        ...base[2],
        question: "Donne le terme constant de f(x)=2x+7.",
        expectedAnswer: "7",
        conceptReference: "Fonction affine",
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
  const logs: { event: string; payload: Record<string, unknown> }[] = [];
  let failPersistence = false;
  return {
    ai,
    exercises,
    logs,
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
      logger: (event: string, payload: Record<string, unknown>) => {
        logs.push({ event, payload });
      },
    },
  };
}

function eventPayload(logs: { event: string; payload: Record<string, unknown> }[], event: string) {
  const found = logs.find((log) => log.event === event);
  assert.ok(found, `${event} émis`);
  return found.payload;
}

function allLogsText(logs: { event: string; payload: Record<string, unknown> }[]) {
  return JSON.stringify(logs);
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
  assert.equal(eventPayload(valid.logs, "exercise-generation-start").requestedCount, 3, "log start émis");
  assert.equal(eventPayload(valid.logs, "exercise-generation-provider-done").candidateCount, 1, "log provider-done émis");
  assert.equal(eventPayload(valid.logs, "exercise-generation-validation-summary").acceptedCount, 3, "log validation summary émis");
  assert.equal(eventPayload(valid.logs, "exercise-generation-persistence-start").exerciseCount, 3, "log persistence start émis");
  assert.equal(eventPayload(valid.logs, "exercise-generation-persistence-done").exerciseCount, 3, "log persistence done émis");
  assert.doesNotMatch(allLogsText(valid.logs), /valid-key|GEMINI|Quelle est la forme|f\(x\)=ax\+b|Résumé validé|prompt|responseJsonSchema/, "logs sans secret, prompt, réponse complète ni schéma");

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

  const fiveFourValid = exerciseDeps(courseData());
  fiveFourValid.ai.output = {
    exercises: [
      ...fiveGeneratedExercises().exercises.slice(0, 4),
      { ...fiveGeneratedExercises().exercises[4], question: "Options interdites sur court ?", options: ["A", "B"] },
    ],
  };
  const fiveFourResult = await generateCourseExercises("course-1", { count: 5 }, fiveFourValid.deps);
  assert.equal(fiveFourResult.acceptedCount, 4, "5 générés et 4 valides réussissent");
  assert.equal(fiveFourResult.exercises.length, 4, "persiste les 4 exercices valides");
  assert.deepEqual(eventPayload(fiveFourValid.logs, "exercise-generation-validation-summary").acceptedTypes, ["multiple_choice", "numeric", "short_answer", "true_false"], "acceptedTypes correctement renseigné");
  const invalidTypeDetail = (eventPayload(fiveFourValid.logs, "exercise-generation-validation-summary").rejectedExercises as Record<string, unknown>[])[0];
  assert.deepEqual(invalidTypeDetail, {
    exerciseIndex: 4,
    reason: "invalid_type",
    issuePaths: ["options"],
    zodCodes: ["invalid_type"],
    expectedTypes: ["null"],
    receivedType: "array",
    exerciseType: "short_answer",
  }, "détail sûr du champ invalid_type");
  assert.doesNotMatch(allLogsText(fiveFourValid.logs), /Options interdites|f\(x\)=5x|expectedAnswer|optionsJson|\["A","B"\]/, "aucune donnée pédagogique complète dans les logs");

  const fiveThreeValid = exerciseDeps(courseData());
  fiveThreeValid.ai.output = {
    exercises: [
      ...fiveGeneratedExercises().exercises.slice(0, 3),
      { ...fiveGeneratedExercises().exercises[3], question: "Inconnu 1 ?", conceptReference: "Inconnu" },
      { ...fiveGeneratedExercises().exercises[4], question: "Inconnu 2 ?", conceptReference: "Inconnu" },
    ],
  };
  const fiveThreeResult = await generateCourseExercises("course-1", { count: 5 }, fiveThreeValid.deps);
  assert.equal(fiveThreeResult.acceptedCount, 3, "5 générés et 3 valides réussissent sans relance Gemini");
  assert.equal(fiveThreeValid.ai.calls.length, 1, "pas de relance automatique Gemini avec 3 valides");

  const fiveTwoValid = exerciseDeps(courseData());
  fiveTwoValid.ai.output = {
    exercises: [
      ...fiveGeneratedExercises().exercises.slice(0, 2),
      { ...fiveGeneratedExercises().exercises[2], question: "Inconnu 1 ?", conceptReference: "Inconnu" },
      { ...fiveGeneratedExercises().exercises[3], question: "Inconnu 2 ?", conceptReference: "Inconnu" },
      { ...fiveGeneratedExercises().exercises[4], question: "Options interdites ?", options: ["A", "B"] },
    ],
  };
  await assert.rejects(
    async () => {
      try {
        await generateCourseExercises("course-1", { count: 5 }, fiveTwoValid.deps);
      } catch (error) {
        assert.ok(error instanceof ExerciseGenerationInvalidOutputError, "5 générés et 2 valides typé");
        assert.equal(error.diagnostics.errorCode, "EXERCISE_GENERATION_TOO_FEW_ACCEPTED", "moins de 3 reste l'erreur stable");
        assert.equal(error.diagnostics.generatedCount, 5, "generatedCount conservé");
        assert.equal(error.diagnostics.acceptedCount, 2, "acceptedCount conservé");
        assert.equal(error.diagnostics.rejectedCount, 3, "rejectedCount conservé");
        assert.deepEqual(error.diagnostics.rejectionReasonCounts, { concept_not_found: 2, invalid_type: 1 }, "rejectionReasons comptabilisées");
        assert.deepEqual(error.diagnostics.acceptedTypes, ["multiple_choice", "true_false"], "acceptedTypes présent même en erreur");
        throw error;
      }
    },
    ExerciseGenerationInvalidOutputError,
    "5 générés et 2 valides échouent",
  );

  const invalidDifficulty = exerciseDeps(courseData());
  invalidDifficulty.ai.output = {
    exercises: [
      ...validGeneratedExercises().exercises,
      { ...validGeneratedExercises().exercises[0], question: "Difficulté trop haute ?", difficulty: 4 },
    ],
  };
  await assert.rejects(() => generateCourseExercises("course-1", { count: 4 }, invalidDifficulty.deps), ExerciseGenerationInvalidOutputError, "difficulté invalide rejetée par schéma");

  const unknownConcept = exerciseDeps(courseData());
  unknownConcept.ai.output = {
    exercises: [
      ...validGeneratedExercises().exercises,
      { ...validGeneratedExercises().exercises[0], question: "Concept inconnu ?", conceptReference: "Inconnu" },
    ],
  };
  assert.equal((await generateCourseExercises("course-1", { count: 4 }, unknownConcept.deps)).rejectedCount, 1, "concept inconnu rejeté");

  const unknownConceptOnly = exerciseDeps(courseData());
  unknownConceptOnly.ai.output = {
    exercises: validGeneratedExercises().exercises.map((exercise, index) => ({
      ...exercise,
      question: `${exercise.question} inconnu ${index}`,
      conceptReference: " concept   inconnu ",
    })),
  };
  await assert.rejects(
    async () => {
      try {
        await generateCourseExercises("course-1", {}, unknownConceptOnly.deps);
      } catch (error) {
        assert.ok(error instanceof ExerciseGenerationInvalidOutputError, "erreur concept inconnu typée");
        assert.equal(error.diagnostics.errorCode, "EXERCISE_GENERATION_TOO_FEW_ACCEPTED", "moins de trois acceptés explicite");
        assert.deepEqual(error.diagnostics.unknownConceptReferences, ["concept inconnu"], "concept inconnu diagnostiqué sans création");
        const summary = eventPayload(unknownConceptOnly.logs, "exercise-generation-validation-summary");
        assert.deepEqual(summary.unknownConceptReferences, ["concept inconnu"], "concepts inconnus journalisés");
        assert.deepEqual(summary.rejectionReasons, { concept_not_found: 3 }, "raisons de rejet comptabilisées");
        assert.equal(eventPayload(unknownConceptOnly.logs, "exercise-generation-failed").stage, "business_validation", "stage final business_validation");
        throw error;
      }
    },
    ExerciseGenerationInvalidOutputError,
    "concept inconnu rejeté explicitement",
  );

  const casingConcept = exerciseDeps(courseData());
  casingConcept.ai.output = {
    exercises: validGeneratedExercises().exercises.map((exercise, index) => ({
      ...exercise,
      question: `${exercise.question} casse ${index}`,
      conceptReference: index === 0 ? " fonction   AFFINE " : "coefficient DIRECTEUR",
    })),
  };
  assert.equal((await generateCourseExercises("course-1", {}, casingConcept.deps)).acceptedCount, 3, "concept avec variation de casse accepté");

  const invalidQcmOnly = exerciseDeps(courseData());
  invalidQcmOnly.ai.output = {
    exercises: validGeneratedExercises().exercises.map((exercise, index) => ({
      ...exercise,
      type: "multiple_choice",
      question: `${exercise.question} qcm invalide ${index}`,
      expectedAnswer: "C",
      options: ["A", "B"],
    })),
  };
  await assert.rejects(
    async () => {
      try {
        await generateCourseExercises("course-1", {}, invalidQcmOnly.deps);
      } catch (error) {
        assert.ok(error instanceof ExerciseGenerationInvalidOutputError, "erreur QCM typée");
        assert.equal(error.diagnostics.errorCode, "EXERCISE_GENERATION_TOO_FEW_ACCEPTED", "QCM invalide produit moins de trois acceptés");
        assert.deepEqual(error.diagnostics.rejectionReasons, ["invalid_multiple_choice"], "raison QCM diagnostiquée");
        throw error;
      }
    },
    ExerciseGenerationInvalidOutputError,
    "QCM invalide rejeté explicitement",
  );

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
  tooFew.ai.output = { exercises: validGeneratedExercises().exercises.slice(0, 2) };
  await assert.rejects(
    async () => {
      try {
        await generateCourseExercises("course-1", {}, tooFew.deps);
      } catch (error) {
        assert.ok(error instanceof ExerciseGenerationInvalidOutputError, "moins de trois typé");
        assert.equal(error.diagnostics.errorCode, "EXERCISE_GENERATION_SCHEMA_INVALID", "moins de trois exercices produit une erreur explicite");
        assert.deepEqual(error.diagnostics.issuePaths, ["exercises"], "chemin Zod sûr");
        assert.equal(eventPayload(tooFew.logs, "exercise-generation-schema-invalid").issueCount, 1, "issues Zod journalisées");
        assert.doesNotMatch(allLogsText(tooFew.logs), /f\(x\)=ax\+b|Quelle est la forme|expectedAnswer/, "issues Zod sans valeurs de réponse");
        assert.equal(eventPayload(tooFew.logs, "exercise-generation-failed").stage, "schema", "stage final schema");
        throw error;
      }
    },
    ExerciseGenerationInvalidOutputError,
    "moins de trois exercices refusé",
  );

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
  await assert.rejects(
    async () => {
      try {
        await generateCourseExercises("course-1", {}, dbFailure.deps);
      } catch (error) {
        assert.equal(eventPayload(dbFailure.logs, "exercise-generation-persistence-failed").rollback, true, "échec de persistance identifiable");
        assert.equal(eventPayload(dbFailure.logs, "exercise-generation-failed").stage, "persistence", "stage final persistence");
        throw error;
      }
    },
    ExerciseGenerationPersistenceFailedError,
    "échec persistance",
  );
  assert.equal(dbFailure.exercises.length, 0, "rollback complet simulé");

  const jsonInvalid = exerciseDeps(courseData());
  jsonInvalid.ai.error = new AIJsonParseError("bad json", {
    details: {
      responseTextLength: 12,
      startsWithCodeFence: false,
      firstNonWhitespaceCharacter: "{",
      lastNonWhitespaceCharacter: "x",
      looksTruncated: true,
      candidateCount: 1,
      partCount: 1,
      thoughtPartCount: 0,
      finishReason: "STOP",
      inputTokenCount: 2,
      outputTokenCount: 3,
      durationMs: 9,
    },
  });
  await assert.rejects(() => generateCourseExercises("course-1", {}, jsonInvalid.deps), ExerciseGenerationInvalidOutputError, "JSON invalide journalisé");
  assert.equal(eventPayload(jsonInvalid.logs, "exercise-generation-json-invalid").looksTruncated, true, "JSON invalide identifiable");

  assert.equal(valid.ai.calls.length > 0, true, "faux AIService appelé");
  assert.equal(valid.ai.calls.at(-1)?.options?.responseJsonSchema?.additionalProperties, false, "schéma des exercices transmis à Gemini");
  const exerciseSchemaJson = toSerializableJsonSchema(exerciseGenerationSchema);
  const exerciseItems = ((exerciseSchemaJson.properties as Record<string, unknown>).exercises as { items: { properties: Record<string, unknown> }; minItems: number; maxItems: number }).items;
  assert.equal(((exerciseSchemaJson.properties as Record<string, { minItems?: number }>).exercises).minItems, 3, "schéma exige 3 exercices minimum");
  assert.equal(((exerciseSchemaJson.properties as Record<string, { maxItems?: number }>).exercises).maxItems, 5, "schéma limite à 5 exercices");
  assert.deepEqual(exerciseItems.properties.type, { type: "string", enum: ["multiple_choice", "true_false", "short_answer", "numeric"] }, "types autorisés uniquement");
  assert.equal((exerciseItems.properties.question as { minLength?: number }).minLength, 1, "question non vide");
  assert.equal((exerciseItems.properties.expectedAnswer as { minLength?: number }).minLength, 1, "expectedAnswer non vide");
  assert.ok("anyOf" in (exerciseItems.properties.options as Record<string, unknown>), "options présentes nullable");
  assert.equal((exerciseItems.properties.difficulty as { type?: string }).type, "integer", "difficulté entière");
  assert.equal((exerciseItems.properties.conceptReference as { minLength?: number }).minLength, 1, "conceptReference non vide");
  assert.equal((exerciseItems.properties.generatedFromWeakness as { type?: string }).type, "boolean", "generatedFromWeakness booléen");
  assert.equal((exerciseItems.properties.explanation as { minLength?: number }).minLength, 1, "explanation non vide");
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

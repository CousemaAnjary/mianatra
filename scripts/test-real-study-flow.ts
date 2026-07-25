import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createReportService } from "../src/features/reports";
import { canSubmitExerciseAnswer, createStudySessionService, getAnswerControlKind } from "../src/features/study-session";
import { toSessionExercise } from "../src/features/study-session/utils/real-session-exercise";
import { InvalidSessionStateError } from "../src/features/shared";
import type { ConceptProgress, Course, Exercise, ExerciseAttempt, SessionReport, StudySession } from "../src/db";

const now = "2026-07-25T00:00:00.000Z";

function course(): Course {
  return {
    id: "course-1",
    subjectId: "subject-1",
    title: "Fonctions",
    grade: "2nde",
    status: "ready",
    summary: "Résumé",
    pageCount: 1,
    lastReviewedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

function exercise(input: Partial<Exercise>): Exercise {
  return {
    id: "exercise-1",
    courseId: "course-1",
    conceptId: "concept-1",
    type: "multiple_choice",
    question: "Question",
    expectedAnswer: "A",
    optionsJson: JSON.stringify(["A", "B"]),
    hint: "Indice",
    explanation: "Explication",
    difficulty: 1,
    generatedFromWeakness: false,
    createdAt: now,
    ...input,
  };
}

function session(input: Partial<StudySession> = {}): StudySession {
  return {
    id: "session-1",
    courseId: "course-1",
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

function createHarness() {
  const exercises = [
    exercise({ id: "qcm-correct", type: "multiple_choice", expectedAnswer: "A", optionsJson: JSON.stringify(["A", "B"]), conceptId: "concept-1" }),
    exercise({ id: "qcm-incorrect", type: "multiple_choice", expectedAnswer: "B", optionsJson: JSON.stringify(["A", "B"]), conceptId: "concept-1" }),
    exercise({ id: "true-false", type: "true_false", expectedAnswer: "vrai", optionsJson: null, conceptId: "concept-2" }),
    exercise({ id: "short", type: "short_answer", expectedAnswer: "suite arithmetique", optionsJson: null, conceptId: "concept-2" }),
    exercise({ id: "numeric", type: "numeric", expectedAnswer: "3.14", optionsJson: null, conceptId: "concept-3" }),
  ];
  const attempts: ExerciseAttempt[] = [];
  const progressRows: ConceptProgress[] = [];
  let activeSession = session();
  let report: SessionReport | null = null;
  let failProgress = false;

  const study = createStudySessionService({
    courses: { findById: async () => course() },
    exercises: {
      findAllByCourse: async () => exercises,
      findById: async (id) => exercises.find((item) => item.id === id) ?? null,
    },
    sessions: {
      findById: async () => activeSession,
      findActiveByCourse: async () => (activeSession.status === "active" ? activeSession : null),
      create: async (input) => {
        activeSession = session({ type: input.type });
        return activeSession;
      },
      updateCurrentExerciseIndex: async (_id, index) => {
        activeSession = { ...activeSession, currentExerciseIndex: index };
        return activeSession;
      },
      complete: async (_id, durationSeconds) => {
        activeSession = { ...activeSession, status: "completed", completedAt: now, durationSeconds };
        return activeSession;
      },
      abandon: async () => {
        activeSession = { ...activeSession, status: "abandoned", completedAt: now };
        return activeSession;
      },
    },
    attempts: {
      create: async () => {
        throw new Error("unused");
      },
      findAllByExercise: async (exerciseId) => attempts.filter((attempt) => attempt.exerciseId === exerciseId),
      findAllBySession: async (sessionId) => attempts.filter((attempt) => attempt.sessionId === sessionId),
      submitWithProgress: async (input) => {
        if (failProgress) {
          throw new Error("PROGRESS_FAIL");
        }
        const attempt = {
          id: `attempt-${attempts.length + 1}`,
          createdAt: now,
          ...input.attempt,
          mistakeType: input.attempt.mistakeType ?? null,
          responseTimeMs: input.attempt.responseTimeMs ?? null,
        };
        attempts.push(attempt);
        const progress = {
          conceptId: input.progress.conceptId,
          updatedAt: now,
          ...input.progress.input,
          lastPracticedAt: input.progress.input.lastPracticedAt ?? null,
        };
        progressRows.push(progress);
        if (input.sessionIndex) {
          activeSession = { ...activeSession, currentExerciseIndex: input.sessionIndex.currentExerciseIndex };
        }
        return { attempt, progress, session: activeSession };
      },
    },
  });

  const reports = createReportService({
    sessions: { findById: async () => activeSession },
    attempts: { findAllBySession: async (sessionId) => attempts.filter((attempt) => attempt.sessionId === sessionId) },
    exercises: { findById: async (id) => exercises.find((item) => item.id === id) ?? null },
    reports: {
      findBySession: async () => report,
      create: async (input) => {
        report = { id: "report-1", createdAt: now, ...input, strongConceptId: input.strongConceptId ?? null, weakConceptId: input.weakConceptId ?? null };
        return report;
      },
      replaceForSession: async (input) => {
        report = { id: "report-2", createdAt: now, ...input, strongConceptId: input.strongConceptId ?? null, weakConceptId: input.weakConceptId ?? null };
        return report;
      },
    },
  });

  return {
    attempts,
    exercises,
    progressRows,
    reports,
    study,
    get session() {
      return activeSession;
    },
    setCurrentIndex: (index: number) => {
      activeSession = { ...activeSession, currentExerciseIndex: index };
    },
    failProgress: () => {
      failProgress = true;
    },
  };
}

async function submitAt(harness: ReturnType<typeof createHarness>, index: number, answer: string) {
  harness.setCurrentIndex(index);
  return harness.study.submitAnswer({
    sessionId: "session-1",
    exerciseId: harness.exercises[index].id,
    answer,
  });
}

async function main() {
  const harness = createHarness();
  const mappedQcm = toSessionExercise(harness.exercises[0], "Notion QCM");
  const mappedTrueFalse = toSessionExercise(harness.exercises[2], "Notion vrai faux");
  const mappedShort = toSessionExercise(harness.exercises[3], "Notion courte");
  const mappedNumeric = toSessionExercise(harness.exercises[4], "Notion numérique");
  const mappedUnsupported = toSessionExercise(exercise({ type: "explanation", optionsJson: null }), "Notion inconnue");

  assert.equal(mappedQcm.type, "multiple_choice", "QCM réel conserve son type SQLite");
  assert.deepEqual(mappedQcm.options, ["A", "B"], "QCM avec options rendu");
  assert.equal(mappedTrueFalse.type, "true_false", "vrai/faux réel conserve son type SQLite");
  assert.deepEqual(mappedTrueFalse.options, undefined, "vrai/faux accepte options_json null");
  assert.equal(mappedShort.type, "short_answer", "réponse courte réelle conserve son type SQLite");
  assert.equal(mappedShort.options, undefined, "options_json null accepté pour réponse courte");
  assert.equal(mappedNumeric.type, "numeric", "numérique réel conserve son type SQLite");
  assert.equal(mappedNumeric.options, undefined, "options_json null accepté pour numérique");
  assert.equal(mappedUnsupported.type, "unsupported", "type inconnu affichable explicitement");
  assert.equal(getAnswerControlKind(mappedQcm.type), "multiple_choice", "renderer QCM sélectionné");
  assert.equal(getAnswerControlKind(mappedTrueFalse.type), "true_false", "renderer vrai/faux sélectionné");
  assert.equal(getAnswerControlKind(mappedShort.type), "short_answer", "renderer texte sélectionné");
  assert.equal(getAnswerControlKind(mappedNumeric.type), "numeric", "renderer numérique sélectionné");
  assert.equal(getAnswerControlKind(mappedUnsupported.type), "unsupported", "renderer erreur sélectionné");
  assert.equal(canSubmitExerciseAnswer(mappedQcm, ""), false, "bouton désactivé sans option");
  assert.equal(canSubmitExerciseAnswer(mappedQcm, "A"), true, "bouton activé après choix QCM");
  assert.equal(canSubmitExerciseAnswer(mappedTrueFalse, "Vrai"), true, "bouton activé après choix vrai/faux");
  assert.equal(canSubmitExerciseAnswer(mappedShort, "  "), false, "bouton désactivé si texte vide");
  assert.equal(canSubmitExerciseAnswer(mappedShort, "Suite"), true, "bouton activé après saisie texte");
  assert.equal(canSubmitExerciseAnswer(mappedNumeric, ""), false, "bouton numérique désactivé si vide");
  assert.equal(canSubmitExerciseAnswer(mappedNumeric, "abc"), false, "bouton numérique désactivé si non exploitable");
  assert.equal(canSubmitExerciseAnswer(mappedNumeric, "3,14"), true, "bouton numérique activé après nombre");
  assert.equal(canSubmitExerciseAnswer(mappedNumeric, "3.14", true), false, "double soumission bloquée");
  assert.equal(canSubmitExerciseAnswer(mappedUnsupported, "réponse"), false, "type inconnu jamais validable");
  const answerControlSource = fs.readFileSync(path.join(process.cwd(), "src/features/study-session/components/ExerciseAnswerControl.tsx"), "utf8");
  assert.doesNotMatch(answerControlSource, /validateExerciseAnswer|checkNumericAnswer|checkShortAnswer|checkMultipleChoiceAnswer|checkTrueFalseAnswer/, "aucune règle de correction dupliquée dans l'écran");

  assert.equal((await harness.study.getSession("session-1")).currentExerciseIndex, 0, "chargement session réelle");
  assert.equal(harness.exercises[harness.session.currentExerciseIndex].id, "qcm-correct", "bon exercice courant");

  assert.equal((await submitAt(harness, 0, "A")).validation.isCorrect, true, "QCM correct");
  assert.equal(harness.attempts.length, 1, "tentative persistée");
  assert.equal(harness.progressRows.at(-1)?.score, 100, "progression mise à jour sur 100");
  assert.equal(harness.session.currentExerciseIndex, 1, "index avancé");

  assert.equal((await submitAt(harness, 1, "A")).validation.isCorrect, false, "QCM incorrect");
  assert.equal((await submitAt(harness, 2, "true")).validation.isCorrect, true, "vrai/faux");
  assert.equal((await submitAt(harness, 3, "Suite arithmétique")).validation.isCorrect, true, "réponse courte");
  assert.equal((await submitAt(harness, 4, "3,1400004")).validation.isCorrect, true, "réponse numérique");

  const duplicate = createHarness();
  await submitAt(duplicate, 0, "A");
  duplicate.setCurrentIndex(0);
  await assert.rejects(() => submitAt(duplicate, 0, "A"), InvalidSessionStateError, "double soumission empêchée");

  const rollback = createHarness();
  rollback.failProgress();
  await assert.rejects(() => submitAt(rollback, 0, "A"), /PROGRESS_FAIL/, "rollback si progression échoue");
  assert.equal(rollback.attempts.length, 0, "aucune tentative après rollback simulé");

  await harness.study.completeSession("session-1");
  assert.equal(harness.session.status, "completed", "dernier exercice termine la session");
  const report = await harness.reports.buildSessionReport("session-1");
  assert.equal(report.totalAnswers, 5, "rapport réel créé");
  assert.equal(report.score >= 0 && report.score <= 100, true, "score entre 0 et 100");
  assert.equal(harness.attempts.length, new Set(harness.attempts.map((attempt) => attempt.exerciseId)).size, "aucune tentative dupliquée");

  console.log("real study flow tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

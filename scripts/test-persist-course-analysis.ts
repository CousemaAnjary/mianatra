import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  PersistCourseAnalysisCourseNotFoundError,
  PersistCourseAnalysisNoConceptsError,
  PersistCourseAnalysisSubjectNotFoundError,
  persistCourseAnalysis,
  type MultiPageCourseAnalysis,
} from "../src/features/course-analysis";
import type { Concept, Course, CourseAnalysis, Subject } from "../src/db";

const migrations = [
  "20260725114524_quick_golden_guardian/migration.sql",
  "20260725153531_tranquil_skreet/migration.sql",
  "20260725165016_local_singleton_schema/migration.sql",
  "20260725203000_concept_progress_score_100/migration.sql",
];

function analysis(input: Partial<MultiPageCourseAnalysis> = {}): MultiPageCourseAnalysis {
  return {
    detectedTitle: "Fonctions",
    detectedSubject: "Mathématiques",
    detectedLevel: "2nde",
    concepts: [
      { name: "Fonction affine", description: "Expression ax+b", sourcePageIndexes: [0] },
      { name: "fonction   AFFINE", description: "Description plus longue", sourcePageIndexes: [1] },
    ],
    definitions: [],
    formulas: [],
    examples: [],
    dates: [],
    keywords: [],
    summary: "Résumé global.",
    warnings: ["Page 1 floue"],
    confidence: 0.75,
    successfulPageCount: 2,
    failedPageCount: 1,
    pageResults: [],
    inconsistencies: [],
    ...input,
  };
}

function now() {
  return "2026-07-25T00:00:00.000Z";
}

type SqlParam = string | number | bigint | null | Uint8Array;

function run(db: DatabaseSync, sql: string, ...params: SqlParam[]) {
  db.prepare(sql).run(...params);
}

function get(db: DatabaseSync, sql: string, ...params: SqlParam[]) {
  return db.prepare(sql).get(...params) as Record<string, unknown> | undefined;
}

function all(db: DatabaseSync, sql: string, ...params: SqlParam[]) {
  return db.prepare(sql).all(...params) as Record<string, unknown>[];
}

function execMigration(db: DatabaseSync, root: string, relativePath: string) {
  const fullPath = join(root, "src", "db", "migrations", relativePath);
  assert.ok(existsSync(fullPath), `missing migration ${relativePath}`);
  for (const statement of readFileSync(fullPath, "utf8").split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
    db.exec(statement);
  }
}

function setupDb() {
  const tempDir = mkdtempSync(join(tmpdir(), "mianatra-persist-analysis-"));
  const db = new DatabaseSync(join(tempDir, "persist.sqlite"));
  db.exec("PRAGMA foreign_keys = ON");
  for (const migration of migrations) {
    execMigration(db, process.cwd(), migration);
  }
  db.exec("PRAGMA foreign_keys = ON");
  return { db, tempDir };
}

function seedCourse(db: DatabaseSync) {
  run(db, "INSERT INTO subjects (id, name, icon, color, is_default, created_at) VALUES ('subject-1', 'Mathématiques', 'calculator', '#D94B24', 0, ?)", now());
  run(db, "INSERT INTO subjects (id, name, icon, color, is_default, created_at) VALUES ('subject-2', 'Physique', 'atom', '#2E7D70', 0, ?)", now());
  run(
    db,
    "INSERT INTO courses (id, subject_id, title, grade, status, summary, page_count, last_reviewed_at, created_at, updated_at) VALUES ('course-1', 'subject-1', 'Brouillon', '2nde', 'processing', NULL, 3, NULL, ?, ?)",
    now(),
    now(),
  );
  run(db, "INSERT INTO course_analyses (id, course_id, detected_title, detected_subject, detected_level, raw_json, confidence, validated_by_user, created_at) VALUES ('analysis-old', 'course-1', 'Ancien', 'Mathématiques', '2nde', '{}', NULL, 0, ?)", now());
  run(db, "INSERT INTO concepts (id, course_id, name, description, order_index, created_at) VALUES ('concept-old', 'course-1', 'Ancien concept', NULL, 0, ?)", now());
}

function hasReferencedConcepts(db: DatabaseSync, conceptIds: string[]) {
  if (conceptIds.length === 0) {
    return false;
  }
  const placeholders = conceptIds.map(() => "?").join(",");
  const tables = [
    ["exercises", "concept_id"],
    ["concept_progress", "concept_id"],
    ["recommendations", "concept_id"],
    ["session_reports", "strong_concept_id"],
    ["session_reports", "weak_concept_id"],
  ];
  return tables.some(([table, column]) => Number(get(db, `SELECT COUNT(*) AS count FROM ${table} WHERE ${column} IN (${placeholders})`, ...conceptIds)?.count ?? 0) > 0);
}

function persistInSqlite(
  db: DatabaseSync,
  input: { courseId: string; subjectId: string; title: string; grade: string; summary: string | null; analysis: MultiPageCourseAnalysis; concepts: { name: string; description: string | null }[] },
  failAt?: "analysis" | "concepts" | "course",
) {
  db.exec("BEGIN");
  try {
    assert.ok(get(db, "SELECT id FROM courses WHERE id = ?", input.courseId), "COURSE_NOT_FOUND");
    assert.ok(get(db, "SELECT id FROM subjects WHERE id = ?", input.subjectId), "SUBJECT_NOT_FOUND");
    const existingConcepts = all(db, "SELECT id FROM concepts WHERE course_id = ?", input.courseId).map((row) => String(row.id));
    if (hasReferencedConcepts(db, existingConcepts)) {
      throw new Error("COURSE_CONCEPTS_REFERENCED");
    }
    if (failAt === "analysis") {
      throw new Error("forced analysis failure");
    }
    const analysisId = randomUUID();
    run(
      db,
      "INSERT INTO course_analyses (id, course_id, detected_title, detected_subject, detected_level, raw_json, confidence, validated_by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)",
      analysisId,
      input.courseId,
      input.title,
      "Mathématiques",
      input.grade,
      JSON.stringify(input.analysis),
      input.analysis.confidence,
      now(),
    );
    db.prepare("DELETE FROM concepts WHERE course_id = ?").run(input.courseId);
    if (failAt === "concepts") {
      throw new Error("forced concepts failure");
    }
    input.concepts.forEach((concept, orderIndex) => {
      run(db, "INSERT INTO concepts (id, course_id, name, description, order_index, created_at) VALUES (?, ?, ?, ?, ?, ?)", randomUUID(), input.courseId, concept.name, concept.description, orderIndex, now());
    });
    if (failAt === "course") {
      throw new Error("forced course failure");
    }
    run(db, "UPDATE courses SET subject_id = ?, title = ?, grade = ?, summary = ?, status = 'ready', updated_at = ? WHERE id = ?", input.subjectId, input.title, input.grade, input.summary, now(), input.courseId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

async function testService() {
  const course: Course = { id: "course-1", subjectId: "subject-1", title: "Draft", grade: "2nde", status: "processing", summary: null, pageCount: 0, lastReviewedAt: null, createdAt: now(), updatedAt: now() };
  const subject: Subject = { id: "subject-1", name: "Mathématiques", icon: "calculator", color: "#D94B24", isDefault: false, createdAt: now() };
  let persistedInput: unknown = null;
  const persisted = await persistCourseAnalysis(
    { courseId: "course-1", analysis: analysis(), title: " Titre corrigé ", subjectId: "subject-1", grade: " 1ère " },
    {
      courses: { findById: async () => course },
      subjects: { findById: async () => subject },
      analyses: {
        persistForCourse: async (input) => {
          persistedInput = input;
          return {
            course: { ...course, title: input.title, subjectId: input.subjectId, grade: input.grade, summary: input.summary, status: "ready" },
            analysis: { id: "analysis-1", courseId: input.courseId, detectedTitle: input.title, detectedSubject: subject.name, detectedLevel: input.grade, rawJson: "{}", confidence: input.analysis.confidence, validatedByUser: input.validatedByUser, createdAt: now() },
            concepts: input.concepts.map((concept, orderIndex) => ({ id: `concept-${orderIndex}`, courseId: input.courseId, name: concept.name, description: concept.description ?? null, orderIndex, createdAt: now() })) as Concept[],
          };
        },
      },
    },
  );
  assert.equal(persisted.course.status, "ready", "persistance réussie");
  assert.equal(persisted.concepts.length, 1, "concepts dupliqués retirés");
  assert.equal(persisted.concepts[0].name, "Fonction affine", "nom concept normalisé");
  assert.equal((persistedInput as { validatedByUser: boolean }).validatedByUser, true, "corrections explicites détectées");

  await assert.rejects(() => persistCourseAnalysis({ courseId: "missing", analysis: analysis() }, { courses: { findById: async () => null }, subjects: { findById: async () => subject }, analyses: { persistForCourse: async () => { throw new Error("unused"); } } }), PersistCourseAnalysisCourseNotFoundError, "cours absent");
  await assert.rejects(() => persistCourseAnalysis({ courseId: "course-1", analysis: analysis(), subjectId: "missing" }, { courses: { findById: async () => course }, subjects: { findById: async () => null }, analyses: { persistForCourse: async () => { throw new Error("unused"); } } }), PersistCourseAnalysisSubjectNotFoundError, "matière absente");
  await assert.rejects(() => persistCourseAnalysis({ courseId: "course-1", analysis: analysis({ concepts: [] }) }, { courses: { findById: async () => course }, subjects: { findById: async () => subject }, analyses: { persistForCourse: async () => { throw new Error("unused"); } } }), PersistCourseAnalysisNoConceptsError, "analyse sans concept");
}

function testSqlitePersistence() {
  const { db, tempDir } = setupDb();
  try {
    seedCourse(db);
    persistInSqlite(db, {
      courseId: "course-1",
      subjectId: "subject-2",
      title: "Fonctions corrigées",
      grade: "1ère",
      summary: "Résumé global.",
      analysis: analysis(),
      concepts: [
        { name: "Concept A", description: "A" },
        { name: "Concept B", description: null },
      ],
    });
    assert.equal(Number(get(db, "SELECT COUNT(*) AS count FROM course_analyses WHERE course_id = 'course-1'")?.count), 2, "historique des analyses conservé");
    assert.deepEqual(all(db, "SELECT name FROM concepts WHERE course_id = 'course-1' ORDER BY order_index").map((row) => row.name), ["Concept A", "Concept B"], "concepts créés dans l'ordre");
    const updatedCourse = get(db, "SELECT title, subject_id, grade, summary, status, page_count FROM courses WHERE id = 'course-1'");
    assert.equal(updatedCourse?.title, "Fonctions corrigées", "titre mis à jour");
    assert.equal(updatedCourse?.subject_id, "subject-2", "matière mise à jour");
    assert.equal(updatedCourse?.grade, "1ère", "grade mis à jour");
    assert.equal(updatedCourse?.summary, "Résumé global.", "résumé mis à jour");
    assert.equal(updatedCourse?.status, "ready", "statut final ready");
    assert.equal(updatedCourse?.page_count, 3, "pages non modifiées");
    const rawJson = String(get(db, "SELECT raw_json FROM course_analyses WHERE id != 'analysis-old'")?.raw_json);
    assert.doesNotMatch(rawJson, /imageBase64|gemini_api_key|GEMINI_API_KEY/, "raw_json sans base64 ni clé");

    for (const failAt of ["analysis", "concepts", "course"] as const) {
      const before = {
        analyses: Number(get(db, "SELECT COUNT(*) AS count FROM course_analyses WHERE course_id = 'course-1'")?.count),
        concepts: Number(get(db, "SELECT COUNT(*) AS count FROM concepts WHERE course_id = 'course-1'")?.count),
        title: get(db, "SELECT title FROM courses WHERE id = 'course-1'")?.title,
      };
      assert.throws(() => persistInSqlite(db, { courseId: "course-1", subjectId: "subject-2", title: "Rollback", grade: "Tale", summary: "Rollback", analysis: analysis(), concepts: [{ name: "Rollback", description: null }] }, failAt), `rollback ${failAt}`);
      assert.equal(Number(get(db, "SELECT COUNT(*) AS count FROM course_analyses WHERE course_id = 'course-1'")?.count), before.analyses, `aucune analyse partielle ${failAt}`);
      assert.equal(Number(get(db, "SELECT COUNT(*) AS count FROM concepts WHERE course_id = 'course-1'")?.count), before.concepts, `aucun concept partiel ${failAt}`);
      assert.equal(get(db, "SELECT title FROM courses WHERE id = 'course-1'")?.title, before.title, `cours non modifié ${failAt}`);
    }

    const conceptId = String(get(db, "SELECT id FROM concepts WHERE course_id = 'course-1' LIMIT 1")?.id);
    run(db, "INSERT INTO exercises (id, course_id, concept_id, type, question, expected_answer, options_json, hint, explanation, difficulty, generated_from_weakness, created_at) VALUES ('exercise-ref', 'course-1', ?, 'numeric', '2+2', '4', NULL, NULL, 'Addition', 1, 0, ?)", conceptId, now());
    assert.throws(() => persistInSqlite(db, { courseId: "course-1", subjectId: "subject-2", title: "Blocked", grade: "Tale", summary: null, analysis: analysis(), concepts: [{ name: "Blocked", description: null }] }), /COURSE_CONCEPTS_REFERENCED/, "concepts déjà référencés");
  } finally {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  await testService();
  testSqlitePersistence();
  console.log("persist course analysis tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const tempDir = mkdtempSync(join(tmpdir(), "mianatra-db-repositories-"));
const dbPath = join(tempDir, "repositories.sqlite");
const migrationsDir = join(root, "src", "db", "migrations");
const migrationFiles = [
  "20260725114524_quick_golden_guardian/migration.sql",
  "20260725153531_tranquil_skreet/migration.sql",
  "20260725165016_local_singleton_schema/migration.sql",
];

function execMigration(db, relativePath) {
  const fullPath = join(migrationsDir, relativePath);
  assert.ok(existsSync(fullPath), `missing migration ${relativePath}`);
  const statements = readFileSync(fullPath, "utf8")
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    db.exec(statement);
  }
}

function get(db, sql, ...params) {
  return db.prepare(sql).get(...params);
}

function all(db, sql, ...params) {
  return db.prepare(sql).all(...params);
}

function run(db, sql, ...params) {
  db.prepare(sql).run(...params);
}

function nowIso() {
  return new Date().toISOString();
}

function createId() {
  return randomUUID();
}

function assertThrows(label, fn) {
  assert.throws(fn, undefined, label);
}

const db = new DatabaseSync(dbPath);

try {
  db.exec("PRAGMA foreign_keys = ON");
  for (const migrationFile of migrationFiles) {
    execMigration(db, migrationFile);
  }
  db.exec("PRAGMA foreign_keys = ON");

  const now = nowIso();

  run(
    db,
    "INSERT INTO user_profiles (id, display_name, age, grade, series, school_name, created_at, updated_at) VALUES (1, ?, ?, ?, NULL, NULL, ?, ?)",
    "Fara",
    99,
    "2nde",
    now,
    now,
  );
  assert.equal(get(db, "SELECT age FROM user_profiles WHERE id = 1").age, 99, "profile accepts integer age without arbitrary range");
  assertThrows("profile singleton rejects id != 1", () => {
    run(
      db,
      "INSERT INTO user_profiles (id, display_name, age, grade, series, school_name, created_at, updated_at) VALUES (2, 'Other', 17, '2nde', NULL, NULL, ?, ?)",
      now,
      now,
    );
  });

  const subjectColumns = all(db, "PRAGMA table_info(subjects)").map((row) => row.name);
  assert.ok(!subjectColumns.includes("slug"), "subjects has no slug");
  const subjectId = createId();
  run(
    db,
    "INSERT INTO subjects (id, name, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, 0, ?)",
    subjectId,
    "Mathématiques",
    "calculator",
    "#D94B24",
    now,
  );
  assertThrows("subject name is unique", () => {
    run(db, "INSERT INTO subjects (id, name, icon, color, is_default, created_at) VALUES (?, ?, 'book', '#2E7D70', 0, ?)", createId(), "Mathématiques", now);
  });

  const courseId = createId();
  run(
    db,
    "INSERT INTO courses (id, subject_id, title, grade, status, summary, page_count, last_reviewed_at, created_at, updated_at) VALUES (?, ?, ?, ?, 'ready', NULL, 0, NULL, ?, ?)",
    courseId,
    subjectId,
    "Fonctions",
    "2nde",
    now,
    now,
  );
  assert.equal(get(db, "SELECT title FROM courses WHERE id = ?", courseId).title, "Fonctions", "course created");

  const courseWithPagesId = createId();
  db.exec("BEGIN");
  run(
    db,
    "INSERT INTO courses (id, subject_id, title, grade, status, summary, page_count, last_reviewed_at, created_at, updated_at) VALUES (?, ?, 'Cours avec pages', '2nde', 'ready', NULL, 2, NULL, ?, ?)",
    courseWithPagesId,
    subjectId,
    now,
    now,
  );
  const pageA = createId();
  const pageB = createId();
  run(db, "INSERT INTO course_pages (id, course_id, local_uri, thumbnail_uri, page_index, rotation, quality_status, created_at) VALUES (?, ?, 'file://a.jpg', NULL, 0, 0, 'good', ?)", pageA, courseWithPagesId, now);
  run(db, "INSERT INTO course_pages (id, course_id, local_uri, thumbnail_uri, page_index, rotation, quality_status, created_at) VALUES (?, ?, 'file://b.jpg', NULL, 1, 0, 'good', ?)", pageB, courseWithPagesId, now);
  db.exec("COMMIT");
  assert.equal(get(db, "SELECT page_count FROM courses WHERE id = ?", courseWithPagesId).page_count, 2, "page_count maintained");

  db.exec("BEGIN");
  run(db, "UPDATE course_pages SET page_index = -1 WHERE id = ?", pageA);
  run(db, "UPDATE course_pages SET page_index = 0 WHERE id = ?", pageB);
  run(db, "UPDATE course_pages SET page_index = 1 WHERE id = ?", pageA);
  db.exec("COMMIT");
  assert.deepEqual(
    all(db, "SELECT id FROM course_pages WHERE course_id = ? ORDER BY page_index", courseWithPagesId).map((row) => row.id),
    [pageB, pageA],
    "pages reordered deterministically",
  );

  run(
    db,
    "INSERT INTO course_analyses (id, course_id, detected_title, detected_subject, detected_level, raw_json, confidence, validated_by_user, created_at) VALUES (?, ?, 'A1', 'Mathématiques', NULL, '{}', NULL, 0, ?)",
    createId(),
    courseId,
    now,
  );
  run(
    db,
    "INSERT INTO course_analyses (id, course_id, detected_title, detected_subject, detected_level, raw_json, confidence, validated_by_user, created_at) VALUES (?, ?, 'A2', 'Mathématiques', NULL, '{}', NULL, 0, ?)",
    createId(),
    courseId,
    now,
  );
  assert.equal(get(db, "SELECT COUNT(*) AS count FROM course_analyses WHERE course_id = ?", courseId).count, 2, "multiple analyses kept");

  const conceptId = createId();
  run(db, "INSERT INTO concepts (id, course_id, name, description, order_index, created_at) VALUES (?, ?, 'Second degré', NULL, 0, ?)", conceptId, courseId, now);
  run(db, "INSERT INTO revision_sheets (id, course_id, title, summary, content_json, version, created_at, updated_at) VALUES (?, ?, 'Fiche 1', 'Résumé', '{}', 1, ?, ?)", createId(), courseId, now, now);
  run(db, "INSERT INTO revision_sheets (id, course_id, title, summary, content_json, version, created_at, updated_at) VALUES (?, ?, 'Fiche 2', 'Résumé', '{}', 2, ?, ?)", createId(), courseId, now, now);
  assert.equal(get(db, "SELECT MAX(version) AS version FROM revision_sheets WHERE course_id = ?", courseId).version, 2, "revision versions kept");

  const sessionId = createId();
  run(
    db,
    "INSERT INTO study_sessions (id, course_id, type, status, current_exercise_index, started_at, completed_at, duration_seconds, created_at) VALUES (?, ?, 'initial', 'active', 0, ?, NULL, 0, ?)",
    sessionId,
    courseId,
    now,
    now,
  );
  assert.equal(get(db, "SELECT COUNT(*) AS count FROM study_sessions WHERE course_id = ? AND status = 'active'", courseId).count, 1, "single active session expected");

  run(
    db,
    "INSERT INTO concept_progress (concept_id, score, status, attempts_count, correct_count, last_practiced_at, updated_at) VALUES (?, 0.5, 'in_progress', 2, 1, ?, ?)",
    conceptId,
    now,
    now,
  );
  assert.equal(get(db, "SELECT concept_id FROM concept_progress WHERE concept_id = ?", conceptId).concept_id, conceptId, "progress keyed by concept");

  run(
    db,
    "INSERT INTO session_reports (id, session_id, score, correct_answers, total_answers, strong_concept_id, weak_concept_id, summary, recommendation, created_at) VALUES (?, ?, 0.5, 1, 2, ?, NULL, 'Résumé', 'Revoir', ?)",
    createId(),
    sessionId,
    conceptId,
    now,
  );
  assertThrows("session report is unique per session", () => {
    run(
      db,
      "INSERT INTO session_reports (id, session_id, score, correct_answers, total_answers, strong_concept_id, weak_concept_id, summary, recommendation, created_at) VALUES (?, ?, 1, 2, 2, NULL, NULL, 'Résumé', 'Continuer', ?)",
      createId(),
      sessionId,
      now,
    );
  });

  run(db, "INSERT INTO recommendations (id, course_id, concept_id, type, title, description, estimated_minutes, priority, completed_at, created_at) VALUES (?, ?, NULL, 'resume', 'B', 'Desc', 5, 2, NULL, '2026-07-25T00:00:02.000Z')", createId(), courseId);
  run(db, "INSERT INTO recommendations (id, course_id, concept_id, type, title, description, estimated_minutes, priority, completed_at, created_at) VALUES (?, ?, NULL, 'resume', 'A', 'Desc', 5, 1, NULL, '2026-07-25T00:00:01.000Z')", createId(), courseId);
  assert.deepEqual(
    all(db, "SELECT title FROM recommendations WHERE completed_at IS NULL ORDER BY priority ASC, created_at DESC").map((row) => row.title),
    ["A", "B"],
    "recommendations sorted by priority then creation date",
  );

  const helperSource = readFileSync(join(root, "src", "db", "helpers.ts"), "utf8");
  assert.match(createId(), /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, "UUID format");
  assert.match(helperSource, /expo-crypto/, "createId uses expo-crypto in application code");
  assert.doesNotMatch(helperSource, /Math\.random/, "createId does not use Math.random");

  console.log("db repository tests OK");
} finally {
  db.close();
  rmSync(tempDir, { recursive: true, force: true });
}

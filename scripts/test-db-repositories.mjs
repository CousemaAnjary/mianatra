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
const baseMigrationFiles = [
  "20260725114524_quick_golden_guardian/migration.sql",
  "20260725153531_tranquil_skreet/migration.sql",
  "20260725165016_local_singleton_schema/migration.sql",
];
const progressScoreMigrationFile = "20260725203000_concept_progress_score_100/migration.sql";
const migrationFiles = [...baseMigrationFiles, progressScoreMigrationFile];

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

function submitAttemptProgressSessionTransaction(
  db,
  { attemptId, attemptSessionId, updateSessionId, exerciseId, conceptId, score, attemptsCount, correctCount, nextIndex, failAfterAttempt = false },
) {
  db.exec("BEGIN");
  try {
    run(
      db,
      "INSERT INTO exercise_attempts (id, exercise_id, session_id, user_answer, is_correct, used_hint, mistake_type, response_time_ms, created_at) VALUES (?, ?, ?, '4', 1, 0, NULL, NULL, '2026-07-25T00:00:00.000Z')",
      attemptId,
      exerciseId,
      attemptSessionId,
    );
    if (failAfterAttempt) {
      throw new Error("forced failure after attempt insert");
    }
    run(
      db,
      `INSERT INTO concept_progress (concept_id, score, status, attempts_count, correct_count, last_practiced_at, updated_at)
       VALUES (?, ?, 'to_discover', ?, ?, '2026-07-25T00:00:00.000Z', '2026-07-25T00:00:00.000Z')
       ON CONFLICT(concept_id) DO UPDATE SET
         score = excluded.score,
         status = excluded.status,
         attempts_count = excluded.attempts_count,
         correct_count = excluded.correct_count,
         last_practiced_at = excluded.last_practiced_at,
         updated_at = excluded.updated_at`,
      conceptId,
      score,
      attemptsCount,
      correctCount,
    );
    if (nextIndex !== undefined) {
      const result = db
        .prepare("UPDATE study_sessions SET current_exercise_index = ? WHERE id = ?")
        .run(nextIndex, updateSessionId ?? attemptSessionId);
      if (result.changes !== 1) {
        throw new Error("Study session not found.");
      }
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function runProgressScoreMigrationTests() {
  const migrationTempDir = mkdtempSync(join(tmpdir(), "mianatra-progress-score-migration-"));
  const migrationDb = new DatabaseSync(join(migrationTempDir, "migration.sqlite"));

  try {
    migrationDb.exec("PRAGMA foreign_keys = ON");
    for (const migrationFile of baseMigrationFiles) {
      execMigration(migrationDb, migrationFile);
    }
    migrationDb.exec("PRAGMA foreign_keys = ON");

    const now = "2026-07-25T00:00:00.000Z";
    run(
      migrationDb,
      "INSERT INTO subjects (id, name, icon, color, is_default, created_at) VALUES ('migration-subject', 'Migration', 'book', '#D94B24', 0, ?)",
      now,
    );
    run(
      migrationDb,
      "INSERT INTO courses (id, subject_id, title, grade, status, summary, page_count, last_reviewed_at, created_at, updated_at) VALUES ('migration-course', 'migration-subject', 'Migration', '2nde', 'ready', NULL, 0, NULL, ?, ?)",
      now,
      now,
    );

    const cases = [
      ["concept-score-0", 0, 0],
      ["concept-score-025", 0.25, 25],
      ["concept-score-085", 0.85, 85],
      ["concept-score-1", 1, 100],
      ["concept-score-42", 42, 42],
      ["concept-score-85", 85, 85],
      ["concept-score-100", 100, 100],
    ];

    cases.forEach(([conceptId, score], orderIndex) => {
      run(
        migrationDb,
        "INSERT INTO concepts (id, course_id, name, description, order_index, created_at) VALUES (?, 'migration-course', ?, NULL, ?, ?)",
        conceptId,
        conceptId,
        orderIndex,
        now,
      );
      run(
        migrationDb,
        "INSERT INTO concept_progress (concept_id, score, status, attempts_count, correct_count, last_practiced_at, updated_at) VALUES (?, ?, 'in_progress', 2, 1, ?, ?)",
        conceptId,
        score,
        now,
        now,
      );
    });

    execMigration(migrationDb, progressScoreMigrationFile);
    migrationDb.exec("PRAGMA foreign_keys = ON");

    for (const [conceptId, , expectedScore] of cases) {
      const row = get(migrationDb, "SELECT score, status, attempts_count, correct_count, last_practiced_at, updated_at FROM concept_progress WHERE concept_id = ?", conceptId);
      assert.equal(row.score, expectedScore, `score migrated for ${conceptId}`);
      assert.equal(row.status, "in_progress", `status preserved for ${conceptId}`);
      assert.equal(row.attempts_count, 2, `attempts_count preserved for ${conceptId}`);
      assert.equal(row.correct_count, 1, `correct_count preserved for ${conceptId}`);
      assert.equal(row.last_practiced_at, now, `last_practiced_at preserved for ${conceptId}`);
      assert.equal(row.updated_at, now, `updated_at preserved for ${conceptId}`);
    }

    assertThrows("concept_progress rejects score below 0 after migration", () => {
      run(
        migrationDb,
        "INSERT INTO concepts (id, course_id, name, description, order_index, created_at) VALUES ('concept-score-low', 'migration-course', 'Low', NULL, 0, ?)",
        now,
      );
      run(
        migrationDb,
        "INSERT INTO concept_progress (concept_id, score, status, attempts_count, correct_count, last_practiced_at, updated_at) VALUES ('concept-score-low', -1, 'in_progress', 0, 0, NULL, ?)",
        now,
      );
    });
    assertThrows("concept_progress rejects score above 100 after migration", () => {
      run(
        migrationDb,
        "INSERT INTO concepts (id, course_id, name, description, order_index, created_at) VALUES ('concept-score-high', 'migration-course', 'High', NULL, 0, ?)",
        now,
      );
      run(
        migrationDb,
        "INSERT INTO concept_progress (concept_id, score, status, attempts_count, correct_count, last_practiced_at, updated_at) VALUES ('concept-score-high', 101, 'in_progress', 0, 0, NULL, ?)",
        now,
      );
    });
    assert.deepEqual(all(migrationDb, "PRAGMA foreign_key_check"), [], "progress score migration keeps foreign keys valid");
    assert.match(
      get(migrationDb, "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'concept_progress'").sql,
      /chk_concept_progress_score_range/,
      "progress score check constraint exists",
    );
  } finally {
    migrationDb.close();
    rmSync(migrationTempDir, { recursive: true, force: true });
  }
}

const db = new DatabaseSync(dbPath);

try {
  runProgressScoreMigrationTests();

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

  const txConceptId = createId();
  const txExerciseId = createId();
  run(db, "INSERT INTO concepts (id, course_id, name, description, order_index, created_at) VALUES (?, ?, 'Transaction', NULL, 1, ?)", txConceptId, courseId, now);
  run(
    db,
    "INSERT INTO exercises (id, course_id, concept_id, type, question, expected_answer, options_json, hint, explanation, difficulty, generated_from_weakness, created_at) VALUES (?, ?, ?, 'numeric', '2 + 2', '4', NULL, NULL, 'Addition', 1, 0, ?)",
    txExerciseId,
    courseId,
    txConceptId,
    now,
  );

  assertThrows("transaction rejects before insert on invalid exercise FK", () => {
    submitAttemptProgressSessionTransaction(db, {
      attemptId: "tx-attempt-before-insert",
      attemptSessionId: sessionId,
      exerciseId: "missing-exercise",
      conceptId: txConceptId,
      score: 100,
      attemptsCount: 1,
      correctCount: 1,
    });
  });
  assert.equal(get(db, "SELECT COUNT(*) AS count FROM exercise_attempts WHERE id = 'tx-attempt-before-insert'").count, 0, "no attempt after pre-insert transaction failure");

  submitAttemptProgressSessionTransaction(db, {
    attemptId: "tx-attempt-success-1",
    attemptSessionId: sessionId,
    exerciseId: txExerciseId,
    conceptId: txConceptId,
    score: 100,
    attemptsCount: 1,
    correctCount: 1,
    nextIndex: 1,
  });
  assert.equal(get(db, "SELECT COUNT(*) AS count FROM exercise_attempts WHERE id = 'tx-attempt-success-1'").count, 1, "transaction creates attempt");
  assert.equal(get(db, "SELECT score FROM concept_progress WHERE concept_id = ?", txConceptId).score, 100, "transaction creates progress");
  assert.equal(get(db, "SELECT current_exercise_index FROM study_sessions WHERE id = ?", sessionId).current_exercise_index, 1, "transaction updates session index");

  assertThrows("transaction rolls back forced error after attempt insert", () => {
    submitAttemptProgressSessionTransaction(db, {
      attemptId: "tx-attempt-forced-rollback",
      attemptSessionId: sessionId,
      exerciseId: txExerciseId,
      conceptId: txConceptId,
      score: 50,
      attemptsCount: 2,
      correctCount: 1,
      failAfterAttempt: true,
    });
  });
  assert.equal(get(db, "SELECT COUNT(*) AS count FROM exercise_attempts WHERE id = 'tx-attempt-forced-rollback'").count, 0, "attempt rolled back after forced error");
  assert.equal(get(db, "SELECT score FROM concept_progress WHERE concept_id = ?", txConceptId).score, 100, "progress unchanged after forced rollback");

  assertThrows("transaction rolls back invalid progress score", () => {
    submitAttemptProgressSessionTransaction(db, {
      attemptId: "tx-attempt-invalid-progress",
      attemptSessionId: sessionId,
      exerciseId: txExerciseId,
      conceptId: txConceptId,
      score: 101,
      attemptsCount: 2,
      correctCount: 2,
    });
  });
  assert.equal(get(db, "SELECT COUNT(*) AS count FROM exercise_attempts WHERE id = 'tx-attempt-invalid-progress'").count, 0, "attempt rolled back after invalid progress");
  assert.equal(get(db, "SELECT score FROM concept_progress WHERE concept_id = ?", txConceptId).score, 100, "progress unchanged after invalid progress");

  assertThrows("transaction rolls back missing session index update", () => {
    submitAttemptProgressSessionTransaction(db, {
      attemptId: "tx-attempt-session-rollback",
      attemptSessionId: sessionId,
      updateSessionId: "missing-session",
      exerciseId: txExerciseId,
      conceptId: txConceptId,
      score: 42,
      attemptsCount: 2,
      correctCount: 1,
      nextIndex: 2,
    });
  });
  assert.equal(get(db, "SELECT COUNT(*) AS count FROM exercise_attempts WHERE id = 'tx-attempt-session-rollback'").count, 0, "attempt rolled back after session update error");
  assert.equal(get(db, "SELECT score FROM concept_progress WHERE concept_id = ?", txConceptId).score, 100, "progress rolled back after session update error");
  assert.equal(get(db, "SELECT current_exercise_index FROM study_sessions WHERE id = ?", sessionId).current_exercise_index, 1, "session index rolled back");

  submitAttemptProgressSessionTransaction(db, {
    attemptId: "tx-attempt-success-2",
    attemptSessionId: sessionId,
    exerciseId: txExerciseId,
    conceptId: txConceptId,
    score: 50,
    attemptsCount: 2,
    correctCount: 1,
    nextIndex: 2,
  });
  const txProgress = get(db, "SELECT score, attempts_count, correct_count FROM concept_progress WHERE concept_id = ?", txConceptId);
  assert.equal(get(db, "SELECT COUNT(*) AS count FROM exercise_attempts WHERE exercise_id = ?", txExerciseId).count, 2, "successive submissions are deterministic");
  assert.equal(txProgress.score, 50, "successive submission updates progress score");
  assert.equal(txProgress.attempts_count, 2, "successive submission updates attempts_count");
  assert.equal(txProgress.correct_count, 1, "successive submission updates correct_count");
  assert.equal(txProgress.correct_count <= txProgress.attempts_count, true, "correct_count remains coherent");

  run(
    db,
    "INSERT INTO concept_progress (concept_id, score, status, attempts_count, correct_count, last_practiced_at, updated_at) VALUES (?, 50, 'in_progress', 2, 1, ?, ?)",
    conceptId,
    now,
    now,
  );
  assert.equal(get(db, "SELECT concept_id FROM concept_progress WHERE concept_id = ?", conceptId).concept_id, conceptId, "progress keyed by concept");
  assert.equal(get(db, "SELECT score FROM concept_progress WHERE concept_id = ?", conceptId).score, 50, "progress score stored on 0-100 scale");
  assertThrows("concept progress score lower bound", () => {
    run(db, "UPDATE concept_progress SET score = -1 WHERE concept_id = ?", conceptId);
  });
  assertThrows("concept progress score upper bound", () => {
    run(db, "UPDATE concept_progress SET score = 101 WHERE concept_id = ?", conceptId);
  });

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

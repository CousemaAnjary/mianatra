import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const migrationsDir = join(root, "src", "db", "migrations");
const tempDir = mkdtempSync(join(tmpdir(), "mianatra-db-verify-"));
const dbPath = join(tempDir, "verify.sqlite");

const businessTables = [
  "app_settings",
  "concept_progress",
  "concepts",
  "course_analyses",
  "course_pages",
  "courses",
  "exercise_attempts",
  "exercises",
  "recommendations",
  "revision_sheets",
  "session_reports",
  "study_sessions",
  "subjects",
  "user_profiles",
];

const expectedColumns = {
  app_settings: ["key", "value", "updated_at"],
  concept_progress: [
    "concept_id",
    "score",
    "status",
    "attempts_count",
    "correct_count",
    "last_practiced_at",
    "updated_at",
  ],
  concepts: ["id", "course_id", "name", "description", "order_index", "created_at"],
  course_analyses: [
    "id",
    "course_id",
    "detected_title",
    "detected_subject",
    "detected_level",
    "raw_json",
    "confidence",
    "validated_by_user",
    "created_at",
  ],
  course_pages: [
    "id",
    "course_id",
    "local_uri",
    "thumbnail_uri",
    "page_index",
    "rotation",
    "quality_status",
    "created_at",
  ],
  courses: [
    "id",
    "subject_id",
    "title",
    "grade",
    "status",
    "summary",
    "page_count",
    "last_reviewed_at",
    "created_at",
    "updated_at",
  ],
  exercise_attempts: [
    "id",
    "exercise_id",
    "session_id",
    "user_answer",
    "is_correct",
    "used_hint",
    "mistake_type",
    "response_time_ms",
    "created_at",
  ],
  exercises: [
    "id",
    "course_id",
    "concept_id",
    "type",
    "question",
    "expected_answer",
    "options_json",
    "hint",
    "explanation",
    "difficulty",
    "generated_from_weakness",
    "created_at",
  ],
  recommendations: [
    "id",
    "course_id",
    "concept_id",
    "type",
    "title",
    "description",
    "estimated_minutes",
    "priority",
    "completed_at",
    "created_at",
  ],
  revision_sheets: [
    "id",
    "course_id",
    "title",
    "summary",
    "content_json",
    "version",
    "created_at",
    "updated_at",
  ],
  session_reports: [
    "id",
    "session_id",
    "score",
    "correct_answers",
    "total_answers",
    "strong_concept_id",
    "weak_concept_id",
    "summary",
    "recommendation",
    "created_at",
  ],
  study_sessions: [
    "id",
    "course_id",
    "type",
    "status",
    "current_exercise_index",
    "started_at",
    "completed_at",
    "duration_seconds",
    "created_at",
  ],
  subjects: ["id", "name", "icon", "color", "is_default", "created_at"],
  user_profiles: [
    "id",
    "display_name",
    "age",
    "grade",
    "series",
    "school_name",
    "created_at",
    "updated_at",
  ],
};

const requiredMigrationFiles = [
  "20260725114524_quick_golden_guardian/migration.sql",
  "20260725153531_tranquil_skreet/migration.sql",
  "20260725165016_local_singleton_schema/migration.sql",
];

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function rows(db, sql) {
  return db.prepare(sql).all();
}

function scalar(db, sql) {
  const result = db.prepare(sql).get();
  const values = Object.values(result ?? {});
  return values[0];
}

function execMigration(db, relativePath) {
  const fullPath = join(migrationsDir, relativePath);
  assert(existsSync(fullPath), `Migration introuvable: ${relativePath}`);
  const sql = readFileSync(fullPath, "utf8");
  const statements = sql
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    db.exec(statement);
  }
}

function assertThrows(label, fn) {
  try {
    fn();
  } catch {
    return;
  }
  fail(`La contrainte attendue n'a pas rejeté: ${label}`);
}

function tableColumns(db, tableName) {
  return rows(db, `PRAGMA table_info(${tableName})`).map((row) => String(row.name));
}

function insertBaseRows(db) {
  db.exec(`
    INSERT INTO subjects (id, name, icon, color, is_default, created_at)
    VALUES ('subject-1', 'Mathématiques', 'calculator', '#D94B24', 0, '2026-07-25T00:00:00.000Z');

    INSERT INTO courses (id, subject_id, title, grade, status, summary, page_count, last_reviewed_at, created_at, updated_at)
    VALUES ('course-1', 'subject-1', 'Fonctions', '2nde', 'ready', NULL, 0, NULL, '2026-07-25T00:00:00.000Z', '2026-07-25T00:00:00.000Z');

    INSERT INTO course_pages (id, course_id, local_uri, thumbnail_uri, page_index, rotation, quality_status, created_at)
    VALUES ('page-1', 'course-1', 'file://page-1.jpg', NULL, 0, 0, 'good', '2026-07-25T00:00:00.000Z');

    INSERT INTO concepts (id, course_id, name, description, order_index, created_at)
    VALUES ('concept-1', 'course-1', 'Second degré', NULL, 0, '2026-07-25T00:00:00.000Z');

    INSERT INTO revision_sheets (id, course_id, title, summary, content_json, version, created_at, updated_at)
    VALUES ('sheet-1', 'course-1', 'Fiche', 'Résumé', '{}', 1, '2026-07-25T00:00:00.000Z', '2026-07-25T00:00:00.000Z');

    INSERT INTO exercises (id, course_id, concept_id, type, question, expected_answer, options_json, hint, explanation, difficulty, generated_from_weakness, created_at)
    VALUES ('exercise-1', 'course-1', 'concept-1', 'short_answer', 'Question', 'Réponse', NULL, NULL, 'Explication', 1, 0, '2026-07-25T00:00:00.000Z');

    INSERT INTO study_sessions (id, course_id, type, status, current_exercise_index, started_at, completed_at, duration_seconds, created_at)
    VALUES ('session-1', 'course-1', 'initial', 'active', 0, '2026-07-25T00:00:00.000Z', NULL, 0, '2026-07-25T00:00:00.000Z');

    INSERT INTO session_reports (id, session_id, score, correct_answers, total_answers, strong_concept_id, weak_concept_id, summary, recommendation, created_at)
    VALUES ('report-1', 'session-1', 1, 1, 1, 'concept-1', 'concept-1', 'Résumé', 'Continuer', '2026-07-25T00:00:00.000Z');
  `);
}

const db = new DatabaseSync(dbPath);

try {
  db.exec("PRAGMA foreign_keys = ON");

  for (const migrationFile of requiredMigrationFiles) {
    execMigration(db, migrationFile);
  }

  db.exec("PRAGMA foreign_keys = ON");

  const actualTables = rows(
    db,
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  ).map((row) => String(row.name));

  assert(
    JSON.stringify(actualTables) === JSON.stringify([...businessTables].sort()),
    `Tables finales inattendues: ${actualTables.join(", ")}`,
  );
  assert(!actualTables.includes("users_table"), "users_table existe encore");

  for (const tableName of businessTables) {
    const count = Number(scalar(db, `SELECT COUNT(*) FROM ${tableName}`));
    assert(count === 0, `La table ${tableName} contient des données après migration neuve`);

    const actualColumns = tableColumns(db, tableName);
    const wantedColumns = expectedColumns[tableName];
    assert(
      JSON.stringify(actualColumns) === JSON.stringify(wantedColumns),
      `Colonnes inattendues pour ${tableName}: ${actualColumns.join(", ")}`,
    );

    for (const forbidden of ["profile_id", "user_id", "slug"]) {
      assert(!actualColumns.includes(forbidden), `${tableName}.${forbidden} ne doit pas exister`);
    }
  }

  const foreignKeyIssues = rows(db, "PRAGMA foreign_key_check");
  assert(foreignKeyIssues.length === 0, `foreign_key_check a retourné ${foreignKeyIssues.length} erreur(s)`);

  assertThrows("FK courses.subject_id", () => {
    db.exec(`
      INSERT INTO courses (id, subject_id, title, grade, status, summary, page_count, last_reviewed_at, created_at, updated_at)
      VALUES ('bad-course', 'missing-subject', 'Cours', '2nde', 'ready', NULL, 0, NULL, '2026-07-25T00:00:00.000Z', '2026-07-25T00:00:00.000Z')
    `);
  });

  insertBaseRows(db);

  assertThrows("user_profiles singleton", () => {
    db.exec(`
      INSERT INTO user_profiles (id, display_name, age, grade, series, school_name, created_at, updated_at)
      VALUES (2, 'Autre', 17, '2nde', NULL, NULL, '2026-07-25T00:00:00.000Z', '2026-07-25T00:00:00.000Z')
    `);
  });

  assertThrows("subjects.name unique", () => {
    db.exec(`
      INSERT INTO subjects (id, name, icon, color, is_default, created_at)
      VALUES ('subject-2', 'Mathématiques', 'book', '#2E7D70', 0, '2026-07-25T00:00:00.000Z')
    `);
  });

  assertThrows("course_pages course/page_index unique", () => {
    db.exec(`
      INSERT INTO course_pages (id, course_id, local_uri, thumbnail_uri, page_index, rotation, quality_status, created_at)
      VALUES ('page-2', 'course-1', 'file://page-2.jpg', NULL, 0, 0, 'good', '2026-07-25T00:00:00.000Z')
    `);
  });

  assertThrows("revision_sheets course/version unique", () => {
    db.exec(`
      INSERT INTO revision_sheets (id, course_id, title, summary, content_json, version, created_at, updated_at)
      VALUES ('sheet-2', 'course-1', 'Fiche 2', 'Résumé', '{}', 1, '2026-07-25T00:00:00.000Z', '2026-07-25T00:00:00.000Z')
    `);
  });

  assertThrows("session_reports one-to-one", () => {
    db.exec(`
      INSERT INTO session_reports (id, session_id, score, correct_answers, total_answers, strong_concept_id, weak_concept_id, summary, recommendation, created_at)
      VALUES ('report-2', 'session-1', 0, 0, 1, NULL, NULL, 'Résumé', 'Revoir', '2026-07-25T00:00:00.000Z')
    `);
  });

  console.log("db:verify OK");
  console.log(`Tables métier: ${businessTables.length}`);
  console.log("users_table absent");
  console.log("Aucune donnée métier insérée par les migrations");
  console.log("Contraintes FK, unicité et relation session/rapport vérifiées");
} finally {
  db.close();
  rmSync(tempDir, { recursive: true, force: true });
}

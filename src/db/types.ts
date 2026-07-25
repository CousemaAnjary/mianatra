import type * as schema from "./schema";

export type CourseStatus = "draft" | "processing" | "ready" | "archived";
export type PageQualityStatus = "good" | "blurry" | "unreadable";
export type ExerciseType =
  | "multiple_choice"
  | "short_answer"
  | "true_false"
  | "numeric"
  | "explanation";
export type WeaknessType =
  | "concept"
  | "method"
  | "calculation"
  | "graph_reading"
  | "memorization";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type StudySessionType = "initial" | "targeted" | "retry";
export type StudySessionStatus = "active" | "completed" | "abandoned";
export type ConceptProgressStatus =
  | "not_started"
  | "to_discover"
  | "in_progress"
  | "needs_reinforcement"
  | "mastered";
export type RecommendationType = "resume" | "targeted" | "new_course";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export function createUuid() {
  const cryptoObject = globalThis.crypto;

  if (typeof cryptoObject?.randomUUID === "function") {
    return cryptoObject.randomUUID();
  }

  if (typeof cryptoObject?.getRandomValues !== "function") {
    throw new Error("UUID generation requires crypto.getRandomValues support.");
  }

  const bytes = new Uint8Array(16);
  cryptoObject.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

export function nowIso() {
  return new Date().toISOString();
}

export function serializeJson(value: JsonValue) {
  return JSON.stringify(value);
}

export function parseJson<T extends JsonValue>(
  value: string | null,
  fallback: T,
  guard?: (parsed: unknown) => parsed is T,
) {
  if (!value) {
    return fallback;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (guard) {
      return guard(parsed) ? parsed : fallback;
    }

    return parsed as T;
  } catch {
    return fallback;
  }
}

export function ensureDifficulty(value: number): Difficulty {
  if (value < 1 || value > 5 || !Number.isInteger(value)) {
    throw new Error("Difficulty must be an integer between 1 and 5.");
  }

  return value as Difficulty;
}

export type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type UserProfile = typeof schema.userProfiles.$inferSelect;
export type NewUserProfile = typeof schema.userProfiles.$inferInsert;
export type Subject = typeof schema.subjects.$inferSelect;
export type NewSubject = typeof schema.subjects.$inferInsert;
export type Course = typeof schema.courses.$inferSelect;
export type NewCourse = typeof schema.courses.$inferInsert;
export type CoursePage = typeof schema.coursePages.$inferSelect;
export type NewCoursePage = typeof schema.coursePages.$inferInsert;
export type CourseAnalysis = typeof schema.courseAnalyses.$inferSelect;
export type NewCourseAnalysis = typeof schema.courseAnalyses.$inferInsert;
export type Concept = typeof schema.concepts.$inferSelect;
export type NewConcept = typeof schema.concepts.$inferInsert;
export type RevisionSheet = typeof schema.revisionSheets.$inferSelect;
export type NewRevisionSheet = typeof schema.revisionSheets.$inferInsert;
export type Exercise = typeof schema.exercises.$inferSelect;
export type NewExercise = typeof schema.exercises.$inferInsert;
export type StudySession = typeof schema.studySessions.$inferSelect;
export type NewStudySession = typeof schema.studySessions.$inferInsert;
export type ExerciseAttempt = typeof schema.exerciseAttempts.$inferSelect;
export type NewExerciseAttempt = typeof schema.exerciseAttempts.$inferInsert;
export type ConceptProgress = typeof schema.conceptProgress.$inferSelect;
export type NewConceptProgress = typeof schema.conceptProgress.$inferInsert;
export type SessionReport = typeof schema.sessionReports.$inferSelect;
export type NewSessionReport = typeof schema.sessionReports.$inferInsert;
export type Recommendation = typeof schema.recommendations.$inferSelect;
export type NewRecommendation = typeof schema.recommendations.$inferInsert;
export type AppSetting = typeof schema.appSettings.$inferSelect;
export type NewAppSetting = typeof schema.appSettings.$inferInsert;

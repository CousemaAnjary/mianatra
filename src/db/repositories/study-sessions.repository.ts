import { eq } from "drizzle-orm";
import { db } from "../client";
import { exerciseAttempts, sessionReports, studySessions } from "../schema";
import type { NewExerciseAttempt, NewSessionReport, NewStudySession, StudySessionStatus } from "../types";
import { createBaseFields, firstOrThrow, touchFields } from "./repository-utils";

export type StartStudySessionInput = Omit<NewStudySession, "id" | "status" | "startedAt" | "completedAt" | "createdAt" | "updatedAt">;
export type RecordAttemptInput = Omit<NewExerciseAttempt, "id" | "attemptedAt" | "createdAt" | "updatedAt">;
export type CreateSessionReportInput = Omit<NewSessionReport, "id" | "createdAt" | "updatedAt">;

export const studySessionsRepository = {
  start(input: StartStudySessionInput) {
    const now = new Date().toISOString();

    return firstOrThrow(
      db
        .insert(studySessions)
        .values({ ...createBaseFields(), ...input, status: "active", startedAt: now })
        .returning()
        .all(),
      "Unable to start study session.",
    );
  },

  findById(id: string) {
    return db.select().from(studySessions).where(eq(studySessions.id, id)).get();
  },

  setStatus(id: string, status: StudySessionStatus) {
    const completedAt = status === "completed" ? new Date().toISOString() : null;

    return firstOrThrow(
      db
        .update(studySessions)
        .set({ status, completedAt, ...touchFields() })
        .where(eq(studySessions.id, id))
        .returning()
        .all(),
      "Study session not found.",
    );
  },

  abandon(id: string) {
    return this.setStatus(id, "abandoned");
  },

  recordAttempt(input: RecordAttemptInput) {
    return firstOrThrow(
      db
        .insert(exerciseAttempts)
        .values({ ...createBaseFields(), ...input, attemptedAt: new Date().toISOString() })
        .returning()
        .all(),
      "Unable to record exercise attempt.",
    );
  },

  completeWithReport(sessionId: string, report: Omit<CreateSessionReportInput, "sessionId">) {
    return db.transaction((tx) => {
      const now = new Date().toISOString();
      const session = firstOrThrow(
        tx
          .update(studySessions)
          .set({ status: "completed", completedAt: now, ...touchFields() })
          .where(eq(studySessions.id, sessionId))
          .returning()
          .all(),
        "Study session not found.",
      );
      const sessionReport = firstOrThrow(
        tx
          .insert(sessionReports)
          .values({ ...createBaseFields(), ...report, sessionId })
          .returning()
          .all(),
        "Unable to create session report.",
      );

      return { session, report: sessionReport };
    });
  },

  getDetail(id: string) {
    return {
      session: this.findById(id),
      attempts: db.select().from(exerciseAttempts).where(eq(exerciseAttempts.sessionId, id)).all(),
      reports: db.select().from(sessionReports).where(eq(sessionReports.sessionId, id)).all(),
    };
  },
};

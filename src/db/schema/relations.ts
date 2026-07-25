import { defineRelations } from "drizzle-orm";
import { appSettings } from "./app-settings.table";
import { conceptProgress } from "./concept-progress.table";
import { concepts } from "./concepts.table";
import { courseAnalyses } from "./course-analyses.table";
import { coursePages } from "./course-pages.table";
import { courses } from "./courses.table";
import { exerciseAttempts } from "./exercise-attempts.table";
import { exercises } from "./exercises.table";
import { recommendations } from "./recommendations.table";
import { revisionSheets } from "./revision-sheets.table";
import { sessionReports } from "./session-reports.table";
import { studySessions } from "./study-sessions.table";
import { subjects } from "./subjects.table";
import { userProfiles } from "./user-profiles.table";

export const schemaTables = {
  appSettings,
  conceptProgress,
  concepts,
  courseAnalyses,
  coursePages,
  courses,
  exerciseAttempts,
  exercises,
  recommendations,
  revisionSheets,
  sessionReports,
  studySessions,
  subjects,
  userProfiles,
};

export const dbRelations = defineRelations(schemaTables, (r) => ({
  userProfiles: {
    courses: r.many.courses({ from: r.userProfiles.id, to: r.courses.profileId }),
    progress: r.many.conceptProgress({ from: r.userProfiles.id, to: r.conceptProgress.profileId }),
    recommendations: r.many.recommendations({ from: r.userProfiles.id, to: r.recommendations.profileId }),
    sessions: r.many.studySessions({ from: r.userProfiles.id, to: r.studySessions.profileId }),
  },
  subjects: {
    courses: r.many.courses({ from: r.subjects.id, to: r.courses.subjectId }),
  },
  courses: {
    profile: r.one.userProfiles({ from: r.courses.profileId, to: r.userProfiles.id, optional: false }),
    subject: r.one.subjects({ from: r.courses.subjectId, to: r.subjects.id, optional: false }),
    pages: r.many.coursePages({ from: r.courses.id, to: r.coursePages.courseId }),
    analyses: r.many.courseAnalyses({ from: r.courses.id, to: r.courseAnalyses.courseId }),
    concepts: r.many.concepts({ from: r.courses.id, to: r.concepts.courseId }),
    revisionSheets: r.many.revisionSheets({ from: r.courses.id, to: r.revisionSheets.courseId }),
    exercises: r.many.exercises({ from: r.courses.id, to: r.exercises.courseId }),
    sessions: r.many.studySessions({ from: r.courses.id, to: r.studySessions.courseId }),
    recommendations: r.many.recommendations({ from: r.courses.id, to: r.recommendations.courseId }),
  },
  coursePages: {
    course: r.one.courses({ from: r.coursePages.courseId, to: r.courses.id, optional: false }),
  },
  courseAnalyses: {
    course: r.one.courses({ from: r.courseAnalyses.courseId, to: r.courses.id, optional: false }),
  },
  concepts: {
    course: r.one.courses({ from: r.concepts.courseId, to: r.courses.id, optional: false }),
    exercises: r.many.exercises({ from: r.concepts.id, to: r.exercises.conceptId }),
    progress: r.many.conceptProgress({ from: r.concepts.id, to: r.conceptProgress.conceptId }),
  },
  revisionSheets: {
    course: r.one.courses({ from: r.revisionSheets.courseId, to: r.courses.id, optional: false }),
  },
  exercises: {
    course: r.one.courses({ from: r.exercises.courseId, to: r.courses.id, optional: false }),
    concept: r.one.concepts({ from: r.exercises.conceptId, to: r.concepts.id }),
    attempts: r.many.exerciseAttempts({ from: r.exercises.id, to: r.exerciseAttempts.exerciseId }),
  },
  studySessions: {
    profile: r.one.userProfiles({ from: r.studySessions.profileId, to: r.userProfiles.id, optional: false }),
    course: r.one.courses({ from: r.studySessions.courseId, to: r.courses.id, optional: false }),
    attempts: r.many.exerciseAttempts({ from: r.studySessions.id, to: r.exerciseAttempts.sessionId }),
    report: r.many.sessionReports({ from: r.studySessions.id, to: r.sessionReports.sessionId }),
  },
  exerciseAttempts: {
    session: r.one.studySessions({ from: r.exerciseAttempts.sessionId, to: r.studySessions.id, optional: false }),
    exercise: r.one.exercises({ from: r.exerciseAttempts.exerciseId, to: r.exercises.id, optional: false }),
  },
  conceptProgress: {
    profile: r.one.userProfiles({ from: r.conceptProgress.profileId, to: r.userProfiles.id, optional: false }),
    concept: r.one.concepts({ from: r.conceptProgress.conceptId, to: r.concepts.id, optional: false }),
  },
  sessionReports: {
    session: r.one.studySessions({ from: r.sessionReports.sessionId, to: r.studySessions.id, optional: false }),
  },
  recommendations: {
    profile: r.one.userProfiles({ from: r.recommendations.profileId, to: r.userProfiles.id, optional: false }),
    course: r.one.courses({ from: r.recommendations.courseId, to: r.courses.id }),
  },
}));

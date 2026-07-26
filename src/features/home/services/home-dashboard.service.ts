import type { Course, Exercise, StudySession, UserProfile } from "@/src/db";
import { ProfileNotFoundError } from "@/src/features/shared";
import type { SubjectOverviewItem } from "@/src/features/subjects";
import { loadSubjectOverviews } from "@/src/features/subjects";
import type { HomeDashboard, HomeDashboardActiveSession, HomeDashboardSubject } from "../types/home-dashboard.types";

type HomeDashboardDeps = {
  profile: {
    getProfile: () => Promise<UserProfile>;
  };
  subjectsOverview: {
    loadSubjectOverviews: () => Promise<SubjectOverviewItem[]>;
  };
  courses: {
    findById: (id: string) => Promise<Course | null>;
  };
  exercises: {
    findAllByCourse: (courseId: string) => Promise<Exercise[]>;
  };
  sessions: {
    findActive: () => Promise<StudySession[]>;
  };
};

function toHomeSubject(item: SubjectOverviewItem): HomeDashboardSubject {
  return {
    id: item.id,
    name: item.name,
    color: item.color,
    iconName: item.iconName,
    chapterCount: item.chapterCount,
    progress: item.progress,
    mainWeakness: item.mainWeakness,
    updatedAt: item.updatedAt,
  };
}

function sessionDate(session: StudySession) {
  return session.startedAt || session.createdAt;
}

async function toActiveSession(
  session: StudySession,
  dependencies: Pick<HomeDashboardDeps, "courses" | "exercises">,
): Promise<HomeDashboardActiveSession | null> {
  const course = await dependencies.courses.findById(session.courseId);
  if (!course || course.status === "archived") {
    return null;
  }
  const exercises = await dependencies.exercises.findAllByCourse(session.courseId);
  return {
    id: session.id,
    courseId: session.courseId,
    courseTitle: course.title,
    currentExerciseIndex: session.currentExerciseIndex,
    totalExercises: exercises.length,
  };
}

export function createHomeDashboardService(dependencies: HomeDashboardDeps) {
  return {
    loadHomeDashboard: async (): Promise<HomeDashboard> => {
      const profile = await dependencies.profile.getProfile();
      if (!profile) {
        throw new ProfileNotFoundError();
      }

      const subjects = await dependencies.subjectsOverview.loadSubjectOverviews();
      const activeSessions = (await dependencies.sessions.findActive()).sort((left, right) =>
        sessionDate(right).localeCompare(sessionDate(left)),
      );
      let activeSession: HomeDashboardActiveSession | null = null;
      for (const session of activeSessions) {
        activeSession = await toActiveSession(session, dependencies);
        if (activeSession) {
          break;
        }
      }

      return {
        displayName: profile.displayName,
        recentSubjects: subjects.slice(0, 3).map(toHomeSubject),
        activeSession,
      };
    },
  };
}

export async function loadHomeDashboard() {
  const { coursesRepository, exercisesRepository, studySessionsRepository } = await import("@/src/db");
  const { getProfile } = await import("@/src/features/profile");
  return createHomeDashboardService({
    profile: { getProfile },
    subjectsOverview: { loadSubjectOverviews },
    courses: coursesRepository,
    exercises: exercisesRepository,
    sessions: studySessionsRepository,
  }).loadHomeDashboard();
}

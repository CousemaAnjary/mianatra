import type { Course, Exercise, StudySession, UserProfile } from "@/src/db";
import { ProfileNotFoundError } from "@/src/features/shared";
import type { CourseListItem } from "@/src/features/courses";
import { loadCoursesList } from "@/src/features/courses/services/courses-list-view.service";
import type { HomeDashboard, HomeDashboardActiveSession, HomeDashboardCourse } from "../types/home-dashboard.types";

type HomeDashboardDeps = {
  profile: {
    getProfile: () => Promise<UserProfile>;
  };
  coursesList: {
    loadCoursesList: () => Promise<CourseListItem[]>;
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

function toHomeCourse(item: CourseListItem): HomeDashboardCourse {
  return {
    id: item.id,
    title: item.title,
    subject: item.subject,
    subjectColor: item.subjectColor,
    iconName: item.iconName,
    grade: item.grade,
    pageCount: item.pageCount,
    progress: item.progress,
    status: item.status,
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

      const courses = await dependencies.coursesList.loadCoursesList();
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
        recentCourses: courses.slice(0, 3).map(toHomeCourse),
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
    coursesList: { loadCoursesList },
    courses: coursesRepository,
    exercises: exercisesRepository,
    sessions: studySessionsRepository,
  }).loadHomeDashboard();
}

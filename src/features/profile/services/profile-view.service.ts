import type { Course, CourseDetail, StudySession, UserProfile } from "@/src/db";
import { buildCourseProgressSummary } from "@/src/features/progress/domain";
import { ProfileNotFoundError } from "@/src/features/shared";
import type { ProfileInput } from "../schemas/profile.schemas";
import { validateOnboardingProfileForm, type OnboardingProfileForm } from "./onboarding-profile.service";
import type { ProfileViewData, ProfileViewStatistics } from "../types/profile-view.types";

type ProfileViewDeps = {
  profile: {
    getProfile: () => Promise<UserProfile>;
    updateProfile: (input: ProfileInput) => Promise<UserProfile>;
  };
  courses: {
    findAll: () => Promise<Course[]>;
    findDetailById: (id: string) => Promise<CourseDetail | null>;
  };
  sessions: {
    findAll: () => Promise<StudySession[]>;
  };
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function emptyStatistics(): ProfileViewStatistics {
  return {
    courseCount: 0,
    completedSessionCount: 0,
    averageProgress: 0,
    masteredConceptCount: 0,
    progressingConceptCount: 0,
    needsWorkConceptCount: 0,
    notStartedConceptCount: 0,
  };
}

function buildStatistics(input: {
  courses: Course[];
  details: CourseDetail[];
  sessions: StudySession[];
}): ProfileViewStatistics {
  const activeCourses = input.courses.filter((course) => course.status !== "archived");
  const statistics = emptyStatistics();
  const activeCourseIds = new Set(activeCourses.map((course) => course.id));
  const summary = buildCourseProgressSummary(input.details.flatMap((detail) => detail.concepts));
  statistics.courseCount = activeCourses.length;
  statistics.completedSessionCount = input.sessions.filter((session) => session.status === "completed" && activeCourseIds.has(session.courseId)).length;
  statistics.averageProgress = clampProgress(summary.progress);
  statistics.masteredConceptCount = summary.mastered;
  statistics.progressingConceptCount = summary.progressing;
  statistics.needsWorkConceptCount = summary.needsWork;
  statistics.notStartedConceptCount = summary.notStarted;

  return statistics;
}

function toViewData(profile: UserProfile, statistics: ProfileViewStatistics): ProfileViewData {
  return {
    displayName: profile.displayName,
    age: profile.age,
    grade: profile.grade,
    series: profile.series,
    schoolName: profile.schoolName,
    statistics,
  };
}

export function createProfileViewService(dependencies: ProfileViewDeps) {
  return {
    loadProfileView: async (): Promise<ProfileViewData> => {
      const profile = await dependencies.profile.getProfile();
      if (!profile) {
        throw new ProfileNotFoundError();
      }
      const [courses, sessions] = await Promise.all([
        dependencies.courses.findAll(),
        dependencies.sessions.findAll(),
      ]);
      const activeCourses = courses.filter((course) => course.status !== "archived");
      const details = (
        await Promise.all(activeCourses.map((course) => dependencies.courses.findDetailById(course.id)))
      ).filter((detail): detail is CourseDetail => detail !== null);
      return toViewData(profile, buildStatistics({ courses, details, sessions }));
    },
    updateProfileFromForm: async (form: OnboardingProfileForm) => {
      const validation = validateOnboardingProfileForm(form);
      if (!validation.success) {
        return validation;
      }
      await dependencies.profile.updateProfile(validation.input);
      return validation;
    },
  };
}

export async function loadProfileView() {
  const { coursesRepository, studySessionsRepository } = await import("@/src/db");
  const { getProfile, updateProfile } = await import("./profile.service");
  return createProfileViewService({
    profile: { getProfile, updateProfile },
    courses: coursesRepository,
    sessions: studySessionsRepository,
  }).loadProfileView();
}

export async function updateProfileFromForm(form: OnboardingProfileForm) {
  const { coursesRepository, studySessionsRepository } = await import("@/src/db");
  const { getProfile, updateProfile } = await import("./profile.service");
  return createProfileViewService({
    profile: { getProfile, updateProfile },
    courses: coursesRepository,
    sessions: studySessionsRepository,
  }).updateProfileFromForm(form);
}

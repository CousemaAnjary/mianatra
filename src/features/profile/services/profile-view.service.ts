import type { ConceptProgress, Course, StudySession, UserProfile } from "@/src/db";
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
  };
  progress: {
    findAllByCourse: (courseId: string) => Promise<ConceptProgress[]>;
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
  };
}

function buildStatistics(input: {
  courses: Course[];
  progressRows: ConceptProgress[];
  sessions: StudySession[];
}): ProfileViewStatistics {
  const activeCourses = input.courses.filter((course) => course.status !== "archived");
  const statistics = emptyStatistics();
  statistics.courseCount = activeCourses.length;
  statistics.completedSessionCount = input.sessions.filter((session) => session.status === "completed").length;

  if (input.progressRows.length > 0) {
    statistics.averageProgress = clampProgress(
      input.progressRows.reduce((sum, row) => sum + row.score, 0) / input.progressRows.length,
    );
  }

  for (const row of input.progressRows) {
    if (row.status === "mastered") {
      statistics.masteredConceptCount += 1;
    } else if (row.status === "in_progress") {
      statistics.progressingConceptCount += 1;
    } else if (row.status === "needs_reinforcement") {
      statistics.needsWorkConceptCount += 1;
    }
  }

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
      const progressRows = (
        await Promise.all(activeCourses.map((course) => dependencies.progress.findAllByCourse(course.id)))
      ).flat();
      return toViewData(profile, buildStatistics({ courses, progressRows, sessions }));
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
  const { coursesRepository, progressRepository, studySessionsRepository } = await import("@/src/db");
  const { getProfile, updateProfile } = await import("./profile.service");
  return createProfileViewService({
    profile: { getProfile, updateProfile },
    courses: coursesRepository,
    progress: progressRepository,
    sessions: studySessionsRepository,
  }).loadProfileView();
}

export async function updateProfileFromForm(form: OnboardingProfileForm) {
  const { coursesRepository, progressRepository, studySessionsRepository } = await import("@/src/db");
  const { getProfile, updateProfile } = await import("./profile.service");
  return createProfileViewService({
    profile: { getProfile, updateProfile },
    courses: coursesRepository,
    progress: progressRepository,
    sessions: studySessionsRepository,
  }).updateProfileFromForm(form);
}

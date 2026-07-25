import type { CourseDetail } from "@/src/db";

export type CourseResultCounters = {
  mastered: number;
  progressing: number;
  needsWork: number;
};

export type CourseRecentActivity = {
  id: string;
  title: string;
  score: number;
  iconName: string;
};

export type CourseRouteResults = {
  counters: CourseResultCounters;
  progress: number;
  recentActivities: CourseRecentActivity[];
};

export type RealCourseResultsState =
  | { status: "missing" }
  | { status: "ready"; courseTitle: string; results: CourseRouteResults };

export const emptyCourseResultCounters: CourseResultCounters = {
  mastered: 0,
  progressing: 0,
  needsWork: 0,
};

export function isExplicitDemoId(id: string | undefined, demoIds: readonly string[]) {
  return id !== undefined && demoIds.includes(id);
}

export function resolveExerciseSessionTarget(input: {
  isDemoCourse: boolean;
  demoSessionId: string;
  realSessionId: string | null;
}) {
  if (input.isDemoCourse) {
    return input.demoSessionId;
  }
  return input.realSessionId;
}

export function buildRealCourseResults(detail: Pick<CourseDetail, "course" | "concepts">): CourseRouteResults {
  const progressRows = detail.concepts
    .map((concept) => ({ concept, progress: concept.progress }))
    .filter((item): item is { concept: CourseDetail["concepts"][number]; progress: NonNullable<CourseDetail["concepts"][number]["progress"]> } =>
      item.progress !== null,
    );

  if (progressRows.length === 0) {
    return {
      counters: emptyCourseResultCounters,
      progress: 0,
      recentActivities: [],
    };
  }

  const counters = progressRows.reduce<CourseResultCounters>(
    (acc, item) => {
      if (item.progress.status === "mastered") {
        acc.mastered += 1;
      } else if (item.progress.status === "needs_reinforcement") {
        acc.needsWork += 1;
      } else if (item.progress.status === "in_progress") {
        acc.progressing += 1;
      }
      return acc;
    },
    { ...emptyCourseResultCounters },
  );
  const progress = Math.round(progressRows.reduce((sum, item) => sum + item.progress.score, 0) / progressRows.length);
  const recentActivities = progressRows
    .filter((item) => item.progress.attemptsCount > 0)
    .sort((left, right) => String(right.progress.lastPracticedAt ?? right.progress.updatedAt).localeCompare(String(left.progress.lastPracticedAt ?? left.progress.updatedAt)))
    .slice(0, 3)
    .map((item) => ({
      id: item.concept.id,
      title: item.concept.name,
      score: Math.round(item.progress.score),
      iconName: item.progress.status === "mastered" ? "check-circle" : item.progress.status === "needs_reinforcement" ? "exclamation-circle" : "chart-line",
    }));

  return { counters, progress, recentActivities };
}

export async function loadRealCourseResults(courseId: string): Promise<RealCourseResultsState> {
  const { coursesRepository } = await import("@/src/db");
  const detail = await coursesRepository.findDetailById(courseId);
  if (!detail) {
    return { status: "missing" };
  }
  return {
    status: "ready",
    courseTitle: detail.course.title,
    results: buildRealCourseResults(detail),
  };
}

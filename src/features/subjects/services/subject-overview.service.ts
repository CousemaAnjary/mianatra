import type { Course, CourseDetail, Subject } from "@/src/db";
import type { CourseListItem } from "@/src/features/courses";
import { buildRealCourseResults } from "@/src/features/courses/services/course-route-state.service";
import type { SubjectDetailView, SubjectOverviewItem } from "../types/subject-overview.types";

type SubjectOverviewDeps = {
  subjects: {
    findAll: () => Promise<Subject[]>;
    findById: (id: string) => Promise<Subject | null>;
  };
  courses: {
    findAll: () => Promise<Course[]>;
    findAllBySubject: (subjectId: string) => Promise<Course[]>;
    findDetailById: (id: string) => Promise<CourseDetail | null>;
  };
};

function normalizedIcon(subject: Subject) {
  return subject.icon.trim() || null;
}

function normalizedColor(subject: Subject) {
  return subject.color.trim() || null;
}

function latestDate(values: (string | null | undefined)[]) {
  return values.filter((value): value is string => Boolean(value)).sort((left, right) => right.localeCompare(left))[0] ?? null;
}

function uniqueSortedGrades(courses: readonly Course[]) {
  return Array.from(new Set(courses.map((course) => course.grade.trim()).filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, value));
}

function mainWeakness(details: readonly CourseDetail[]) {
  const weaknesses = details
    .flatMap((detail) =>
      detail.concepts
        .filter((concept) => concept.progress?.status === "needs_reinforcement")
        .map((concept) => ({
          name: concept.name,
          score: concept.progress?.score ?? 0,
          updatedAt: String(concept.progress?.lastPracticedAt ?? concept.progress?.updatedAt ?? ""),
        })),
    )
    .sort((left, right) => left.score - right.score || right.updatedAt.localeCompare(left.updatedAt));

  return weaknesses[0]?.name ?? null;
}

function toCourseListItem(detail: CourseDetail): CourseListItem {
  const results = buildRealCourseResults(detail);
  return {
    id: detail.course.id,
    title: detail.course.title,
    subject: detail.subject?.name?.trim() || "Matière inconnue",
    subjectColor: detail.subject?.color?.trim() || null,
    iconName: detail.subject?.icon?.trim() || "book-open",
    grade: detail.course.grade,
    pageCount: detail.course.pageCount,
    progress: results.progress,
    masteredCount: results.counters.mastered,
    progressingCount: results.counters.progressing,
    needsWorkCount: results.counters.needsWork,
    status: detail.course.status as CourseListItem["status"],
    lastReviewedAt: detail.course.lastReviewedAt,
    updatedAt: detail.course.updatedAt,
  };
}

function buildSubjectOverview(subject: Subject, courses: readonly Course[], details: readonly CourseDetail[]): SubjectOverviewItem {
  const courseResults = details.map((detail) => buildRealCourseResults(detail));
  const masteredCount = courseResults.reduce((sum, result) => sum + result.counters.mastered, 0);
  const progressingCount = courseResults.reduce((sum, result) => sum + result.counters.progressing, 0);
  const needsWorkCount = courseResults.reduce((sum, result) => sum + result.counters.needsWork, 0);
  // La progression matière est la moyenne simple des progressions de ses chapitres actifs.
  const progress =
    courseResults.length > 0
      ? clampProgress(Math.round(courseResults.reduce((sum, result) => sum + result.progress, 0) / courseResults.length))
      : 0;

  return {
    id: subject.id,
    name: subject.name,
    color: normalizedColor(subject),
    iconName: normalizedIcon(subject),
    chapterCount: courses.length,
    progress,
    masteredCount,
    progressingCount,
    needsWorkCount,
    mainWeakness: mainWeakness(details),
    lastReviewedAt: latestDate(courses.map((course) => course.lastReviewedAt)),
    updatedAt: latestDate(courses.map((course) => course.updatedAt)) ?? subject.createdAt,
    grades: uniqueSortedGrades(courses),
  };
}

export function buildSubjectGradeFilters(items: readonly Pick<SubjectOverviewItem, "grades">[]) {
  const grades = items.flatMap((item) => item.grades);
  return ["Tous", ...Array.from(new Set(grades)).sort((left, right) => left.localeCompare(right))];
}

export function createSubjectOverviewService(dependencies: SubjectOverviewDeps) {
  async function loadNonArchivedCourseDetails(courses: Course[]) {
    const activeCourses = courses.filter((course) => course.status !== "archived");
    const details = await Promise.all(activeCourses.map((course) => dependencies.courses.findDetailById(course.id)));
    return {
      activeCourses,
      detailsByCourseId: new Map(details.filter((detail): detail is CourseDetail => detail !== null).map((detail) => [detail.course.id, detail])),
    };
  }

  return {
    loadSubjectOverviews: async (): Promise<SubjectOverviewItem[]> => {
      const [subjects, allCourses] = await Promise.all([dependencies.subjects.findAll(), dependencies.courses.findAll()]);
      const { activeCourses, detailsByCourseId } = await loadNonArchivedCourseDetails(allCourses);

      return subjects
        .map((subject) => {
          const subjectCourses = activeCourses.filter((course) => course.subjectId === subject.id);
          if (subjectCourses.length === 0) {
            return null;
          }
          const subjectDetails = subjectCourses
            .map((course) => detailsByCourseId.get(course.id))
            .filter((detail): detail is CourseDetail => detail !== undefined);
          return buildSubjectOverview(subject, subjectCourses, subjectDetails);
        })
        .filter((item): item is SubjectOverviewItem => item !== null)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
    loadSubjectDetail: async (subjectId: string): Promise<SubjectDetailView | null> => {
      const subject = await dependencies.subjects.findById(subjectId);
      if (!subject) {
        return null;
      }

      const allSubjectCourses = await dependencies.courses.findAllBySubject(subjectId);
      const { activeCourses, detailsByCourseId } = await loadNonArchivedCourseDetails(allSubjectCourses);
      const details = activeCourses
        .map((course) => detailsByCourseId.get(course.id))
        .filter((detail): detail is CourseDetail => detail !== undefined);
      const overview = buildSubjectOverview(subject, activeCourses, details);
      const chapters = details.map(toCourseListItem).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
      return { subject: overview, chapters };
    },
  };
}

async function getDeps(): Promise<SubjectOverviewDeps> {
  const repositories = await import("@/src/db");
  return { subjects: repositories.subjectsRepository, courses: repositories.coursesRepository };
}

export async function loadSubjectOverviews() {
  return createSubjectOverviewService(await getDeps()).loadSubjectOverviews();
}

export async function loadSubjectDetail(subjectId: string) {
  return createSubjectOverviewService(await getDeps()).loadSubjectDetail(subjectId);
}

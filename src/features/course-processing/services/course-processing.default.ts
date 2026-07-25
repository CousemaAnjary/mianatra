import { analyzeCoursePage, analyzeCoursePages, persistCourseAnalysis, type AnalyzeCoursePagesInput } from "@/src/features/course-analysis";
import { createConfiguredMobileAIService } from "@/src/features/ai-settings";
import { generateCourseExercises } from "@/src/features/exercises";
import { generateCourseRevisionSheet } from "@/src/features/revision-sheet";
import { prepareCoursePageImage } from "../utils/page-image";
import type { CourseProcessingDeps } from "./course-processing.controller";

export async function createDefaultCourseProcessingDeps(): Promise<CourseProcessingDeps> {
  const repositories = await import("@/src/db");

  return {
    courses: repositories.coursesRepository,
    pages: {
      findAllByCourse: repositories.pagesRepository.findAllByCourse,
      prepare: prepareCoursePageImage,
    },
    analysis: {
      analyzeCoursePages: (input: AnalyzeCoursePagesInput, onPageDone: () => void) =>
        analyzeCoursePages(input, {
          analyzeSinglePage: async (pageInput) => {
            try {
              return await analyzeCoursePage(pageInput, { aiService: createConfiguredMobileAIService });
            } finally {
              onPageDone();
            }
          },
        }),
      persistCourseAnalysis: (input) =>
        persistCourseAnalysis(input, {
          courses: repositories.coursesRepository,
          subjects: repositories.subjectsRepository,
          analyses: repositories.analysesRepository,
        }),
    },
    generation: {
      generateRevisionSheet: async (courseId) => ({
        sheet: (await generateCourseRevisionSheet(courseId, {
          aiService: createConfiguredMobileAIService,
          courses: repositories.coursesRepository,
          revisionSheets: repositories.revisionSheetsRepository,
        })).sheet,
      }),
      generateExercises: async (courseId) => ({
        exercises: (await generateCourseExercises(courseId, { count: 3 }, {
          aiService: createConfiguredMobileAIService,
          courses: repositories.coursesRepository,
          exercises: repositories.exercisesRepository,
        })).exercises,
      }),
    },
  };
}

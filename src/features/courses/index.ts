export {
  archiveCourse,
  courseService,
  createCourseService,
  createDraftCourse,
  deleteCourse,
  buildRealCourseResults,
  emptyCourseResultCounters,
  getCourse,
  getCourseDetail,
  isExplicitDemoId,
  loadRealCourseResults,
  listCourses,
  listCoursesBySubject,
  renameCourse,
  resolveExerciseSessionTarget,
  updateCourse,
} from "./services/course.service";
export type { CourseInput, CoursePatch, CourseRecentActivity, CourseResultCounters, CourseRouteResults, RealCourseResultsState } from "./services/course.service";

export type HomeDashboardCourse = {
  id: string;
  title: string;
  subject: string;
  subjectColor: string | null;
  iconName: string | null;
  grade: string;
  pageCount: number;
  progress: number;
  status: "draft" | "processing" | "ready";
  updatedAt: string;
};

export type HomeDashboardActiveSession = {
  id: string;
  courseId: string;
  courseTitle: string;
  currentExerciseIndex: number;
  totalExercises: number;
};

export type HomeDashboard = {
  displayName: string;
  recentCourses: HomeDashboardCourse[];
  activeSession: HomeDashboardActiveSession | null;
};

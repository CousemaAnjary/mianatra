export type ProfileViewStatistics = {
  courseCount: number;
  completedSessionCount: number;
  averageProgress: number;
  masteredConceptCount: number;
  progressingConceptCount: number;
  needsWorkConceptCount: number;
};

export type ProfileViewData = {
  displayName: string;
  age: number;
  grade: string;
  series: string | null;
  schoolName: string | null;
  statistics: ProfileViewStatistics;
};

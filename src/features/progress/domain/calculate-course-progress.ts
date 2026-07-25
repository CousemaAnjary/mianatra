import type { ConceptProgress } from "@/src/db";

export function calculateCourseProgress(progressRows: Pick<ConceptProgress, "score">[]) {
  if (progressRows.length === 0) {
    return 0;
  }
  const total = progressRows.reduce((sum, row) => sum + row.score * 100, 0);
  return Math.round(total / progressRows.length);
}

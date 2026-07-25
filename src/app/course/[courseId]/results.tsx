import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppButton, AppCard, AppScreen, AppText, ProgressBar } from "@/src/components/shared";
import { CourseProgressRing, CourseTopBar } from "@/src/features/courses/components";
import { CourseResultSummary, RecentActivityList } from "@/src/features/progress/components";
import { demoCourseResults, demoCourses, demoSession } from "@/src/data/demo-data";
import { spacing } from "@/src/theme";

export function generateStaticParams(): Record<string, string>[] {
  return demoCourses.map((course) => ({ courseId: course.id }));
}

export default function CourseResultsScreen() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const course = demoCourses.find((demoItem) => demoItem.id === courseId);
  const results = demoCourseResults.courseId === courseId ? demoCourseResults : undefined;

  if (!course || !results) {
    return (
      <AppScreen contentStyle={styles.screen}>
        <CourseTopBar title="Mes résultats" />
        <AppCard style={styles.card}>
          <AppText variant="subtitle">Résultats indisponibles</AppText>
          <AppText tone="secondary">
            {"Aucun résultat de démonstration n'est disponible pour ce cours."}
          </AppText>
          <AppButton
            title="Retour aux cours"
            iconName="arrow-left"
            onPress={() => router.replace("/courses")}
          />
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen contentStyle={styles.screen}>
      <CourseTopBar title="Mes résultats" />
      <View style={styles.titleBlock}>
        <AppText variant="title">Mes résultats</AppText>
        <AppText variant="subtitle" tone="secondary">
          {course.title}
        </AppText>
      </View>

      <CourseResultSummary counters={results.counters} />

      <AppCard style={styles.progressCard}>
        <AppText variant="subtitle">Progression du chapitre</AppText>
        <View style={styles.progressRow}>
          <CourseProgressRing value={results.progress} size={88} />
          <View style={styles.progressLine}>
            <ProgressBar
              value={results.progress}
              accessibilityLabel={`Progression du chapitre : ${results.progress} pour cent`}
            />
            <AppText tone="secondary">{results.progress} % de progression de démonstration.</AppText>
          </View>
        </View>
      </AppCard>

      <RecentActivityList activities={results.recentActivities} />

      <AppButton
        title="Reprendre avec des exercices"
        iconName="pen"
        variant="secondary"
        onPress={() =>
          router.push({
            pathname: "/session/[sessionId]",
            params: { sessionId: demoSession.id },
          })
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing[5],
    paddingBottom: spacing[8],
  },
  titleBlock: {
    gap: spacing[2],
  },
  card: {
    gap: spacing[3],
  },
  progressCard: {
    gap: spacing[4],
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  progressLine: {
    flex: 1,
    gap: spacing[2],
  },
});

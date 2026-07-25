import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
} from "@/src/components/shared";
import {
  CourseActionTabs,
  CourseProgressCard,
  CourseSummary,
  CourseTopBar,
} from "@/src/features/courses/components";
import { demoCourseResults, demoCourses, demoSession } from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";

export function generateStaticParams(): Record<string, string>[] {
  return demoCourses.map((course) => ({ courseId: course.id }));
}

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const course = demoCourses.find((demoItem) => demoItem.id === courseId);

  if (!course) {
    return (
      <AppScreen contentStyle={styles.screen}>
        <CourseTopBar title="Cours introuvable" />
        <AppCard style={styles.card}>
          <AppText variant="subtitle">Cours introuvable</AppText>
          <AppText tone="secondary">
            {"Ce cours de démonstration n'existe pas ou n'est pas disponible."}
          </AppText>
          <AppButton title="Retour à Mes cours" onPress={() => router.replace("/courses")} />
        </AppCard>
      </AppScreen>
    );
  }

  const summaryItems = course.summary ?? [];

  function showOptions() {
    Alert.alert(
      "Options du cours",
      "Renommer — disponible prochainement\nArchiver — disponible prochainement\nSupprimer — disponible prochainement",
    );
  }

  return (
    <AppScreen contentStyle={styles.screen}>
      <CourseTopBar title={course.subject} onOptionsPress={showOptions} />

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <AppText variant="title">{course.title}</AppText>
          <AppText variant="subtitle" tone="secondary">
            {course.pageCount} pages de cours • Dernière révision : {course.lastRevision}
          </AppText>
        </View>
        <Image
          source={require("../../../../assets/mianatra/illustration_student_reading.png")}
          accessibilityLabel="Élève lisant son cours"
          accessibilityIgnoresInvertColors
          style={styles.heroImage}
        />
      </View>

      <CourseProgressCard
        progress={course.progress}
        mastered={demoCourseResults.counters.mastered}
        progressing={demoCourseResults.counters.progressing}
        needsWork={demoCourseResults.counters.needsWork}
      />

      <CourseActionTabs
        tabs={[
          {
            id: "revision",
            label: "Ma fiche",
            iconName: "file-alt",
            onPress: () =>
              router.push({
                pathname: "/course/[courseId]/revision-sheet",
                params: { courseId: course.id },
              }),
          },
          {
            id: "exercises",
            label: "Mes exercices",
            iconName: "chart-line",
            onPress: () =>
              router.push({
                pathname: "/session/[sessionId]",
                params: { sessionId: demoSession.id },
              }),
          },
          {
            id: "results",
            label: "Mes résultats",
            iconName: "link",
            onPress: () =>
              router.push({
                pathname: "/course/[courseId]/results",
                params: { courseId: course.id },
              }),
          },
        ]}
      />

      <CourseSummary items={summaryItems} />

      <AppButton
        title="Réviser le cours"
        onPress={() =>
          router.push({
            pathname: "/course/[courseId]/revision-sheet",
            params: { courseId: course.id },
          })
        }
      />
      <View style={styles.secondaryActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Faire des exercices"
          onPress={() =>
            router.push({
              pathname: "/session/[sessionId]",
              params: { sessionId: demoSession.id },
            })
          }
          style={styles.secondaryButton}
        >
          <AppText variant="label">Faire des exercices</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voir mes erreurs"
          onPress={() =>
            router.push({
              pathname: "/session/[sessionId]/correction",
              params: { sessionId: demoSession.id },
            })
          }
          style={styles.secondaryButton}
        >
          <AppText variant="label">Voir mes erreurs</AppText>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing[5],
    paddingBottom: spacing[8],
  },
  card: {
    gap: spacing[4],
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  heroCopy: {
    flex: 1,
    gap: spacing[3],
  },
  heroImage: {
    width: 130,
    height: 160,
    resizeMode: "contain",
    borderRadius: radius.large,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: spacing[3],
  },
  secondaryButton: {
    minHeight: 58,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});

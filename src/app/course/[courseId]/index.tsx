import { Alert, Image, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
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
import { colors } from "@/src/theme";

export function generateStaticParams(): Record<string, string>[] {
  return demoCourses.map((course) => ({ courseId: course.id }));
}

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const course = demoCourses.find((demoItem) => demoItem.id === courseId);

  if (!course) {
    return (
      <AppScreen contentClassName="gap-5 pb-8">
        <CourseTopBar title="Cours introuvable" />
        <AppCard className="gap-4">
          <AppText variant="subtitle">Cours introuvable</AppText>
          <AppText tone="secondary">
            {"Ce cours de démonstration n'existe pas ou n'est pas disponible."}
          </AppText>
          <AppButton
            title="Retour à Mes cours"
            iconName="arrow-left"
            onPress={() => router.replace("/courses")}
          />
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
    <AppScreen contentClassName="gap-5 pb-8">
      <CourseTopBar title={course.subject} onOptionsPress={showOptions} />

      <View className="flex-row items-center gap-4">
        <View className="flex-1 gap-3">
          <AppText variant="title">{course.title}</AppText>
          <AppText variant="subtitle" tone="secondary">
            {course.pageCount} pages de cours • Dernière révision : {course.lastRevision}
          </AppText>
        </View>
        <Image
          source={require("../../../../assets/mianatra/illustration_student_reading.png")}
          accessibilityLabel="Élève lisant son cours"
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          className="h-40 w-[130px] rounded-2xl"
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
        iconName="file-alt"
        onPress={() =>
          router.push({
            pathname: "/course/[courseId]/revision-sheet",
            params: { courseId: course.id },
          })
        }
      />
      <View className="flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Faire des exercices"
          onPress={() =>
            router.push({
              pathname: "/session/[sessionId]",
              params: { sessionId: demoSession.id },
            })
          }
          className="min-h-[58px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[#E8D9C7] bg-[#FFFDF8] active:opacity-80"
        >
          <FontAwesome5 name="pen" size={16} color={colors.textPrimary} />
          <AppText variant="label">Faire des exercices</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voir mes résultats"
          onPress={() =>
            router.push({
              pathname: "/course/[courseId]/results",
              params: { courseId: course.id },
            })
          }
          className="min-h-[58px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[#E8D9C7] bg-[#FFFDF8] active:opacity-80"
        >
          <FontAwesome5 name="chart-line" size={16} color={colors.textPrimary} />
          <AppText variant="label">Voir mes résultats</AppText>
        </Pressable>
      </View>
    </AppScreen>
  );
}

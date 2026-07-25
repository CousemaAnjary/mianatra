import { Alert, Image, Pressable, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ProgressBar,
} from "@/src/components/shared";
import {
  CourseActionTabs,
  CourseProgressCard,
  CourseSummary,
  CourseTopBar,
} from "@/src/features/courses/components";
import { buildRealCourseResults, isExplicitDemoId, resolveExerciseSessionTarget } from "@/src/features/courses";
import { useCourseProcessing } from "@/src/features/course-processing";
import { countRealCourseExercises, startRealCourseSession } from "@/src/features/study-session/services/real-session-view.service";
import { demoCourseResults, demoCourses, demoSession } from "@/src/data/demo-data";
import { colors } from "@/src/theme";

export function generateStaticParams(): Record<string, string>[] {
  return demoCourses.map((course) => ({ courseId: course.id }));
}

type CoursePrimaryAction = {
  title: string;
  iconName: React.ComponentProps<typeof FontAwesome5>["name"];
  onPress: () => void | Promise<void>;
};

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const resolvedCourseId = Array.isArray(courseId) ? courseId[0] : courseId;
  const isDemoCourse = isExplicitDemoId(resolvedCourseId, demoCourses.map((demoItem) => demoItem.id));
  const demoCourse = isDemoCourse ? demoCourses.find((demoItem) => demoItem.id === resolvedCourseId) : undefined;
  const processing = useCourseProcessing(isDemoCourse ? undefined : resolvedCourseId);
  const [realExerciseCount, setRealExerciseCount] = useState(0);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const realDetail = isDemoCourse ? null : processing.detail;
  const realResults = realDetail ? buildRealCourseResults(realDetail) : null;
  const course = realDetail
    ? {
        id: realDetail.course.id,
        title: realDetail.course.title,
        subject: realDetail.subject?.name ?? "Cours",
        pageCount: realDetail.pages.length,
        progress: realResults?.progress ?? 0,
        lastRevision: realDetail.course.lastReviewedAt ? "récente" : "jamais",
        summary: realDetail.course.summary ? [realDetail.course.summary] : [],
      }
    : demoCourse;

  useEffect(() => {
    let cancelled = false;
    if (!realDetail) {
      setRealExerciseCount(0);
      return;
    }
    countRealCourseExercises(realDetail.course.id).then((count) => {
      if (!cancelled) {
        setRealExerciseCount(count);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [realDetail, processing.result.exercises.length]);

  const action = useMemo<CoursePrimaryAction>(() => {
    const isBusy = ["analyzing", "persisting", "generating_sheet", "generating_exercises"].includes(processing.status);
    if (!realDetail) {
      return {
        title: "Réviser le cours",
        iconName: "file-alt" as const,
        onPress: () =>
          router.push({
            pathname: "/course/[courseId]/revision-sheet",
            params: { courseId: demoCourse?.id ?? "" },
          }),
      };
    }
    const hasAnalysis = Boolean(realDetail.latestAnalysis || processing.result.persistedAnalysis || processing.pendingAnalysis || processing.result.analysis);
    const hasRevisionSheet = Boolean(realDetail.latestRevisionSheet || processing.result.revisionSheet);
    if (!hasAnalysis) {
      return {
        title: "Analyser le cours",
        iconName: "magic" as const,
        onPress: () => void processing.startProcessing?.()?.catch(() => undefined),
      };
    }
    if (!hasRevisionSheet) {
      return {
        title: "Générer ma fiche",
        iconName: "file-alt" as const,
        onPress: () => void processing.generateAssetsFromPersisted?.()?.catch(() => undefined),
      };
    }
    if (realExerciseCount === 0 && processing.result.exercises.length === 0) {
      return {
        title: isBusy ? "Génération des exercices" : "Réessayer les exercices",
        iconName: "pen" as const,
        onPress: () => {
          const run = processing.status === "error" ? processing.retry?.() : processing.generateAssetsFromPersisted?.();
          void run?.catch(() => undefined);
        },
      };
    }
    return {
      title: "Commencer à réviser",
      iconName: "play" as const,
      onPress: async () => {
        setSessionError(null);
        const session = await startRealCourseSession(realDetail.course.id);
        if (!session) {
          setSessionError("Aucun exercice réel n'est disponible pour ce cours.");
          return;
        }
        router.push({ pathname: "/session/[sessionId]", params: { sessionId: session.id } });
      },
    };
  }, [demoCourse?.id, processing, realDetail, realExerciseCount]);

  async function openExercises() {
    setSessionError(null);
    if (!realDetail) {
      const targetSessionId = resolveExerciseSessionTarget({
        isDemoCourse,
        demoSessionId: demoSession.id,
        realSessionId: null,
      });
      if (targetSessionId) {
        router.push({ pathname: "/session/[sessionId]", params: { sessionId: targetSessionId } });
      }
      return;
    }

    const session = await startRealCourseSession(realDetail.course.id);
    const targetSessionId = resolveExerciseSessionTarget({
      isDemoCourse: false,
      demoSessionId: demoSession.id,
      realSessionId: session?.id ?? null,
    });
    if (!targetSessionId) {
      setSessionError("Aucun exercice réel n'est disponible pour ce cours.");
      return;
    }
    router.push({ pathname: "/session/[sessionId]", params: { sessionId: targetSessionId } });
  }

  if (!isDemoCourse && !realDetail && !processing.hasLoadedDetail) {
    return (
      <AppScreen contentClassName="gap-5 pb-8">
        <CourseTopBar title="Chargement" />
        <AppCard className="gap-4">
          <AppText variant="subtitle">Chargement du cours</AppText>
          <AppText tone="secondary">Lecture des données SQLite...</AppText>
        </AppCard>
      </AppScreen>
    );
  }

  if (!course) {
    return (
      <AppScreen contentClassName="gap-5 pb-8">
        <CourseTopBar title="Cours introuvable" />
        <AppCard className="gap-4">
          <AppText variant="subtitle">Cours introuvable</AppText>
          <AppText tone="secondary">
            {"Ce cours n'existe pas ou n'est pas disponible."}
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
        mastered={realResults?.counters.mastered ?? demoCourseResults.counters.mastered}
        progressing={realResults?.counters.progressing ?? demoCourseResults.counters.progressing}
        needsWork={realResults?.counters.needsWork ?? demoCourseResults.counters.needsWork}
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
            disabled: Boolean(realDetail && realExerciseCount === 0 && processing.result.exercises.length === 0),
            onPress: () => void openExercises(),
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

      {realDetail ? (
        <AppCard className="gap-4">
          <View className="gap-2">
            <AppText variant="subtitle">Traitement du cours</AppText>
            <AppText tone="secondary">{processing.progress.message}</AppText>
          </View>
          <ProgressBar value={processing.progress.percent} accessibilityLabel="Progression du traitement" />
          {processing.progress.totalPages > 0 ? (
            <AppText tone="secondary">
              {processing.progress.currentPage} / {processing.progress.totalPages} pages
            </AppText>
          ) : null}
          {processing.result.analysis ? (
            <View className="gap-2">
              <AppText variant="label">Analyse détectée</AppText>
              <AppText tone="secondary">
                {processing.result.analysis.detectedTitle} • {processing.result.analysis.detectedSubject} •{" "}
                {processing.result.analysis.concepts.length} concept(s)
              </AppText>
              <AppText tone="secondary">{processing.result.analysis.summary}</AppText>
              {processing.result.warnings.map((warning) => (
                <AppText key={warning} tone="secondary">{warning}</AppText>
              ))}
              {processing.pendingAnalysis ? (
                <AppButton
                  title="Confirmer et continuer"
                  iconName="check"
                  loading={["persisting", "generating_sheet", "generating_exercises"].includes(processing.status)}
                  onPress={() => void processing.confirmAndContinue?.()?.catch(() => undefined)}
                />
              ) : null}
            </View>
          ) : null}
          {processing.error ? (
            <View className="gap-3">
              <AppText accessibilityRole="alert" tone="error">{processing.error}</AppText>
              <AppButton title="Réessayer" iconName="redo" variant="secondary" onPress={() => void processing.retry?.()?.catch(() => undefined)} />
            </View>
          ) : null}
          {sessionError ? <AppText tone="error">{sessionError}</AppText> : null}
        </AppCard>
      ) : null}

      <AppButton
        title={action.title}
        iconName={action.iconName}
        loading={["analyzing", "persisting", "generating_sheet", "generating_exercises"].includes(processing.status)}
        onPress={action.onPress}
      />
      <View className="flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Faire des exercices"
          accessibilityState={{ disabled: Boolean(realDetail && realExerciseCount === 0 && processing.result.exercises.length === 0) }}
          disabled={Boolean(realDetail && realExerciseCount === 0 && processing.result.exercises.length === 0)}
          onPress={() => void openExercises()}
          className={[
            "min-h-[58px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[#E8D9C7] bg-[#FFFDF8] active:opacity-80",
            realDetail && realExerciseCount === 0 && processing.result.exercises.length === 0 ? "opacity-45" : "",
          ].join(" ")}
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

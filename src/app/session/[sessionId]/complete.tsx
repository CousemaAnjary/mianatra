import { useEffect, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppButton, AppCard, AppScreen, AppText, ProgressBar, ScreenHeader, StatusBadge } from "@/src/components/shared";
import { demoSession } from "@/src/data/demo-data";
import { SessionReport } from "@/src/features/study-session/components";
import { useDemoSession } from "@/src/features/study-session/context/DemoSessionProvider";
import { loadRealReportView, type RealReportView } from "@/src/features/study-session/services/real-session-view.service";

export function generateStaticParams() {
  return [{ sessionId: demoSession.id }];
}

export default function SessionCompleteScreen() {
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const resolvedSessionId = sessionId ?? demoSession.id;
  const [realReport, setRealReport] = useState<RealReportView | null>(null);
  const [isLoadingRealReport, setIsLoadingRealReport] = useState(resolvedSessionId !== demoSession.id);
  const { state, summary, startSession, startTargetedSession, resetSession } = useDemoSession();

  useEffect(() => {
    if (resolvedSessionId !== demoSession.id) {
      return;
    }
    if (state.status === "idle") {
      startSession(resolvedSessionId);
    }
  }, [resolvedSessionId, startSession, state.status]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (resolvedSessionId === demoSession.id) {
        setRealReport(null);
        setIsLoadingRealReport(false);
        return;
      }
      setIsLoadingRealReport(true);
      const view = await loadRealReportView(resolvedSessionId);
      if (!cancelled) {
        setRealReport(view);
        setIsLoadingRealReport(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [resolvedSessionId]);

  const handleTargeted = () => {
    startTargetedSession();
    router.replace({
      pathname: "/session/[sessionId]",
      params: { sessionId: resolvedSessionId },
    });
  };

  const handleHome = () => {
    resetSession();
    router.replace("/(tabs)");
  };

  if (isLoadingRealReport) {
    return (
      <AppScreen>
        <ScreenHeader title="Rapport de séance" subtitle="Chargement" showBack />
        <AppCard className="gap-3">
          <AppText variant="subtitle">Préparation du rapport</AppText>
          <AppText tone="secondary">Calcul des résultats réels...</AppText>
        </AppCard>
      </AppScreen>
    );
  }

  if (realReport?.status === "missing") {
    return (
      <AppScreen>
        <ScreenHeader title="Rapport de séance" subtitle="Session introuvable" showBack />
        <AppCard className="gap-4">
          <AppText variant="subtitle">Rapport indisponible</AppText>
          <AppText tone="secondary">Cette session réelle est introuvable.</AppText>
          <AppButton title="Retour à l'accueil" iconName="home" onPress={() => router.replace("/(tabs)")} />
        </AppCard>
      </AppScreen>
    );
  }

  if (realReport?.status === "ready") {
    return (
      <AppScreen>
        <ScreenHeader title="Rapport de séance" subtitle="Session terminée" showBack />
        <View className="gap-4">
          <AppCard accessibilityLabel="Rapport réel de séance" className="gap-4">
            <View className="gap-2">
              <StatusBadge
                label={`${realReport.report.correctAnswers}/${realReport.report.totalAnswers} réponses correctes`}
                tone={realReport.report.score >= 70 ? "success" : "progress"}
              />
              <AppText variant="title">{Math.round(realReport.report.score)}%</AppText>
              <ProgressBar value={realReport.report.score} />
              <AppText tone="secondary">Durée : {realReport.durationSeconds}s</AppText>
            </View>
            <View className="gap-2">
              <AppText variant="subtitle">Point fort</AppText>
              <AppText tone="secondary">{realReport.strongConceptName}</AppText>
            </View>
            <View className="gap-2">
              <AppText variant="subtitle">À renforcer</AppText>
              <AppText tone="secondary">{realReport.weakConceptName}</AppText>
            </View>
            <View className="gap-2">
              <AppText variant="subtitle">Résumé</AppText>
              <AppText tone="secondary">{realReport.report.summary}</AppText>
            </View>
            <View className="gap-2">
              <AppText variant="subtitle">Prochaine étape</AppText>
              <AppText tone="secondary">{realReport.report.recommendation}</AppText>
            </View>
          </AppCard>
          <AppButton
            title="Retour au cours"
            iconName="book"
            onPress={() => router.replace({ pathname: "/course/[courseId]", params: { courseId: realReport.session.courseId } })}
          />
          <AppButton title="Retour à l'accueil" iconName="home" variant="secondary" onPress={() => router.replace("/(tabs)")} />
        </View>
      </AppScreen>
    );
  }

  if (state.status === "invalid") {
    return (
      <AppScreen>
        <ScreenHeader title="Rapport de séance" subtitle="Série indisponible" showBack />
        <AppCard className="gap-4">
          <AppText variant="subtitle">Rapport indisponible</AppText>
          <AppText tone="secondary">
            {state.message ?? "Cette session ne permet pas de générer un rapport."}
          </AppText>
          <AppButton title="Retour à l'accueil" iconName="home" onPress={handleHome} />
        </AppCard>
      </AppScreen>
    );
  }

  if (state.attempts.length < state.exercises.length || state.status !== "completed") {
    return (
      <AppScreen>
        <ScreenHeader title="Rapport de séance" subtitle="Session en cours" showBack />
        <AppCard className="gap-4">
          <AppText variant="subtitle">Termine la série pour voir ton rapport</AppText>
          <AppText tone="secondary">
            Le rapport est construit quand tous les exercices de la série ont une tentative.
          </AppText>
          <AppButton
            title="Reprendre la session"
            iconName="arrow-left"
            onPress={() =>
              router.replace({
                pathname: "/session/[sessionId]",
                params: { sessionId: resolvedSessionId },
              })
            }
          />
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScreenHeader title="Rapport de séance" subtitle="Session terminée" showBack />
      <View className="gap-4">
        <SessionReport summary={summary} />
        <View className="gap-3">
          <AppButton title="Faire une série ciblée" iconName="bullseye" onPress={handleTargeted} />
          <AppButton
            title="Voir mes résultats"
            iconName="chart-line"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/course/[courseId]/results",
                params: { courseId: demoSession.courseId },
              })
            }
          />
          <AppButton
            title="Retour à l'accueil"
            iconName="home"
            variant="secondary"
            onPress={handleHome}
          />
        </View>
      </View>
    </AppScreen>
  );
}

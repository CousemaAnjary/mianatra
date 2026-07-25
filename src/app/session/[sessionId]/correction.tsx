import { useEffect, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppButton, AppCard, AppScreen, AppText, ScreenHeader } from "@/src/components/shared";
import { demoSession } from "@/src/data/demo-data";
import { CorrectionPanel } from "@/src/features/study-session/components";
import { useDemoSession } from "@/src/features/study-session/context/DemoSessionProvider";
import {
  completeRealSessionAndBuildReport,
  loadRealCorrectionView,
  type RealCorrectionView,
} from "@/src/features/study-session/services/real-session-view.service";
import type { SessionAttempt } from "@/src/features/study-session/types/study-session.types";

export function generateStaticParams() {
  return [{ sessionId: demoSession.id }];
}

export default function SessionCorrectionScreen() {
  const params = useLocalSearchParams<{ sessionId: string; attemptId?: string }>();
  const attemptId = Array.isArray(params.attemptId) ? params.attemptId[0] : params.attemptId;
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const resolvedSessionId = sessionId ?? demoSession.id;
  const [realCorrection, setRealCorrection] = useState<RealCorrectionView | null>(null);
  const [isLoadingRealCorrection, setIsLoadingRealCorrection] = useState(resolvedSessionId !== demoSession.id);
  const [realError, setRealError] = useState<string | null>(null);
  const {
    state,
    currentExercise,
    lastAttempt,
    isLastExercise,
    startSession,
    goToNextExercise,
    completeSession,
  } = useDemoSession();

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
        setRealCorrection(null);
        setIsLoadingRealCorrection(false);
        return;
      }
      if (!attemptId) {
        setRealCorrection({ status: "missing" });
        setIsLoadingRealCorrection(false);
        return;
      }
      setIsLoadingRealCorrection(true);
      const view = await loadRealCorrectionView(resolvedSessionId, attemptId);
      if (!cancelled) {
        setRealCorrection(view);
        setIsLoadingRealCorrection(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [attemptId, resolvedSessionId]);

  const handleContinue = () => {
    if (isLastExercise) {
      completeSession();
      router.push({
        pathname: "/session/[sessionId]/complete",
        params: { sessionId: resolvedSessionId },
      });
      return;
    }

    goToNextExercise();
    router.push({
      pathname: "/session/[sessionId]",
      params: { sessionId: resolvedSessionId },
    });
  };

  if (isLoadingRealCorrection) {
    return (
      <AppScreen>
        <ScreenHeader title="Correction" subtitle="Chargement" showBack />
        <AppCard className="gap-3">
          <AppText variant="subtitle">Préparation de la correction</AppText>
          <AppText tone="secondary">Chargement de ta tentative réelle...</AppText>
        </AppCard>
      </AppScreen>
    );
  }

  if (realCorrection?.status === "missing") {
    return (
      <AppScreen>
        <ScreenHeader title="Correction" subtitle="Tentative introuvable" showBack />
        <AppCard className="gap-4">
          <AppText variant="subtitle">Correction indisponible</AppText>
          <AppText tone="secondary">Cette tentative réelle est introuvable.</AppText>
          <AppButton title="Retour à l'exercice" iconName="arrow-left" onPress={() => router.replace({ pathname: "/session/[sessionId]", params: { sessionId: resolvedSessionId } })} />
        </AppCard>
      </AppScreen>
    );
  }

  if (realCorrection?.status === "ready") {
    const realAttempt: SessionAttempt = {
      exerciseId: realCorrection.attempt.exerciseId,
      answer: realCorrection.attempt.userAnswer,
      normalizedAnswer: realCorrection.attempt.userAnswer,
      isCorrect: realCorrection.attempt.isCorrect,
      expectedAnswer: realCorrection.exercise.expectedAnswer,
      conceptName: realCorrection.exercise.conceptName,
      usedHint: realCorrection.attempt.usedHint,
    };

    return (
      <AppScreen>
        <ScreenHeader title="Correction" subtitle={realCorrection.exercise.title} showBack />
        <View className="gap-4">
          <CorrectionPanel attempt={realAttempt} exercise={realCorrection.exercise} />
          {realError ? <AppText tone="error">{realError}</AppText> : null}
          <View className="gap-3">
            <AppButton
              title={realCorrection.isLastExercise ? "Voir mon rapport" : "Exercice suivant"}
              iconName={realCorrection.isLastExercise ? "chart-bar" : "arrow-right"}
              iconPosition="right"
              onPress={() => {
                setRealError(null);
                if (!realCorrection.isLastExercise) {
                  router.replace({ pathname: "/session/[sessionId]", params: { sessionId: resolvedSessionId } });
                  return;
                }
                completeRealSessionAndBuildReport(resolvedSessionId)
                  .then(() => router.replace({ pathname: "/session/[sessionId]/complete", params: { sessionId: resolvedSessionId } }))
                  .catch(() => setRealError("Impossible de terminer la session. Réessaie."));
              }}
            />
            <AppButton
              title="Revoir ma fiche"
              iconName="file-alt"
              variant="secondary"
              onPress={() => router.push({ pathname: "/course/[courseId]/revision-sheet", params: { courseId: realCorrection.session.courseId } })}
            />
          </View>
        </View>
      </AppScreen>
    );
  }

  if (state.status === "invalid" || !currentExercise) {
    return (
      <AppScreen>
        <ScreenHeader title="Correction" subtitle="Série indisponible" showBack />
        <AppCard className="gap-4">
          <AppText variant="subtitle">Correction indisponible</AppText>
          <AppText tone="secondary">
            {state.message ?? "Aucun exercice ne peut être corrigé pour cette session."}
          </AppText>
          <AppButton
            title="Retour à l'accueil"
            iconName="home"
            onPress={() => router.replace("/(tabs)")}
          />
        </AppCard>
      </AppScreen>
    );
  }

  if (!lastAttempt || lastAttempt.exerciseId !== currentExercise.id) {
    return (
      <AppScreen>
        <ScreenHeader title="Correction" subtitle="Réponse nécessaire" showBack />
        <AppCard className="gap-4">
          <AppText variant="subtitle">{"Réponds d'abord à l'exercice"}</AppText>
          <AppText tone="secondary">
            {"La correction s'affiche après une tentative afin de comparer ta réponse avec la méthode."}
          </AppText>
          <AppButton
            title="Retour à l'exercice"
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
      <ScreenHeader title="Correction" subtitle={currentExercise.title} showBack />
      <View className="gap-4">
        <CorrectionPanel attempt={lastAttempt} exercise={currentExercise} />
        <View className="gap-3">
          <AppButton
            title={isLastExercise ? "Voir mon rapport" : "Exercice suivant"}
            iconName={isLastExercise ? "chart-bar" : "arrow-right"}
            iconPosition="right"
            onPress={handleContinue}
          />
          <AppButton
            title="Revoir ma fiche"
            iconName="file-alt"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/course/[courseId]/revision-sheet",
                params: { courseId: demoSession.courseId },
              })
            }
          />
        </View>
      </View>
    </AppScreen>
  );
}

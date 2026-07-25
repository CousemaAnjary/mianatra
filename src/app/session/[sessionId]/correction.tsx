import { useEffect } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppButton, AppCard, AppScreen, AppText, ScreenHeader } from "@/src/components/shared";
import { demoSession } from "@/src/data/demo-data";
import { CorrectionPanel } from "@/src/features/study-session/components";
import { useDemoSession } from "@/src/features/study-session/context/DemoSessionProvider";

export function generateStaticParams() {
  return [{ sessionId: demoSession.id }];
}

export default function SessionCorrectionScreen() {
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const resolvedSessionId = sessionId ?? demoSession.id;
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
    if (state.status === "idle") {
      startSession(resolvedSessionId);
    }
  }, [resolvedSessionId, startSession, state.status]);

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

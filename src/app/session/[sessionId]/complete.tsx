import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppButton, AppCard, AppScreen, AppText, ScreenHeader } from "@/src/components/shared";
import { demoSession } from "@/src/data/demo-data";
import { SessionReport } from "@/src/features/study-session/components";
import { useDemoSession } from "@/src/features/study-session/context/DemoSessionProvider";
import { spacing } from "@/src/theme";

export function generateStaticParams() {
  return [{ sessionId: demoSession.id }];
}

export default function SessionCompleteScreen() {
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const resolvedSessionId = sessionId ?? demoSession.id;
  const { state, summary, startSession, startTargetedSession, resetSession } = useDemoSession();

  useEffect(() => {
    if (state.status === "idle") {
      startSession(resolvedSessionId);
    }
  }, [resolvedSessionId, startSession, state.status]);

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

  if (state.status === "invalid") {
    return (
      <AppScreen>
        <ScreenHeader title="Rapport de séance" subtitle="Série indisponible" showBack />
        <AppCard style={styles.card}>
          <AppText variant="subtitle">Rapport indisponible</AppText>
          <AppText tone="secondary">
            {state.message ?? "Cette session ne permet pas de générer un rapport."}
          </AppText>
          <AppButton title="Retour à l'accueil" onPress={handleHome} />
        </AppCard>
      </AppScreen>
    );
  }

  if (state.attempts.length < state.exercises.length || state.status !== "completed") {
    return (
      <AppScreen>
        <ScreenHeader title="Rapport de séance" subtitle="Session en cours" showBack />
        <AppCard style={styles.card}>
          <AppText variant="subtitle">Termine la série pour voir ton rapport</AppText>
          <AppText tone="secondary">
            Le rapport est construit quand tous les exercices de la série ont une tentative.
          </AppText>
          <AppButton
            title="Reprendre la session"
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
      <View style={styles.stack}>
        <SessionReport summary={summary} />
        <View style={styles.actions}>
          <AppButton title="Faire une série ciblée" onPress={handleTargeted} />
          <AppButton
            title="Voir mes résultats"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/course/[courseId]/results",
                params: { courseId: demoSession.courseId },
              })
            }
          />
          <AppButton title="Retour à l'accueil" variant="secondary" onPress={handleHome} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing[4],
  },
  card: {
    gap: spacing[4],
  },
  actions: {
    gap: spacing[3],
  },
});

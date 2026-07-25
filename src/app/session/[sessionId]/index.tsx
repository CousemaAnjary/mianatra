import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
} from "@/src/components/shared";
import { demoSession } from "@/src/data/demo-data";
import {
  ExerciseAnswerControl,
  ExerciseContent,
  ExerciseProgress,
  HintPanel,
} from "@/src/features/study-session/components";
import { useDemoSession } from "@/src/features/study-session/context/DemoSessionProvider";
import { spacing } from "@/src/theme";

export function generateStaticParams() {
  return [{ sessionId: demoSession.id }];
}

export default function SessionScreen() {
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const resolvedSessionId = sessionId ?? demoSession.id;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    state,
    currentExercise,
    startSession,
    setAnswer,
    showHint,
    submitAnswer,
    resetSession,
  } = useDemoSession();

  useEffect(() => {
    startSession(resolvedSessionId);
  }, [resolvedSessionId, startSession]);

  const answer = currentExercise ? state.answers[currentExercise.id] ?? "" : "";
  const hasStarted = useMemo(
    () => state.attempts.length > 0 || Object.values(state.answers).some((value) => value.length > 0),
    [state.answers, state.attempts.length],
  );

  const handleSubmit = () => {
    const attempt = submitAnswer();

    if (!attempt) {
      setErrorMessage("Écris ou choisis une réponse avant de demander la correction.");
      return;
    }

    setErrorMessage(null);
    router.push({
      pathname: "/session/[sessionId]/correction",
      params: { sessionId: resolvedSessionId },
    });
  };

  const handleExit = () => {
    const leave = () => {
      resetSession();
      router.replace("/(tabs)");
    };

    if (!hasStarted) {
      leave();
      return;
    }

    Alert.alert(
      "Quitter la session ?",
      "La progression de cette série locale sera remise à zéro.",
      [
        { text: "Continuer", style: "cancel" },
        { text: "Quitter", style: "destructive", onPress: leave },
      ],
    );
  };

  if (state.status === "invalid" || !currentExercise) {
    return (
      <AppScreen>
        <ScreenHeader title="Session d'exercices" subtitle="Série indisponible" showBack />
        <AppCard style={styles.card}>
          <AppText variant="subtitle">{"Impossible d'ouvrir cette série"}</AppText>
          <AppText tone="secondary">
            {state.message ?? "Aucun exercice n'est disponible pour cette session."}
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

  return (
    <AppScreen>
      <ScreenHeader
        title={state.mode === "targeted" ? "Série ciblée" : "Session d'exercices"}
        subtitle="Fonctions du second degré"
      />
      <View style={styles.stack}>
        <ExerciseProgress current={state.currentIndex + 1} total={state.exercises.length} />
        <ExerciseContent exercise={currentExercise} />
        <AppCard style={styles.card}>
          <ExerciseAnswerControl
            answer={answer}
            exercise={currentExercise}
            onChangeAnswer={(nextAnswer) => {
              setErrorMessage(null);
              setAnswer(currentExercise.id, nextAnswer);
            }}
          />
          {state.hintsUsed[currentExercise.id] ? <HintPanel hint={currentExercise.hint} /> : null}
          {errorMessage ? (
            <AppText accessibilityRole="alert" tone="error">
              {errorMessage}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            <AppButton
              title={state.hintsUsed[currentExercise.id] ? "Indice affiché" : "Voir un indice"}
              iconName="lightbulb"
              variant="tertiary"
              disabled={state.hintsUsed[currentExercise.id]}
              onPress={() => showHint(currentExercise.id)}
            />
            <AppButton title="Valider ma réponse" iconName="check" onPress={handleSubmit} />
          </View>
        </AppCard>
        <AppButton
          title="Quitter la session"
          iconName="times"
          variant="secondary"
          onPress={handleExit}
        />
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

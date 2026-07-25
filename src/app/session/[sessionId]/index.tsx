import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
} from "@/src/components/shared";
import { demoSession } from "@/src/data/demo-data";
import { loadRealSessionView, type RealSessionView } from "@/src/features/study-session/services/real-session-view.service";
import {
  ExerciseAnswerControl,
  ExerciseContent,
  ExerciseProgress,
  HintPanel,
} from "@/src/features/study-session/components";
import { useDemoSession } from "@/src/features/study-session/context/DemoSessionProvider";

export function generateStaticParams() {
  return [{ sessionId: demoSession.id }];
}

export default function SessionScreen() {
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const resolvedSessionId = sessionId ?? demoSession.id;
  const [realView, setRealView] = useState<RealSessionView | null>(null);
  const [isLoadingRealView, setIsLoadingRealView] = useState(resolvedSessionId !== demoSession.id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [realAnswer, setRealAnswer] = useState("");
  const [realHintShown, setRealHintShown] = useState(false);
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
    if (resolvedSessionId !== demoSession.id) {
      return;
    }
    startSession(resolvedSessionId);
  }, [resolvedSessionId, startSession]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (resolvedSessionId === demoSession.id) {
        setRealView(null);
        setIsLoadingRealView(false);
        return;
      }
      setIsLoadingRealView(true);
      const view = await loadRealSessionView(resolvedSessionId);
      if (!cancelled) {
        setRealView(view);
        setIsLoadingRealView(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [resolvedSessionId]);

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

  if (isLoadingRealView) {
    return (
      <AppScreen>
        <ScreenHeader title="Session d'exercices" subtitle="Chargement" showBack />
        <AppCard className="gap-3">
          <AppText variant="subtitle">Préparation de la session</AppText>
          <AppText tone="secondary">Chargement des exercices réels...</AppText>
        </AppCard>
      </AppScreen>
    );
  }

  if (realView?.status === "missing" || realView?.status === "empty") {
    return (
      <AppScreen>
        <ScreenHeader title="Session d'exercices" subtitle="Série indisponible" showBack />
        <AppCard className="gap-4">
          <AppText variant="subtitle">{"Impossible d'ouvrir cette série"}</AppText>
          <AppText tone="secondary">
            {realView.status === "empty" ? "Aucun exercice réel n'est disponible pour cette session." : "Session introuvable."}
          </AppText>
          <AppButton title="Retour aux cours" iconName="arrow-left" onPress={() => router.replace("/courses")} />
        </AppCard>
      </AppScreen>
    );
  }

  if (realView?.status === "ready") {
    return (
      <AppScreen>
        <ScreenHeader title="Session d'exercices" subtitle="Exercices réels" />
        <View className="gap-4">
          <ExerciseProgress current={realView.currentIndex + 1} total={realView.exercises.length} />
          <ExerciseContent exercise={realView.currentExercise} />
          <AppCard className="gap-4">
            <ExerciseAnswerControl
              answer={realAnswer}
              exercise={realView.currentExercise}
              onChangeAnswer={(nextAnswer) => {
                setErrorMessage(null);
                setRealAnswer(nextAnswer);
              }}
            />
            {realHintShown ? <HintPanel hint={realView.currentExercise.hint} /> : null}
            {errorMessage ? (
              <AppText accessibilityRole="alert" tone="error">
                {errorMessage}
              </AppText>
            ) : null}
            <View className="gap-3">
              <AppButton
                title={realHintShown ? "Indice affiché" : "Voir un indice"}
                iconName="lightbulb"
                variant="tertiary"
                disabled={realHintShown}
                onPress={() => setRealHintShown(true)}
              />
              <AppButton
                title="Valider ma réponse"
                iconName="check"
                onPress={() => {
                  if (!realAnswer.trim()) {
                    setErrorMessage("Écris ou choisis une réponse avant de demander la correction.");
                    return;
                  }
                  router.push({ pathname: "/session/[sessionId]/correction", params: { sessionId: resolvedSessionId } });
                }}
              />
            </View>
          </AppCard>
          <AppButton title="Quitter la session" iconName="times" variant="secondary" onPress={handleExit} />
        </View>
      </AppScreen>
    );
  }

  if (state.status === "invalid" || !currentExercise) {
    return (
      <AppScreen>
        <ScreenHeader title="Session d'exercices" subtitle="Série indisponible" showBack />
        <AppCard className="gap-4">
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
      <View className="gap-4">
        <ExerciseProgress current={state.currentIndex + 1} total={state.exercises.length} />
        <ExerciseContent exercise={currentExercise} />
        <AppCard className="gap-4">
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
          <View className="gap-3">
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

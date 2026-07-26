import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
} from "@/src/components/shared";
import { demoSession } from "@/src/data/demo-data";
import {
  loadRealSessionView,
  submitRealSessionAnswer,
  type RealSessionView,
} from "@/src/features/study-session/services/real-session-view.service";
import {
  ExerciseAnswerControl,
  ExerciseContent,
  ExerciseProgress,
  HintPanel,
} from "@/src/features/study-session/components";
import { useDemoSession } from "@/src/features/study-session/context/DemoSessionProvider";
import { canSubmitExerciseAnswer, getAnswerControlKind } from "@/src/features/study-session/utils/session-answer-rendering";
import { fonts } from "@/src/theme";

declare const __DEV__: boolean | undefined;

function isDev() {
  return typeof __DEV__ !== "undefined" ? __DEV__ : true;
}

export function generateStaticParams() {
  return [{ sessionId: demoSession.id }];
}

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId;
  const resolvedSessionId = sessionId ?? demoSession.id;
  const [realView, setRealView] = useState<RealSessionView | null>(null);
  const [isLoadingRealView, setIsLoadingRealView] = useState(resolvedSessionId !== demoSession.id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [realAnswer, setRealAnswer] = useState("");
  const [realHintShown, setRealHintShown] = useState(false);
  const [isSubmittingRealAnswer, setIsSubmittingRealAnswer] = useState(false);
  const realCurrentExerciseId = realView?.status === "ready" ? realView.currentExercise.id : null;
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

  useEffect(() => {
    if (realCurrentExerciseId) {
      setRealAnswer("");
      setRealHintShown(false);
      setErrorMessage(null);
    }
  }, [realCurrentExerciseId]);

  const answer = currentExercise ? state.answers[currentExercise.id] ?? "" : "";
  const realCanSubmit =
    realView?.status === "ready"
      ? canSubmitExerciseAnswer(realView.currentExercise, realAnswer, isSubmittingRealAnswer)
      : false;
  const demoCanSubmit = currentExercise ? canSubmitExerciseAnswer(currentExercise, answer) : false;
  const hasStarted = useMemo(
    () => state.attempts.length > 0 || Object.values(state.answers).some((value) => value.length > 0),
    [state.answers, state.attempts.length],
  );

  useEffect(() => {
    if (!isDev() || realView?.status !== "ready") {
      return;
    }

    const exercise = realView.currentExercise;
    console.log("[real-study-session] exercise-render", {
      sessionId: resolvedSessionId,
      exerciseId: exercise.id,
      exerciseIndex: realView.currentIndex,
      rawType: exercise.rawType,
      mappedType: exercise.type,
      optionsCount: exercise.options?.length ?? 0,
      hasHint: exercise.hint.trim().length > 0,
      hasExpectedAnswer: exercise.expectedAnswer.trim().length > 0,
    });
  }, [realView, resolvedSessionId]);

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

  if (realView?.status === "completed") {
    return (
      <AppScreen>
        <ScreenHeader title="Session d'exercices" subtitle="Session terminée" showBack />
        <AppCard className="gap-4">
          <AppText variant="subtitle">Cette session est terminée</AppText>
          <AppText tone="secondary">Ouvre le rapport pour consulter tes résultats réels.</AppText>
          <AppButton
            title="Voir mon rapport"
            iconName="chart-bar"
            onPress={() => router.replace({ pathname: "/session/[sessionId]/complete", params: { sessionId: resolvedSessionId } })}
          />
        </AppCard>
      </AppScreen>
    );
  }

  if (realView?.status === "ready") {
    return (
      <AppScreen
        contentClassName="gap-4 pt-2"
        contentStyle={{ paddingBottom: Math.max(insets.bottom + 28, 58) }}
      >
        <View className="gap-1.5">
          <AppText variant="heading" className="text-[24px] leading-[30px]" style={{ fontFamily: fonts.bold }}>
            {"Session d'exercices"}
          </AppText>
          <AppText tone="secondary" className="text-[15px] leading-5">
            Exercices réels
          </AppText>
        </View>
        <View className="gap-3.5">
          <ExerciseProgress current={realView.currentIndex + 1} total={realView.exercises.length} />
          <ExerciseContent exercise={realView.currentExercise} />
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
          {getAnswerControlKind(realView.currentExercise.type) === "unsupported" ? (
            <AppButton
              title="Retour au cours"
              iconName="arrow-left"
              variant="secondary"
              className="min-h-[50px]"
              onPress={() => router.replace({ pathname: "/course/[courseId]", params: { courseId: realView.session.courseId } })}
            />
          ) : (
            <AppButton
              title={realHintShown ? "Indice affiché" : "Voir un indice"}
              iconName="lightbulb"
              variant="tertiary"
              disabled={realHintShown}
              className="min-h-[48px]"
              onPress={() => setRealHintShown(true)}
            />
          )}
          <AppButton
            title="Valider ma réponse"
            iconName="check"
            disabled={!realCanSubmit}
            loading={isSubmittingRealAnswer}
            className="min-h-[52px]"
            onPress={() => {
              if (isSubmittingRealAnswer || !realCanSubmit) {
                setErrorMessage("Écris ou choisis une réponse avant de demander la correction.");
                return;
              }
              setIsSubmittingRealAnswer(true);
              submitRealSessionAnswer({
                sessionId: resolvedSessionId,
                exerciseId: realView.currentExercise.id,
                answer: realAnswer,
                usedHint: realHintShown,
              })
                .then(({ attempt }) => {
                  setErrorMessage(null);
                  router.push({
                    pathname: "/session/[sessionId]/correction",
                    params: { sessionId: resolvedSessionId, attemptId: attempt.id },
                  });
                })
                .catch(() => {
                  setErrorMessage("Impossible d'enregistrer ta réponse. Réessaie.");
                })
                .finally(() => setIsSubmittingRealAnswer(false));
            }}
          />
          <AppButton
            title="Quitter la session"
            iconName="times"
            variant="secondary"
            className="min-h-[50px] bg-transparent"
            onPress={handleExit}
          />
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
    <AppScreen
      contentClassName="gap-4 pt-2"
      contentStyle={{ paddingBottom: Math.max(insets.bottom + 28, 58) }}
    >
      <ScreenHeader
        title={state.mode === "targeted" ? "Série ciblée" : "Session d'exercices"}
        subtitle="Fonctions du second degré"
      />
      <View className="gap-3.5">
        <ExerciseProgress current={state.currentIndex + 1} total={state.exercises.length} />
        <ExerciseContent exercise={currentExercise} />
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
        <AppButton
          title={state.hintsUsed[currentExercise.id] ? "Indice affiché" : "Voir un indice"}
          iconName="lightbulb"
          variant="tertiary"
          disabled={state.hintsUsed[currentExercise.id]}
          className="min-h-[48px]"
          onPress={() => showHint(currentExercise.id)}
        />
        <AppButton title="Valider ma réponse" iconName="check" disabled={!demoCanSubmit} className="min-h-[52px]" onPress={handleSubmit} />
        <AppButton
          title="Quitter la session"
          iconName="times"
          variant="secondary"
          className="min-h-[50px] bg-transparent"
          onPress={handleExit}
        />
      </View>
    </AppScreen>
  );
}

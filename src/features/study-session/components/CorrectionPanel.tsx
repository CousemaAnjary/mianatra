import { View } from "react-native";
import { AppCard, AppText, StatusBadge } from "@/src/components/shared";
import type { DemoExercise } from "@/src/data/demo-data";
import type { SessionAttempt } from "../types/study-session.types";

type CorrectionPanelProps = {
  exercise: DemoExercise;
  attempt: SessionAttempt;
};

export function CorrectionPanel({ exercise, attempt }: CorrectionPanelProps) {
  return (
    <AppCard
      accessibilityLabel={attempt.isCorrect ? "Correction correcte" : "Correction à reprendre"}
      className="gap-4"
    >
      <StatusBadge
        label={attempt.isCorrect ? "Réponse correcte" : "Réponse à reprendre"}
        tone={attempt.isCorrect ? "success" : "warning"}
      />
      <View className="flex-row flex-wrap gap-3">
        <View className="min-w-40 flex-1 gap-1 rounded-xl border border-[#E8D9C7] p-3">
          <AppText variant="caption" tone="secondary">Ta réponse</AppText>
          <AppText variant="label">{attempt.answer}</AppText>
        </View>
        <View className="min-w-40 flex-1 gap-1 rounded-xl border border-[#2E7D70] bg-[#EEF8F4] p-3">
          <AppText variant="caption" tone="secondary">Réponse attendue</AppText>
          <AppText variant="label">{exercise.expectedAnswer}</AppText>
        </View>
      </View>
      <View className="gap-2">
        <AppText variant="subtitle">Explication</AppText>
        <AppText tone="secondary">{exercise.explanation}</AppText>
      </View>
      <View className="gap-2">
        <AppText variant="subtitle">Méthode</AppText>
        {exercise.correctionSteps.map((step, index) => (
          <View key={step} className="flex-row items-start gap-3">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-[#2E7D70]">
              <AppText variant="caption" tone="inverse">{index + 1}</AppText>
            </View>
            <AppText className="flex-1" tone="secondary">{step}</AppText>
          </View>
        ))}
      </View>
      {attempt.usedHint ? (
        <AppText variant="caption" tone="secondary">
          {"Indice consulté pendant l'exercice."}
        </AppText>
      ) : null}
    </AppCard>
  );
}

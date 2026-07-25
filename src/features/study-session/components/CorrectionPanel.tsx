import { StyleSheet, View } from "react-native";
import { AppCard, AppText, StatusBadge } from "@/src/components/shared";
import type { DemoExercise } from "@/src/data/demo-data";
import type { SessionAttempt } from "../types/study-session.types";
import { colors, radius, spacing } from "@/src/theme";

type CorrectionPanelProps = {
  exercise: DemoExercise;
  attempt: SessionAttempt;
};

export function CorrectionPanel({ exercise, attempt }: CorrectionPanelProps) {
  return (
    <AppCard
      accessibilityLabel={attempt.isCorrect ? "Correction correcte" : "Correction à reprendre"}
      style={styles.card}
    >
      <StatusBadge
        label={attempt.isCorrect ? "Réponse correcte" : "Réponse à reprendre"}
        tone={attempt.isCorrect ? "success" : "warning"}
      />
      <View style={styles.answerGrid}>
        <View style={styles.answerBox}>
          <AppText variant="caption" tone="secondary">Ta réponse</AppText>
          <AppText variant="label">{attempt.answer}</AppText>
        </View>
        <View style={[styles.answerBox, styles.expectedBox]}>
          <AppText variant="caption" tone="secondary">Réponse attendue</AppText>
          <AppText variant="label">{exercise.expectedAnswer}</AppText>
        </View>
      </View>
      <View style={styles.section}>
        <AppText variant="subtitle">Explication</AppText>
        <AppText tone="secondary">{exercise.explanation}</AppText>
      </View>
      <View style={styles.section}>
        <AppText variant="subtitle">Méthode</AppText>
        {exercise.correctionSteps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepIndex}>
              <AppText variant="caption" tone="inverse">{index + 1}</AppText>
            </View>
            <AppText style={styles.stepText} tone="secondary">{step}</AppText>
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

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
  },
  answerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  answerBox: {
    minWidth: 160,
    flex: 1,
    gap: spacing[1],
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    padding: spacing[3],
  },
  expectedBox: {
    borderColor: colors.secondary,
    backgroundColor: "#EEF8F4",
  },
  section: {
    gap: spacing[2],
  },
  stepRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing[3],
  },
  stepIndex: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.secondary,
  },
  stepText: {
    flex: 1,
  },
});

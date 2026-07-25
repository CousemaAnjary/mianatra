import { StyleSheet, View } from "react-native";
import { AppCard, AppText, ProgressBar, StatusBadge } from "@/src/components/shared";
import { colors, radius, spacing } from "@/src/theme";
import type { SessionSummary } from "../types/study-session.types";

type SessionReportProps = {
  summary: SessionSummary;
};

export function SessionReport({ summary }: SessionReportProps) {
  return (
    <AppCard accessibilityLabel="Rapport de séance" style={styles.card}>
      <View style={styles.scoreBlock}>
        <StatusBadge
          label={`${summary.correctAnswers}/${summary.totalExercises} réponses correctes`}
          tone={summary.score >= 70 ? "success" : "progress"}
        />
        <AppText variant="title">{summary.score}%</AppText>
        <ProgressBar value={summary.score} />
      </View>
      <View style={styles.section}>
        <AppText variant="subtitle">Point fort</AppText>
        <AppText tone="secondary">{summary.strength}</AppText>
      </View>
      <View style={styles.section}>
        <AppText variant="subtitle">À renforcer</AppText>
        <AppText tone="secondary">{summary.notionToImprove}</AppText>
      </View>
      <View style={styles.section}>
        <AppText variant="subtitle">Prochaine étape</AppText>
        <AppText tone="secondary">{summary.nextRecommendation}</AppText>
      </View>
      <View style={styles.targetedBox}>
        <AppText variant="label">Exercices ciblés disponibles</AppText>
        <AppText tone="secondary">
          {summary.targetedExercises.length} exercices statiques liés à la notion à renforcer.
        </AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
  },
  scoreBlock: {
    gap: spacing[2],
  },
  section: {
    gap: spacing[2],
  },
  targetedBox: {
    gap: spacing[2],
    borderColor: colors.accent,
    borderRadius: radius.medium,
    borderWidth: 1,
    backgroundColor: "#FFF3D2",
    padding: spacing[4],
  },
});

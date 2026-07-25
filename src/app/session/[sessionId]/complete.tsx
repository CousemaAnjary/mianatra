import { StyleSheet } from "react-native";
import {
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
  StatusBadge,
} from "@/src/components/shared";
import { demoSession } from "@/src/data/demo-data";
import { spacing } from "@/src/theme";

export default function SessionCompleteScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Rapport de séance" subtitle="Session terminée" showBack />
      <AppCard style={styles.card}>
        <StatusBadge
          label={`${demoSession.correctAnswers}/${demoSession.totalExercises} réponses correctes`}
          tone="success"
        />
        <AppText variant="subtitle">Point fort</AppText>
        <AppText tone="secondary">{demoSession.strength}</AppText>
        <AppText variant="subtitle">À renforcer</AppText>
        <AppText tone="secondary">{demoSession.notionToImprove}</AppText>
        <AppText variant="subtitle">Prochaine étape</AppText>
        <AppText tone="secondary">{demoSession.nextRecommendation}</AppText>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[3],
  },
});

import { StyleSheet, View } from "react-native";
import { AppCard, AppText } from "@/src/components/shared";
import { colors, spacing } from "@/src/theme";
import { CourseProgressRing } from "./CourseProgressRing";

type CourseProgressCardProps = {
  progress: number;
  mastered: number;
  progressing: number;
  needsWork: number;
};

export function CourseProgressCard({
  progress,
  mastered,
  progressing,
  needsWork,
}: CourseProgressCardProps) {
  return (
    <AppCard style={styles.card}>
      <AppText variant="subtitle">Progression du chapitre</AppText>
      <View style={styles.content}>
        <CourseProgressRing value={progress} />
        <View style={styles.legend}>
          <LegendRow color={colors.secondary} label="Maîtrisé" value={`${mastered} notions`} />
          <LegendRow color={colors.accent} label="En progression" value={`${progressing} notions`} />
          <LegendRow color={colors.primary} label="À renforcer" value={`${needsWork} notions`} />
        </View>
      </View>
    </AppCard>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText style={styles.legendLabel}>{label}</AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
    backgroundColor: colors.surfaceSoft,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  legend: {
    flex: 1,
    gap: spacing[3],
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendLabel: {
    flex: 1,
  },
});

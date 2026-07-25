import { StyleSheet, View } from "react-native";
import { AppCard, AppText } from "@/src/components/shared";
import type { DemoResultCounters } from "@/src/data/demo-data";
import { colors, spacing } from "@/src/theme";

type CourseResultSummaryProps = {
  counters: DemoResultCounters;
};

export function CourseResultSummary({ counters }: CourseResultSummaryProps) {
  return (
    <View style={styles.row}>
      <CounterCard label="Maîtrisé" value={`${counters.mastered} notions`} color={colors.secondary} />
      <CounterCard label="En progression" value={`${counters.progressing} notions`} color={colors.accent} />
      <CounterCard label="À renforcer" value={`${counters.needsWork} notions`} color={colors.primary} />
    </View>
  );
}

function CounterCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <AppCard style={[styles.card, { borderColor: color }]}>
      <AppText variant="label" style={{ color }}>
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing[2],
  },
  card: {
    flex: 1,
    minHeight: 112,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[2],
  },
});

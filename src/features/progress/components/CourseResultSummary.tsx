import { View } from "react-native";
import { AppCard, AppText } from "@/src/components/shared";
import type { CourseResultCounters } from "@/src/features/courses";
import { colors } from "@/src/theme";

type CourseResultSummaryProps = {
  counters: CourseResultCounters;
};

export function CourseResultSummary({ counters }: CourseResultSummaryProps) {
  return (
    <View className="flex-row gap-2">
      <CounterCard label="Maîtrisé" value={`${counters.mastered} notions`} color={colors.secondary} />
      <CounterCard label="En progression" value={`${counters.progressing} notions`} color={colors.accent} />
      <CounterCard label="À renforcer" value={`${counters.needsWork} notions`} color={colors.primary} />
    </View>
  );
}

function CounterCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <AppCard className="min-h-28 flex-1 items-center justify-center gap-2 px-2" style={{ borderColor: color }}>
      <AppText variant="label" style={{ color }}>
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </AppCard>
  );
}

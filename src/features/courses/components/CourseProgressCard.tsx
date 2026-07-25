import { View } from "react-native";
import { AppCard, AppText } from "@/src/components/shared";
import { colors } from "@/src/theme";
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
    <AppCard className="gap-4 bg-[#FAF1E2]">
      <AppText variant="subtitle">Progression du chapitre</AppText>
      <View className="flex-row items-center gap-4">
        <CourseProgressRing value={progress} />
        <View className="flex-1 gap-3">
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
    <View className="flex-row items-center gap-2">
      <View className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
      <AppText className="flex-1">{label}</AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

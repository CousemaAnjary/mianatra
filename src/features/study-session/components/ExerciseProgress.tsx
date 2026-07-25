import { View } from "react-native";
import { AppText, ProgressBar } from "@/src/components/shared";

type ExerciseProgressProps = {
  current: number;
  total: number;
};

export function ExerciseProgress({ current, total }: ExerciseProgressProps) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current }}
      className="gap-2"
    >
      <View className="flex-row items-center justify-between">
        <AppText variant="label">Exercice {current} sur {total}</AppText>
        <AppText variant="caption" tone="secondary">
          {progress}%
        </AppText>
      </View>
      <ProgressBar value={progress} />
    </View>
  );
}

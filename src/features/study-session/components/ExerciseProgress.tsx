import { StyleSheet, View } from "react-native";
import { AppText, ProgressBar } from "@/src/components/shared";
import { spacing } from "@/src/theme";

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
      style={styles.container}
    >
      <View style={styles.row}>
        <AppText variant="label">Exercice {current} sur {total}</AppText>
        <AppText variant="caption" tone="secondary">
          {progress}%
        </AppText>
      </View>
      <ProgressBar value={progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

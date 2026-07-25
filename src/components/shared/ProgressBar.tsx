import { StyleSheet, View } from "react-native";
import { colors, radius } from "@/src/theme";

type ProgressBarProps = {
  value: number;
  accessibilityLabel?: string;
  color?: string;
};

export function ProgressBar({ value, accessibilityLabel, color = colors.secondary }: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(100, value));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: normalizedValue }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${normalizedValue}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
  },
});

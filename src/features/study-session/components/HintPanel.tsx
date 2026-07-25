import { StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/shared";
import { colors, radius, spacing } from "@/src/theme";

type HintPanelProps = {
  hint: string;
};

export function HintPanel({ hint }: HintPanelProps) {
  return (
    <View accessibilityRole="text" style={styles.panel}>
      <AppText variant="label">Indice</AppText>
      <AppText tone="secondary">{hint}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing[2],
    borderColor: colors.accent,
    borderRadius: radius.medium,
    borderWidth: 1,
    backgroundColor: "#FFF3D2",
    padding: spacing[4],
  },
});

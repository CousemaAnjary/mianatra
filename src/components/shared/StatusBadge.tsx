import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/src/theme";
import { AppText } from "./AppText";

type StatusBadgeTone = "success" | "progress" | "warning";

type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
};

const badgeColor: Record<StatusBadgeTone, string> = {
  success: colors.secondary,
  progress: colors.accent,
  warning: colors.primary,
};

export function StatusBadge({ label, tone = "progress" }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { borderColor: badgeColor[tone] }]}>
      <AppText variant="caption" tone="primary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 32,
    alignSelf: "flex-start",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    backgroundColor: colors.surface,
  },
});

import { Text, type TextProps, StyleSheet } from "react-native";
import { colors, typography } from "@/src/theme";

type AppTextVariant = keyof typeof typography;
type AppTextTone = "primary" | "secondary" | "muted" | "inverse" | "error";

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  tone?: AppTextTone;
};

const toneColor: Record<AppTextTone, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  inverse: colors.white,
  error: colors.error,
};

export function AppText({
  variant = "body",
  tone = "primary",
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[styles.base, typography[variant], { color: toneColor[tone] }, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0,
  },
});

import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from "react-native";
import { colors, radius, spacing } from "@/src/theme";
import { AppText } from "./AppText";

type AppButtonVariant = "primary" | "secondary" | "tertiary";

type AppButtonProps = PressableProps & {
  title: string;
  variant?: AppButtonVariant;
  loading?: boolean;
};

export function AppButton({
  title,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const textTone = variant === "primary" ? "inverse" : "primary";

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        styles[variant],
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.white : colors.primary} />
      ) : (
        <AppText variant="label" tone={textTone}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  tertiary: {
    backgroundColor: colors.surfaceSoft,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.5,
  },
});

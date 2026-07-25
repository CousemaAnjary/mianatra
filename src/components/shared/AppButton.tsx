import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { colors, radius, spacing } from "@/src/theme";
import { AppText } from "./AppText";

type AppButtonVariant = "primary" | "secondary" | "tertiary";
type ButtonIconName = React.ComponentProps<typeof FontAwesome5>["name"];

type AppButtonProps = PressableProps & {
  title: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  iconName?: ButtonIconName;
  iconPosition?: "left" | "right";
};

export function AppButton({
  title,
  variant = "primary",
  loading = false,
  disabled = false,
  iconName,
  iconPosition = "left",
  style,
  accessibilityLabel,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const textTone = variant === "primary" ? "inverse" : "primary";
  const iconColor = variant === "primary" ? colors.white : colors.textPrimary;
  const icon = iconName ? (
    <FontAwesome5 name={iconName} size={16} color={iconColor} />
  ) : null;

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
        <>
          {iconPosition === "left" ? icon : null}
          <AppText variant="label" tone={textTone}>
            {title}
          </AppText>
          {iconPosition === "right" ? icon : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    minWidth: 44,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing[2],
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

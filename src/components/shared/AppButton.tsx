import { ActivityIndicator, StyleSheet, type PressableProps } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Button, ButtonText } from "@/src/components/ui/button";
import { colors, radius, spacing } from "@/src/theme";

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
    <Button
      {...props}
      action={variant === "primary" ? "primary" : "secondary"}
      variant={variant === "primary" || variant === "tertiary" ? "solid" : "outline"}
      size="xl"
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
          <ButtonText style={[styles.text, { color: textTone === "inverse" ? colors.white : colors.textPrimary }]}>
            {title}
          </ButtonText>
          {iconPosition === "right" ? icon : null}
        </>
      )}
    </Button>
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
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
  },
  tertiary: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 20,
  },
});

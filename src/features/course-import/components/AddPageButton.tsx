import { Pressable, StyleSheet } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppText } from "@/src/components/shared";
import { colors, radius, spacing } from "@/src/theme";

type AddPageButtonProps = {
  onPress: () => void;
};

export function AddPageButton({ onPress }: AddPageButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ajouter une autre page de démonstration"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <FontAwesome5 name="plus" size={20} color={colors.textPrimary} />
      <AppText variant="label">Ajouter une autre page</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[3],
    borderRadius: radius.large,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.76,
  },
});

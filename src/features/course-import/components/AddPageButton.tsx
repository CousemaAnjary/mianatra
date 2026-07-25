import { Pressable } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppText } from "@/src/components/shared";
import { colors } from "@/src/theme";

type AddPageButtonProps = {
  onPress: () => void;
  disabled?: boolean;
};

export function AddPageButton({ onPress, disabled = false }: AddPageButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Choisir des images depuis la galerie"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={["min-h-[76px] flex-row items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#D94B24] bg-[#FFFDF8] active:opacity-75", disabled ? "opacity-50" : ""].join(" ")}
    >
      <FontAwesome5 name="plus" size={20} color={colors.textPrimary} />
      <AppText variant="label">Choisir des images</AppText>
    </Pressable>
  );
}

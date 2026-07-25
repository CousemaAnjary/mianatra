import { Pressable } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppText } from "@/src/components/shared";
import { colors } from "@/src/theme";

type AddPageButtonProps = {
  onPress: () => void;
};

export function AddPageButton({ onPress }: AddPageButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ajouter une autre page de démonstration"
      onPress={onPress}
      className="min-h-[76px] flex-row items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#D94B24] bg-[#FFFDF8] active:opacity-75"
    >
      <FontAwesome5 name="plus" size={20} color={colors.textPrimary} />
      <AppText variant="label">Ajouter une autre page</AppText>
    </Pressable>
  );
}

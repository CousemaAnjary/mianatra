import { Pressable, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppText } from "@/src/components/shared";
import type { DemoProfileMenuItem } from "@/src/data/demo-data";
import { colors } from "@/src/theme";

type ProfileMenuRowProps = {
  item: DemoProfileMenuItem;
  onPress: (item: DemoProfileMenuItem) => void;
};

export function ProfileMenuRow({ item, onPress }: ProfileMenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      onPress={() => onPress(item)}
      className="min-h-[58px] flex-row items-center justify-between gap-4 active:opacity-70"
    >
      <View className="flex-row items-center gap-4">
        <FontAwesome5 name={item.iconName} size={22} color={colors.textSecondary} />
        <AppText variant="label">{item.label}</AppText>
      </View>
      <FontAwesome5 name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

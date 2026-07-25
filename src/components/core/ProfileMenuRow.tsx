import { Pressable, StyleSheet, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppText } from "@/src/components/shared";
import type { DemoProfileMenuItem } from "@/src/data/demo-data";
import { colors, spacing } from "@/src/theme";

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
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <FontAwesome5 name={item.iconName} size={22} color={colors.textSecondary} />
        <AppText variant="label">{item.label}</AppText>
      </View>
      <FontAwesome5 name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  pressed: {
    opacity: 0.72,
  },
});

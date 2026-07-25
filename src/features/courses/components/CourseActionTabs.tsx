import { Pressable, StyleSheet, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppText } from "@/src/components/shared";
import { colors, radius, spacing } from "@/src/theme";

type CourseActionTab = {
  id: string;
  label: string;
  iconName: string;
  onPress: () => void;
};

type CourseActionTabsProps = {
  tabs: CourseActionTab[];
};

export function CourseActionTabs({ tabs }: CourseActionTabsProps) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          accessibilityRole="button"
          accessibilityLabel={tab.label}
          onPress={tab.onPress}
          style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
        >
          <FontAwesome5 name={tab.iconName} size={22} color={colors.textPrimary} />
          <AppText variant="label" style={styles.tabLabel}>
            {tab.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  tab: {
    minHeight: 92,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    padding: spacing[2],
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  tabLabel: {
    textAlign: "center",
  },
  pressed: {
    backgroundColor: colors.surfaceSoft,
  },
});

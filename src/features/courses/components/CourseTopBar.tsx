import { Pressable, StyleSheet, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import { AppText } from "@/src/components/shared";
import { colors, radius, spacing } from "@/src/theme";

type CourseTopBarProps = {
  title: string;
  onOptionsPress?: () => void;
};

export function CourseTopBar({ title, onOptionsPress }: CourseTopBarProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/courses"))}
        style={styles.iconButton}
      >
        <FontAwesome5 name="arrow-left" size={20} color={colors.textPrimary} />
      </Pressable>
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Options du cours"
        onPress={onOptionsPress}
        style={styles.iconButton}
      >
        <FontAwesome5 name="ellipsis-h" size={20} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
});

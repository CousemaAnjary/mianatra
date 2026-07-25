import { Pressable, StyleSheet, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import { AppText } from "@/src/components/shared";
import { colors, radius, spacing } from "@/src/theme";

type ImportStepHeaderProps = {
  onOptionsPress: () => void;
};

export function ImportStepHeader({ onOptionsPress }: ImportStepHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/courses"))}
          style={styles.iconButton}
        >
          <FontAwesome5 name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <AppText variant="heading" style={styles.title}>
          Ajouter un cours
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Options d'import"
          onPress={onOptionsPress}
          style={styles.iconButton}
        >
          <FontAwesome5 name="ellipsis-h" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>
      <AppText variant="subtitle" tone="secondary" style={styles.stepText}>
        Étape 2 sur 3
      </AppText>
      <View accessibilityLabel="Progression d'import : étape 2 sur 3" style={styles.segments}>
        <View style={[styles.segment, styles.segmentActive]} />
        <View style={[styles.segment, styles.segmentActive]} />
        <View style={styles.segment} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing[3],
  },
  topRow: {
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
  stepText: {
    textAlign: "center",
  },
  segments: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[2],
  },
  segment: {
    width: 86,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
});

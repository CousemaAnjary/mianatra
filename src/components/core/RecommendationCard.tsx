import { Image, StyleSheet, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppButton, AppCard, AppText, StatusBadge } from "@/src/components/shared";
import type { DemoCourse } from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";

type RecommendationCardProps = {
  course: DemoCourse;
  onContinue: () => void;
};

export function RecommendationCard({ course, onContinue }: RecommendationCardProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          <AppText variant="label">À faire maintenant</AppText>
          <AppText variant="heading">{course.subject}</AppText>
          <AppText variant="subtitle">{course.title}</AppText>
          <AppText tone="secondary">
            Tu avais des difficultés sur la lecture des graphiques.
          </AppText>
          <View style={styles.duration}>
            <FontAwesome5 name="clock" size={16} color={colors.textSecondary} />
            <AppText tone="secondary">Environ 10 minutes</AppText>
          </View>
        </View>
        <Image
          source={require("../../../assets/mianatra/image_mini_function_graph.png")}
          accessibilityLabel="Miniature du graphique de fonction"
          accessibilityIgnoresInvertColors
          style={styles.image}
        />
      </View>
      <StatusBadge label="Lecture des graphiques" tone="progress" />
      <AppButton
        title="Continuer ma révision"
        iconName="arrow-right"
        iconPosition="right"
        onPress={onContinue}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  copy: {
    flex: 1,
    gap: spacing[2],
  },
  duration: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  image: {
    width: 108,
    height: 108,
    borderRadius: radius.large,
    borderWidth: 3,
    borderColor: colors.surface,
    transform: [{ rotate: "3deg" }],
  },
});

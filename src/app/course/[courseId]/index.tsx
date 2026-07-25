import { Image, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
} from "@/src/components/shared";
import { demoCourse } from "@/src/data/demo-data";
import { radius, spacing } from "@/src/theme";

export default function CourseDetailScreen() {
  return (
    <AppScreen>
      <ScreenHeader title="Détail du cours" subtitle={demoCourse.title} showBack />
      <AppCard style={styles.card}>
        <Image
          source={require("../../../../assets/mianatra/sample_course_page_2.png")}
          accessibilityIgnoresInvertColors
          style={styles.image}
        />
        <AppText variant="subtitle">{demoCourse.title}</AppText>
        <AppText tone="secondary">
          La coquille du détail de cours est prête avec les actions principales.
        </AppText>
        <View style={styles.actions}>
          <AppButton
            title="Fiche de révision"
            onPress={() =>
              router.push({
                pathname: "/course/[courseId]/revision-sheet",
                params: { courseId: demoCourse.id },
              })
            }
          />
          <AppButton
            title="Résultats"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/course/[courseId]/results",
                params: { courseId: demoCourse.id },
              })
            }
          />
        </View>
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: radius.large,
  },
  actions: {
    gap: spacing[3],
  },
});

import { Image, ImageBackground, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ProgressBar,
  ScreenHeader,
  StatusBadge,
} from "@/src/components/shared";
import { demoCourse, demoProfile, demoSession } from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";

export default function HomeScreen() {
  return (
    <AppScreen>
      <ScreenHeader
        title={`Bonjour ${demoProfile.firstName}`}
        subtitle="Mianatra"
        showBack={false}
      />

      <ImageBackground
        source={require("../../../assets/mianatra/pattern_lamba_horizontal.png")}
        resizeMode="cover"
        imageStyle={styles.heroPattern}
        style={styles.hero}
      >
        <View style={styles.heroText}>
          <AppText variant="heading">Coquille prête</AppText>
          <AppText tone="secondary">
            La navigation principale et les routes de base sont disponibles.
          </AppText>
        </View>
        <Image
          source={require("../../../assets/mianatra/image_mini_function_graph.png")}
          accessibilityIgnoresInvertColors
          style={styles.heroImage}
        />
      </ImageBackground>

      <AppCard style={styles.card}>
        <StatusBadge label={demoCourse.subject} tone="success" />
        <AppText variant="subtitle">{demoCourse.title}</AppText>
        <AppText tone="secondary">
          {demoCourse.pageCount} pages importées pour la démonstration.
        </AppText>
        <ProgressBar
          value={demoCourse.progress}
          accessibilityLabel="Progression du cours de démonstration"
        />
        <AppText variant="caption" tone="muted">
          Progression visuelle : {demoCourse.progress} %
        </AppText>
      </AppCard>

      <View style={styles.actions}>
        <AppButton title="Mes cours" onPress={() => router.push("/courses")} />
        <AppButton
          title="Détail du cours"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/course/[courseId]",
              params: { courseId: demoCourse.id },
            })
          }
        />
        <AppButton
          title="Session d'exercices"
          variant="tertiary"
          onPress={() =>
            router.push({
              pathname: "/session/[sessionId]",
              params: { sessionId: demoSession.id },
            })
          }
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 188,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    overflow: "hidden",
    borderRadius: radius.xl,
    padding: spacing[5],
    marginBottom: spacing[5],
    backgroundColor: colors.surfaceSoft,
  },
  heroPattern: {
    opacity: 0.18,
  },
  heroText: {
    flex: 1,
    gap: spacing[2],
  },
  heroImage: {
    width: 112,
    height: 112,
    borderRadius: radius.large,
  },
  card: {
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  actions: {
    gap: spacing[3],
  },
});

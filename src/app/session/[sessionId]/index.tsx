import { Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
} from "@/src/components/shared";
import { demoSession } from "@/src/data/demo-data";
import { radius, spacing } from "@/src/theme";

export default function SessionScreen() {
  const graphQuestion = demoSession.exercises[0];

  return (
    <AppScreen>
      <ScreenHeader title="Session d'exercices" subtitle="Graphique et fonctions" showBack />
      <AppCard style={styles.card}>
        <Image
          source={require("../../../../assets/mianatra/image_function_graph_exercise.png")}
          accessibilityIgnoresInvertColors
          style={styles.image}
        />
        <AppText variant="subtitle">{graphQuestion.title}</AppText>
        <AppText tone="secondary">{graphQuestion.question}</AppText>
        <AppButton
          title="Voir la correction"
          onPress={() =>
            router.push({
              pathname: "/session/[sessionId]/correction",
              params: { sessionId: demoSession.id },
            })
          }
        />
        <AppButton
          title="Terminer la session"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/session/[sessionId]/complete",
              params: { sessionId: demoSession.id },
            })
          }
        />
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
    height: 220,
    borderRadius: radius.large,
  },
});

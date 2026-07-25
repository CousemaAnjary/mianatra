import { Image, StyleSheet, View } from "react-native";
import { AppCard, AppText, StatusBadge } from "@/src/components/shared";
import type { DemoExercise } from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";

type ExerciseContentProps = {
  exercise: DemoExercise;
};

export function ExerciseContent({ exercise }: ExerciseContentProps) {
  return (
    <AppCard accessibilityLabel={`Exercice ${exercise.title}`} style={styles.card}>
      <View style={styles.badges}>
        <StatusBadge label={exercise.conceptName} tone="progress" />
        {exercise.generatedFromWeakness ? (
          <StatusBadge label="Série ciblée" tone="warning" />
        ) : null}
      </View>
      {exercise.image === "function-graph" ? (
        <Image
          source={require("../../../../assets/mianatra/image_function_graph_exercise.png")}
          accessibilityIgnoresInvertColors
          accessibilityLabel="Graphique d'une parabole utilisé pour répondre à l'exercice"
          resizeMode="cover"
          style={styles.image}
        />
      ) : null}
      <View style={styles.questionGroup}>
        <AppText variant="subtitle">{exercise.title}</AppText>
        <AppText tone="secondary">{exercise.question}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[4],
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  image: {
    width: "100%",
    height: 220,
    borderColor: colors.border,
    borderRadius: radius.large,
    borderWidth: 1,
  },
  questionGroup: {
    gap: spacing[2],
  },
});

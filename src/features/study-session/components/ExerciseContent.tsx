import { Image, View } from "react-native";
import { AppCard, AppText, StatusBadge } from "@/src/components/shared";
import type { DemoExercise } from "@/src/data/demo-data";

type ExerciseContentProps = {
  exercise: DemoExercise;
};

export function ExerciseContent({ exercise }: ExerciseContentProps) {
  return (
    <AppCard accessibilityLabel={`Exercice ${exercise.title}`} className="gap-4">
      <View className="flex-row flex-wrap gap-2">
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
          className="h-[220px] w-full rounded-2xl border border-[#E8D9C7]"
        />
      ) : null}
      <View className="gap-2">
        <AppText variant="subtitle">{exercise.title}</AppText>
        <AppText tone="secondary">{exercise.question}</AppText>
      </View>
    </AppCard>
  );
}

import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/src/components/shared";
import type { DemoExercise } from "@/src/data/demo-data";
import { colors, radius, spacing, typography } from "@/src/theme";

type ExerciseAnswerControlProps = {
  exercise: DemoExercise;
  answer: string;
  onChangeAnswer: (answer: string) => void;
};

export function ExerciseAnswerControl({
  exercise,
  answer,
  onChangeAnswer,
}: ExerciseAnswerControlProps) {
  if (exercise.type === "short-answer") {
    return (
      <View style={styles.container}>
        <AppText variant="label">Ta réponse</AppText>
        <TextInput
          accessibilityLabel="Réponse de l'exercice"
          autoCapitalize="none"
          onChangeText={onChangeAnswer}
          placeholder="Écris ta réponse"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          style={styles.input}
          value={answer}
        />
      </View>
    );
  }

  return (
    <View accessibilityRole="radiogroup" style={styles.container}>
      <AppText variant="label">Choisis une réponse</AppText>
      <View style={styles.options}>
        {(exercise.options ?? []).map((option) => {
          const selected = option === answer;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel={`Réponse ${option}`}
              accessibilityState={{ selected }}
              key={option}
              onPress={() => onChangeAnswer(option)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View style={[styles.dot, selected && styles.dotSelected]} />
              <AppText variant="label">{option}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  input: {
    minHeight: 54,
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: spacing[4],
    ...typography.body,
  },
  options: {
    gap: spacing[3],
  },
  option: {
    minHeight: 54,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing[3],
    borderColor: colors.border,
    borderRadius: radius.medium,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: spacing[4],
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#FFF0EA",
  },
  dot: {
    width: 18,
    height: 18,
    borderColor: colors.border,
    borderRadius: 9,
    borderWidth: 2,
  },
  dotSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
});

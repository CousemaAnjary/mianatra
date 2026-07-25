import { Pressable, TextInput, View } from "react-native";
import { AppText } from "@/src/components/shared";
import { colors } from "@/src/theme";
import { getAnswerControlKind, type SessionAnswerExercise } from "../utils/session-answer-rendering";

type ExerciseAnswerControlProps = {
  exercise: SessionAnswerExercise;
  answer: string;
  onChangeAnswer: (answer: string) => void;
};

export function ExerciseAnswerControl({
  exercise,
  answer,
  onChangeAnswer,
}: ExerciseAnswerControlProps) {
  const kind = getAnswerControlKind(exercise.type);

  if (kind === "short_answer" || kind === "numeric") {
    return (
      <View className="gap-3">
        <AppText variant="label">Ta réponse</AppText>
        <TextInput
          accessibilityLabel="Réponse de l'exercice"
          autoCapitalize="none"
          inputMode={kind === "numeric" ? "decimal" : "text"}
          keyboardType={kind === "numeric" ? "decimal-pad" : "default"}
          onChangeText={onChangeAnswer}
          placeholder={kind === "numeric" ? "Écris un nombre" : "Écris ta réponse"}
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          className="min-h-[54px] rounded-xl border border-[#E8D9C7] bg-[#FFFDF8] px-4 text-base leading-6 text-[#2F241F]"
          value={answer}
        />
      </View>
    );
  }

  if (kind === "unsupported") {
    return (
      <View className="gap-3">
        <AppText variant="label">{"Ce type d'exercice n'est pas pris en charge."}</AppText>
        <AppText tone="secondary">Retourne au cours ou réessaie plus tard.</AppText>
      </View>
    );
  }

  const options = kind === "true_false" ? ["Vrai", "Faux"] : exercise.options ?? [];

  return (
    <View accessibilityRole="radiogroup" className="gap-3">
      <AppText variant="label">Choisis une réponse</AppText>
      <View className="gap-3">
        {options.map((option) => {
          const selected = option === answer;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel={`Réponse ${option}`}
              accessibilityState={{ selected }}
              key={option}
              onPress={() => onChangeAnswer(option)}
              className={[
                "min-h-[54px] flex-row items-center gap-3 rounded-xl border p-4",
                selected ? "border-[#D94B24] bg-[#FFF0EA]" : "border-[#E8D9C7] bg-[#FFFDF8]",
              ].join(" ")}
            >
              <View className={["h-[18px] w-[18px] rounded-full border-2", selected ? "border-[#D94B24] bg-[#D94B24]" : "border-[#E8D9C7]"].join(" ")} />
              <AppText variant="label">{option}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

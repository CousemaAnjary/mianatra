import { TextInput, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppText } from "@/src/components/shared";
import type { DemoGrade } from "@/src/data/demo-data";
import { colors } from "@/src/theme";
import { ClassSelector } from "./ClassSelector";

type OnboardingFormProps = {
  firstName: string;
  age: string;
  selectedGrade: DemoGrade;
  grades: DemoGrade[];
  nameError?: string;
  ageError?: string;
  onChangeFirstName: (value: string) => void;
  onChangeAge: (value: string) => void;
  onSelectGrade: (grade: DemoGrade) => void;
};

export function OnboardingForm({
  firstName,
  age,
  selectedGrade,
  grades,
  nameError,
  ageError,
  onChangeFirstName,
  onChangeAge,
  onSelectGrade,
}: OnboardingFormProps) {
  return (
    <View className="gap-3">
      <View className="gap-2">
        <AppText variant="label">{"Comment veux-tu qu'on t'appelle ?"}</AppText>
        <View className={["min-h-[52px] flex-row items-center gap-3 rounded-2xl border bg-[#FFFDF8] px-4", nameError ? "border-[#B53434]" : "border-[#E8D9C7]"].join(" ")}>
          <FontAwesome5 name="user" size={20} color={colors.textSecondary} />
          <TextInput
            accessibilityLabel="Prénom ou pseudonyme"
            value={firstName}
            onChangeText={onChangeFirstName}
            placeholder="Fara"
            placeholderTextColor={colors.textMuted}
            className="min-h-[50px] flex-1 text-[17px] font-bold text-[#2F241F]"
            returnKeyType="next"
          />
        </View>
        {nameError ? (
          <AppText variant="caption" tone="error">
            {nameError}
          </AppText>
        ) : null}
      </View>

      <View className="gap-2">
        <AppText variant="label">Quel âge as-tu ?</AppText>
        <View className={["min-h-[52px] flex-row items-center gap-3 rounded-2xl border bg-[#FFFDF8] px-4", ageError ? "border-[#B53434]" : "border-[#E8D9C7]"].join(" ")}>
          <FontAwesome5 name="birthday-cake" size={20} color={colors.textSecondary} />
          <TextInput
            accessibilityLabel="Âge"
            value={age}
            onChangeText={(value) => onChangeAge(value.replace(/[^0-9]/g, ""))}
            placeholder="17"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            className="min-h-[50px] flex-1 text-[17px] font-bold text-[#2F241F]"
          />
          <AppText tone="secondary">ans</AppText>
        </View>
        {ageError ? (
          <AppText variant="caption" tone="error">
            {ageError}
          </AppText>
        ) : null}
      </View>

      <View className="gap-2">
        <AppText variant="label">Quelle est ta classe ?</AppText>
        <ClassSelector
          grades={grades}
          selectedGrade={selectedGrade}
          onSelect={onSelectGrade}
        />
      </View>
    </View>
  );
}

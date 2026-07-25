import { View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppText } from "@/src/components/shared";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Input, InputField, InputSlot } from "@/src/components/ui/input";
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
      <FormControl isInvalid={Boolean(nameError)} className="gap-2">
        <FormControlLabel>
          <FormControlLabelText className="text-[17px] font-bold leading-6 text-[#2F241F]">
            {"Comment veux-tu qu'on t'appelle ?"}
          </FormControlLabelText>
        </FormControlLabel>
        <Input
          size="xl"
          variant="outline"
          className={[
            "h-[52px] rounded-2xl border bg-[#FFFDF8] px-4",
            nameError ? "border-[#B53434]" : "border-[#E8D9C7]",
          ].join(" ")}
        >
          <InputSlot className="pr-2">
            <FontAwesome5 name="user" size={20} color={colors.textSecondary} />
          </InputSlot>
          <InputField
            accessibilityLabel="Prénom ou pseudonyme"
            value={firstName}
            onChangeText={onChangeFirstName}
            placeholder="Fara"
            placeholderTextColor={colors.textMuted}
            className="px-0 text-[17px] font-bold leading-6 text-[#2F241F]"
            returnKeyType="next"
          />
        </Input>
        {nameError ? (
          <FormControlError>
            <FormControlErrorText className="text-xs font-semibold text-[#B53434]">
              {nameError}
            </FormControlErrorText>
          </FormControlError>
        ) : null}
      </FormControl>

      <FormControl isInvalid={Boolean(ageError)} className="gap-2">
        <FormControlLabel>
          <FormControlLabelText className="text-[17px] font-bold leading-6 text-[#2F241F]">
            Quel âge as-tu ?
          </FormControlLabelText>
        </FormControlLabel>
        <Input
          size="xl"
          variant="outline"
          className={[
            "h-[52px] rounded-2xl border bg-[#FFFDF8] px-4",
            ageError ? "border-[#B53434]" : "border-[#E8D9C7]",
          ].join(" ")}
        >
          <InputSlot className="pr-2">
            <FontAwesome5 name="birthday-cake" size={20} color={colors.textSecondary} />
          </InputSlot>
          <InputField
            accessibilityLabel="Âge"
            value={age}
            onChangeText={(value) => onChangeAge(value.replace(/[^0-9]/g, ""))}
            placeholder="17"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            className="px-0 text-[17px] font-bold leading-6 text-[#2F241F]"
          />
          <InputSlot className="pl-2">
            <AppText tone="secondary">ans</AppText>
          </InputSlot>
        </Input>
        {ageError ? (
          <FormControlError>
            <FormControlErrorText className="text-xs font-semibold text-[#B53434]">
              {ageError}
            </FormControlErrorText>
          </FormControlError>
        ) : null}
      </FormControl>

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

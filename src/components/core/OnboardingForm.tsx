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
import { colors } from "@/src/theme";
import { ClassSelector } from "./ClassSelector";

type OnboardingFormProps = {
  displayName: string;
  age: string;
  selectedGrade: string;
  grades: string[];
  series: string;
  schoolName: string;
  nameError?: string;
  ageError?: string;
  gradeError?: string;
  onChangeDisplayName: (value: string) => void;
  onChangeAge: (value: string) => void;
  onSelectGrade: (grade: string) => void;
  onChangeSeries: (value: string) => void;
  onChangeSchoolName: (value: string) => void;
  showOptionalDetails?: boolean;
};

export function OnboardingForm({
  displayName,
  age,
  selectedGrade,
  grades,
  series,
  schoolName,
  nameError,
  ageError,
  gradeError,
  onChangeDisplayName,
  onChangeAge,
  onSelectGrade,
  onChangeSeries,
  onChangeSchoolName,
  showOptionalDetails = true,
}: OnboardingFormProps) {
  return (
    <View className="gap-3">
      <FormControl isInvalid={Boolean(nameError)} className="gap-2">
        <FormControlLabel>
          <FormControlLabelText className="text-[14px] font-bold leading-5 text-[#2F241F]">
            {"Comment veux-tu qu'on t'appelle ?"}
          </FormControlLabelText>
        </FormControlLabel>
        <Input
          size="xl"
          variant="outline"
          className={[
            "h-[48px] rounded-xl border bg-[#FFFDF8] px-4",
            nameError ? "border-[#B53434]" : "border-[#E8D9C7]",
          ].join(" ")}
        >
          <InputSlot className="pr-2">
            <FontAwesome5 name="user" size={16} color={colors.textSecondary} />
          </InputSlot>
          <InputField
            accessibilityLabel="Prénom ou pseudonyme"
            value={displayName}
            onChangeText={onChangeDisplayName}
            placeholder="Ton prénom"
            placeholderTextColor={colors.textMuted}
            className="px-0 text-[15px] font-semibold leading-5 text-[#2F241F]"
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
          <FormControlLabelText className="text-[14px] font-bold leading-5 text-[#2F241F]">
            Quel âge as-tu ?
          </FormControlLabelText>
        </FormControlLabel>
        <Input
          size="xl"
          variant="outline"
          className={[
            "h-[48px] rounded-xl border bg-[#FFFDF8] px-4",
            ageError ? "border-[#B53434]" : "border-[#E8D9C7]",
          ].join(" ")}
        >
          <InputSlot className="pr-2">
            <FontAwesome5 name="birthday-cake" size={16} color={colors.textSecondary} />
          </InputSlot>
          <InputField
            accessibilityLabel="Âge"
            value={age}
            onChangeText={(value) => onChangeAge(value.replace(/[^0-9]/g, ""))}
            placeholder="17"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            className="px-0 text-[15px] font-semibold leading-5 text-[#2F241F]"
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

      <FormControl isInvalid={Boolean(gradeError)} className="gap-2">
        <AppText variant="label" className="text-[14px] leading-5">Quelle est ta classe ?</AppText>
        <ClassSelector
          grades={grades}
          selectedGrade={selectedGrade}
          onSelect={onSelectGrade}
        />
        {gradeError ? (
          <FormControlError>
            <FormControlErrorText className="text-xs font-semibold text-[#B53434]">
              {gradeError}
            </FormControlErrorText>
          </FormControlError>
        ) : null}
      </FormControl>

      {showOptionalDetails ? (
        <>
          <FormControl className="gap-2">
            <FormControlLabel>
              <FormControlLabelText className="text-[14px] font-bold leading-5 text-[#2F241F]">
                Série
              </FormControlLabelText>
            </FormControlLabel>
            <Input size="xl" variant="outline" className="h-[48px] rounded-xl border border-[#E8D9C7] bg-[#FFFDF8] px-4">
              <InputSlot className="pr-2">
                <FontAwesome5 name="stream" size={16} color={colors.textSecondary} />
              </InputSlot>
              <InputField
                accessibilityLabel="Série"
                value={series}
                onChangeText={onChangeSeries}
                placeholder="Scientifique, littéraire..."
                placeholderTextColor={colors.textMuted}
                className="px-0 text-[15px] font-semibold leading-5 text-[#2F241F]"
              />
            </Input>
          </FormControl>

          <FormControl className="gap-2">
            <FormControlLabel>
              <FormControlLabelText className="text-[14px] font-bold leading-5 text-[#2F241F]">
                Établissement
              </FormControlLabelText>
            </FormControlLabel>
            <Input size="xl" variant="outline" className="h-[48px] rounded-xl border border-[#E8D9C7] bg-[#FFFDF8] px-4">
              <InputSlot className="pr-2">
                <FontAwesome5 name="school" size={16} color={colors.textSecondary} />
              </InputSlot>
              <InputField
                accessibilityLabel="Établissement"
                value={schoolName}
                onChangeText={onChangeSchoolName}
                placeholder="Facultatif"
                placeholderTextColor={colors.textMuted}
                className="px-0 text-[15px] font-semibold leading-5 text-[#2F241F]"
              />
            </Input>
          </FormControl>
        </>
      ) : null}
    </View>
  );
}

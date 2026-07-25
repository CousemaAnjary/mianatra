import { StyleSheet, TextInput, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppText } from "@/src/components/shared";
import type { DemoGrade } from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";
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
    <View style={styles.form}>
      <View style={styles.field}>
        <AppText variant="label">{"Comment veux-tu qu'on t'appelle ?"}</AppText>
        <View style={[styles.inputWrap, nameError && styles.inputError]}>
          <FontAwesome5 name="user" size={20} color={colors.textSecondary} />
          <TextInput
            accessibilityLabel="Prénom ou pseudonyme"
            value={firstName}
            onChangeText={onChangeFirstName}
            placeholder="Fara"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            returnKeyType="next"
          />
        </View>
        {nameError ? (
          <AppText variant="caption" tone="error">
            {nameError}
          </AppText>
        ) : null}
      </View>

      <View style={styles.field}>
        <AppText variant="label">Quel âge as-tu ?</AppText>
        <View style={[styles.inputWrap, ageError && styles.inputError]}>
          <FontAwesome5 name="birthday-cake" size={20} color={colors.textSecondary} />
          <TextInput
            accessibilityLabel="Âge"
            value={age}
            onChangeText={(value) => onChangeAge(value.replace(/[^0-9]/g, ""))}
            placeholder="17"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            style={styles.input}
          />
          <AppText tone="secondary">ans</AppText>
        </View>
        {ageError ? (
          <AppText variant="caption" tone="error">
            {ageError}
          </AppText>
        ) : null}
      </View>

      <View style={styles.field}>
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

const styles = StyleSheet.create({
  form: {
    gap: spacing[4],
  },
  field: {
    gap: spacing[2],
  },
  inputWrap: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    minHeight: 54,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
});

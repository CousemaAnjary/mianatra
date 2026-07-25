import { Pressable, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/src/theme";
import type { DemoGrade } from "@/src/data/demo-data";
import { AppText } from "@/src/components/shared";

type ClassSelectorProps = {
  grades: DemoGrade[];
  selectedGrade: DemoGrade;
  onSelect: (grade: DemoGrade) => void;
};

export function ClassSelector({ grades, selectedGrade, onSelect }: ClassSelectorProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {grades.map((grade) => {
        const isSelected = grade === selectedGrade;

        return (
          <Pressable
            key={grade}
            accessibilityRole="radio"
            accessibilityLabel={`Classe ${grade}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(grade)}
            style={[styles.option, isSelected && styles.optionSelected]}
          >
            <AppText variant="label" tone={isSelected ? "inverse" : "primary"}>
              {grade}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing[3],
  },
  option: {
    minHeight: 54,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
});

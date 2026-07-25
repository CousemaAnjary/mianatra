import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/src/components/shared";
import type { DemoGrade } from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";

export type GradeFilterValue = "Tous" | DemoGrade;

type GradeFilterProps = {
  values: GradeFilterValue[];
  selectedValue: GradeFilterValue;
  onChange: (value: GradeFilterValue) => void;
};

export function GradeFilter({ values, selectedValue, onChange }: GradeFilterProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {values.map((value) => {
        const isSelected = value === selectedValue;

        return (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityLabel={`Filtre ${value}`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(value)}
            style={[styles.item, isSelected && styles.itemSelected]}
          >
            <AppText variant="label" tone={isSelected ? "inverse" : "primary"}>
              {value}
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
    gap: spacing[2],
  },
  item: {
    minHeight: 48,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
});

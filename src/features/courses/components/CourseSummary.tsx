import { StyleSheet, View } from "react-native";
import { AppCard, AppText } from "@/src/components/shared";
import { spacing } from "@/src/theme";

type CourseSummaryProps = {
  items: string[];
};

export function CourseSummary({ items }: CourseSummaryProps) {
  return (
    <AppCard style={styles.card}>
      <AppText variant="subtitle">Résumé des notions importantes</AppText>
      <View style={styles.list}>
        {items.map((item) => (
          <AppText key={item} tone="secondary">
            • {item}
          </AppText>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[3],
  },
  list: {
    gap: spacing[2],
  },
});

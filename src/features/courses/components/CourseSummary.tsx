import { View } from "react-native";
import { AppCard, AppText } from "@/src/components/shared";

type CourseSummaryProps = {
  items: string[];
};

export function CourseSummary({ items }: CourseSummaryProps) {
  return (
    <AppCard className="gap-3">
      <AppText variant="subtitle">Résumé des notions importantes</AppText>
      <View className="gap-2">
        {items.map((item) => (
          <AppText key={item} tone="secondary">
            • {item}
          </AppText>
        ))}
      </View>
    </AppCard>
  );
}

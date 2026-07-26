import { View } from "react-native";
import { AppText } from "@/src/components/shared";
import { fonts } from "@/src/theme";

type CourseSummaryProps = {
  items: string[];
};

export function CourseSummary({ items }: CourseSummaryProps) {
  return (
    <View className="gap-2.5 bg-[#FFFDF8] px-4 pb-4 pt-3">
      <AppText variant="label" className="text-[14px] leading-5" style={{ fontFamily: fonts.bold }}>
        Résumé des notions importantes
      </AppText>
      <View className="gap-1.5">
        {items.map((item) => (
          <AppText key={item} tone="secondary" className="text-[13px] leading-[19px]">
            • {item}
          </AppText>
        ))}
      </View>
    </View>
  );
}

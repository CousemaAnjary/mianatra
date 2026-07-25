import { View } from "react-native";
import { AppText } from "@/src/components/shared";

type HintPanelProps = {
  hint: string;
};

export function HintPanel({ hint }: HintPanelProps) {
  return (
    <View accessibilityRole="text" className="gap-2 rounded-xl border border-[#F2B84B] bg-[#FFF3D2] p-4">
      <AppText variant="label">Indice</AppText>
      <AppText tone="secondary">{hint}</AppText>
    </View>
  );
}

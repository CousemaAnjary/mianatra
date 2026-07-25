import { Pressable, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AppText } from "@/src/components/shared";
import { colors } from "@/src/theme";

type CourseActionTab = {
  id: string;
  label: string;
  iconName: string;
  onPress: () => void;
  disabled?: boolean;
};

type CourseActionTabsProps = {
  tabs: CourseActionTab[];
};

export function CourseActionTabs({ tabs }: CourseActionTabsProps) {
  return (
    <View className="flex-row overflow-hidden rounded-2xl border border-[#E8D9C7] bg-[#FFFDF8]">
      {tabs.map((tab, index) => (
        <Pressable
          key={tab.id}
          accessibilityRole="button"
          accessibilityLabel={tab.label}
          accessibilityState={{ disabled: tab.disabled ?? false }}
          disabled={tab.disabled}
          onPress={tab.onPress}
          className={[
            "min-h-[92px] flex-1 items-center justify-center gap-2 border-r border-[#E8D9C7] p-2 active:bg-[#FAF1E2]",
            index === tabs.length - 1 ? "border-r-0" : "",
            tab.disabled ? "opacity-45" : "",
          ].join(" ")}
        >
          <FontAwesome5 name={tab.iconName} size={22} color={colors.textPrimary} />
          <AppText variant="label" className="text-center">
            {tab.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

import { Pressable, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import { AppText } from "@/src/components/shared";
import { colors } from "@/src/theme";

type CourseTopBarProps = {
  title: string;
  onOptionsPress?: () => void;
};

export function CourseTopBar({ title, onOptionsPress }: CourseTopBarProps) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/courses"))}
        className="h-11 w-11 items-center justify-center rounded-full active:opacity-80"
      >
        <FontAwesome5 name="arrow-left" size={20} color={colors.textPrimary} />
      </Pressable>
      <AppText variant="heading" className="flex-1 text-center">
        {title}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Options du cours"
        accessibilityState={{ disabled: !onOptionsPress }}
        disabled={!onOptionsPress}
        onPress={onOptionsPress}
        className={["h-11 w-11 items-center justify-center rounded-full active:opacity-80", !onOptionsPress ? "opacity-35" : ""].join(" ")}
      >
        <FontAwesome5 name="ellipsis-h" size={20} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

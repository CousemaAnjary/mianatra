import { Pressable, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import { AppText } from "@/src/components/shared";
import { colors } from "@/src/theme";

type ImportStepHeaderProps = {
  onOptionsPress: () => void;
};

export function ImportStepHeader({ onOptionsPress }: ImportStepHeaderProps) {
  return (
    <View className="gap-3">
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
          Ajouter un cours
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Options d'import"
          onPress={onOptionsPress}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-80"
        >
          <FontAwesome5 name="ellipsis-h" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>
      <AppText variant="subtitle" tone="secondary" className="text-center">
        Étape 2 sur 3
      </AppText>
      <View accessibilityLabel="Progression d'import : étape 2 sur 3" className="flex-row justify-center gap-2">
        <View className="h-2 w-[86px] rounded-full bg-[#D94B24]" />
        <View className="h-2 w-[86px] rounded-full bg-[#D94B24]" />
        <View className="h-2 w-[86px] rounded-full bg-[#FAF1E2]" />
      </View>
    </View>
  );
}

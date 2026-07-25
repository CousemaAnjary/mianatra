import { Alert, Image, Pressable, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Svg, { Circle } from "react-native-svg";
import { ProfileMenuRow } from "@/src/components/core";
import {
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
} from "@/src/components/shared";
import {
  demoProfile,
  demoProfileMenu,
  demoProfileStats,
  type DemoProfileMenuItem,
} from "@/src/data/demo-data";
import { AISettingsCard } from "@/src/features/ai-settings";
import { colors } from "@/src/theme";

export default function ProfileScreen() {
  function handleMenuPress(item: DemoProfileMenuItem) {
    if (item.action === "logout") {
      Alert.alert(
        "Déconnexion de démonstration",
        "Aucune donnée ne sera supprimée dans cette version.",
      );
      return;
    }

    Alert.alert(item.label, "Disponible prochainement");
  }

  return (
    <AppScreen contentClassName="gap-5 pb-10">
      <ScreenHeader title="Profil" subtitle="Ton espace de progression" />

      <View className="items-center gap-4">
        <View className="h-[148px] w-[148px] items-center justify-center">
          <Image
            source={require("../../../assets/mianatra/illustration_student_reading.png")}
            accessibilityLabel="Avatar de Fara"
            accessibilityIgnoresInvertColors
            className="h-[136px] w-[136px] rounded-full bg-[#FAF1E2]"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Modifier le profil"
            className="absolute bottom-2 right-1 h-[54px] w-[54px] items-center justify-center rounded-full border border-[#E8D9C7] bg-[#FFFDF8] active:opacity-80"
            onPress={() => Alert.alert("Profil", "Disponible prochainement")}
          >
            <FontAwesome5 name="pencil-alt" size={18} color={colors.primary} />
          </Pressable>
        </View>
        <AppText variant="title">{demoProfile.firstName}</AppText>
        <AppText variant="subtitle" tone="secondary">
          {`${demoProfile.age} ans • ${demoProfile.grade}`}
        </AppText>
      </View>

      <AppCard className="gap-4">
        <AppText variant="subtitle">Ma progression globale</AppText>
        <View className="flex-row items-center gap-4">
          <View className="h-[118px] w-[118px] items-center justify-center">
            <Svg width={118} height={118} viewBox="0 0 118 118" accessibilityLabel="Progression globale 58 pour cent">
              <Circle cx="59" cy="59" r="46" stroke={colors.surfaceSoft} strokeWidth="10" fill="none" />
              <Circle
                cx="59"
                cy="59"
                r="46"
                stroke={colors.secondary}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - demoProfileStats.globalProgress / 100)}`}
                strokeLinecap="round"
                rotation="-90"
                origin="59, 59"
              />
            </Svg>
            <View className="absolute">
              <AppText variant="heading">{demoProfileStats.globalProgress}%</AppText>
            </View>
          </View>
          <View className="flex-1 gap-3">
            <LegendRow color={colors.secondary} label="Maîtrisé" value={`${demoProfileStats.mastered} notions`} />
            <LegendRow color={colors.accent} label="En progression" value={`${demoProfileStats.progressing} notions`} />
            <LegendRow color={colors.primary} label="À renforcer" value={`${demoProfileStats.needsWork} notions`} />
          </View>
        </View>
      </AppCard>

      <AISettingsCard />

      <AppCard className="py-2">
        {demoProfileMenu.map((item) => (
          <ProfileMenuRow key={item.id} item={item} onPress={handleMenuPress} />
        ))}
      </AppCard>
    </AppScreen>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
      <AppText className="flex-1">{label}</AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

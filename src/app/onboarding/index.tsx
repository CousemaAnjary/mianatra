import { Image, ImageBackground, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppButton, AppScreen, AppText } from "@/src/components/shared";
import { colors, radius, spacing } from "@/src/theme";

export default function OnboardingScreen() {
  return (
    <AppScreen scroll={false} contentStyle={styles.screen}>
      <ImageBackground
        source={require("../../../assets/mianatra/pattern_lamba_horizontal.png")}
        resizeMode="cover"
        imageStyle={styles.pattern}
        style={styles.hero}
      >
        <Image
          source={require("../../../assets/mianatra/illustration_onboarding_students.png")}
          accessibilityIgnoresInvertColors
          style={styles.illustration}
        />
      </ImageBackground>

      <View style={styles.copy}>
        <AppText variant="title">Mianatra</AppText>
        <AppText tone="secondary">
          Bienvenue dans ta coquille pour apprendre. Les routes principales sont prêtes
          pour construire les prochains écrans.
        </AppText>
      </View>

      <AppButton title="Commencer" onPress={() => router.replace("/(tabs)")} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center",
    gap: spacing[8],
  },
  hero: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSoft,
  },
  pattern: {
    opacity: 0.18,
  },
  illustration: {
    width: "88%",
    height: 240,
    resizeMode: "contain",
  },
  copy: {
    gap: spacing[3],
  },
});

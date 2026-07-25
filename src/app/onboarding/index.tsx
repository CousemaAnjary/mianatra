import { useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { OnboardingForm } from "@/src/components/core";
import { AppButton, AppScreen, AppText, ProgressBar } from "@/src/components/shared";
import { demoGrades, demoProfile, type DemoGrade } from "@/src/data/demo-data";
import { colors, radius, spacing } from "@/src/theme";

export default function OnboardingScreen() {
  const [firstName, setFirstName] = useState(demoProfile.firstName);
  const [age, setAge] = useState(String(demoProfile.age));
  const [selectedGrade, setSelectedGrade] = useState<DemoGrade>("2nde");
  const [nameError, setNameError] = useState<string>();
  const [ageError, setAgeError] = useState<string>();

  function validateAndContinue() {
    const cleanName = firstName.trim();
    const parsedAge = Number(age);
    const nextNameError = cleanName.length === 0 ? "Indique un prénom ou un pseudonyme." : undefined;
    const nextAgeError =
      !Number.isInteger(parsedAge) || parsedAge < 12 || parsedAge > 30
        ? "Indique un âge entre 12 et 30 ans."
        : undefined;

    setNameError(nextNameError);
    setAgeError(nextAgeError);

    if (!nextNameError && !nextAgeError) {
      router.replace("/(tabs)");
    }
  }

  return (
    <AppScreen contentStyle={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardArea}
      >
        <ImageBackground
          source={require("../../../assets/mianatra/pattern_lamba_horizontal.png")}
          resizeMode="cover"
          imageStyle={styles.pattern}
          style={styles.lamba}
        />

        <View style={styles.titleArea}>
          <AppText variant="title" style={styles.brand}>
            Mianatra
          </AppText>
          <AppText variant="subtitle">Tout cours, pour réussir.</AppText>
          <AppText tone="secondary" style={styles.centered}>
            {"Faisons connaissance pour mieux t'accompagner."}
          </AppText>
        </View>

        <Image
          source={require("../../../assets/mianatra/illustration_onboarding_students.png")}
          accessibilityLabel="Deux lycéens en train d'étudier"
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          style={styles.illustration}
        />

        <OnboardingForm
          firstName={firstName}
          age={age}
          selectedGrade={selectedGrade}
          grades={demoGrades}
          nameError={nameError}
          ageError={ageError}
          onChangeFirstName={setFirstName}
          onChangeAge={setAge}
          onSelectGrade={setSelectedGrade}
        />

        <View style={styles.footer}>
          <ProgressBar value={25} accessibilityLabel="Étape 1 sur 4" />
          <View style={styles.footerRow}>
            <AppText tone="secondary">1 sur 4</AppText>
            <AppButton title="Suivant" onPress={validateAndContinue} style={styles.nextButton} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}


const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing[2],
    paddingBottom: spacing[10],
  },
  keyboardArea: {
    gap: spacing[4],
  },
  lamba: {
    height: 44,
    overflow: "hidden",
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
  },
  pattern: {
    opacity: 1,
  },
  titleArea: {
    alignItems: "center",
    gap: spacing[1],
  },
  brand: {
    color: colors.primary,
    fontSize: 38,
    lineHeight: 44,
  },
  centered: {
    maxWidth: 300,
    textAlign: "center",
  },
  illustration: {
    alignSelf: "center",
    width: "88%",
    height: 180,
  },
  footer: {
    gap: spacing[2],
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },
  nextButton: {
    flex: 1,
  },
});

import { useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, View } from "react-native";
import { router } from "expo-router";
import { OnboardingForm } from "@/src/components/core";
import { AppButton, AppScreen, AppText, ProgressBar } from "@/src/components/shared";
import { demoGrades, demoProfile, type DemoGrade } from "@/src/data/demo-data";
import { colors } from "@/src/theme";

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
    <AppScreen contentClassName="pb-8 pt-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="gap-3"
      >
        <ImageBackground
          source={require("../../../assets/mianatra/pattern_lamba_horizontal.png")}
          resizeMode="cover"
          imageStyle={{ opacity: 1 }}
          className="h-[34px] overflow-hidden rounded-xl bg-[#FFFDF8]"
        />

        <View className="items-center gap-2 pt-3">
          <AppText variant="title" className="text-[44px] leading-[50px] text-[#D94B24]">
            Mianatra
          </AppText>
          <AppText variant="subtitle" className="text-2xl leading-7">
            Tout Cours
          </AppText>
          <AppText tone="secondary" className="max-w-[300px] text-center">
            {"Faisons connaissance pour mieux t'accompagner."}
          </AppText>
        </View>

        <Image
          source={require("../../../assets/mianatra/illustration_onboarding_students.png")}
          accessibilityLabel="Deux lycéens en train d'étudier"
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          className="h-[190px] w-[90%] self-center"
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

        <View className="gap-2">
          <ProgressBar value={25} color={colors.primary} accessibilityLabel="Étape 1 sur 4" />
          <View className="flex-row items-center justify-between gap-4">
            <AppText tone="secondary">1 sur 4</AppText>
            <AppButton
              title="Suivant"
              iconName="arrow-right"
              iconPosition="right"
              onPress={validateAndContinue}
              className="w-[68%] max-w-[260px] min-w-[220px]"
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

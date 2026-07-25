import { useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
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
    <AppScreen scroll={false} contentClassName="flex-1 pb-0 pt-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        className="flex-1"
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerClassName="grow justify-between gap-4 pb-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-3">
            <ImageBackground
              source={require("../../../assets/mianatra/pattern_lamba_horizontal.png")}
              resizeMode="cover"
              imageStyle={{ opacity: 1 }}
              className="h-[34px] overflow-hidden rounded-xl bg-[#FFFDF8]"
            />

            <View className="items-center gap-1.5 pt-2">
              <AppText variant="title" className="text-[42px] leading-[48px] text-[#D94B24]">
                Mianatra
              </AppText>
              <AppText variant="subtitle" className="text-[24px] leading-7">
                Tout cours
              </AppText>
              <AppText tone="secondary" className="max-w-[300px] text-center text-[17px] leading-6">
                {"Faisons connaissance pour mieux t'accompagner."}
              </AppText>
            </View>

            <Image
              source={require("../../../assets/mianatra/illustration_onboarding_students.png")}
              accessibilityLabel="Deux lycéens en train d'étudier"
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              className="h-[178px] w-[90%] self-center"
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
          </View>

          <View className="gap-3 pt-1">
            <View className="flex-row items-center justify-between">
              <AppText tone="secondary">1 sur 4</AppText>
              <AppText variant="caption" tone="secondary">
                Profil
              </AppText>
            </View>
            <ProgressBar value={25} color={colors.primary} accessibilityLabel="Étape 1 sur 4" />
          <AppButton
            title="Suivant"
            iconName="arrow-right"
            iconPosition="right"
            onPress={validateAndContinue}
            className="w-full"
            style={{
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

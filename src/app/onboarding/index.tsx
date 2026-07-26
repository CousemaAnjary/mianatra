import { useEffect, useRef, useState } from "react";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingForm } from "@/src/components/core";
import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/shared";
import {
  createOnboardingProfileFromForm,
  onboardingGrades,
  shouldRedirectExistingOnboardingProfile,
  type OnboardingProfileValidationErrors,
} from "@/src/features/profile/services/onboarding-profile.service";
import { colors } from "@/src/theme";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const isSubmittingRef = useRef(false);
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>(onboardingGrades[0]);
  const [series, setSeries] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [errors, setErrors] = useState<OnboardingProfileValidationErrors>({});
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    shouldRedirectExistingOnboardingProfile()
      .then((exists) => {
        if (cancelled) {
          return;
        }
        if (exists) {
          router.replace("/(tabs)");
          return;
        }
        setIsCheckingProfile(false);
      })
      .catch(() => {
        if (!cancelled) {
          setReadError("Impossible de vérifier le profil local. Réessaie.");
          setIsCheckingProfile(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function validateAndContinue() {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await createOnboardingProfileFromForm({
        displayName,
        age,
        grade: selectedGrade,
        series,
        schoolName,
      });

      if (!result.success) {
        setErrors(result.errors);
        return;
      }

      router.replace("/(tabs)");
    } catch {
      setErrors({ form: "Impossible de créer ton profil. Réessaie." });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  if (isCheckingProfile || readError) {
    return (
      <AppScreen contentClassName="flex-1 justify-center">
        <AppCard className="gap-3">
          <AppText variant="subtitle">{readError ? "Profil indisponible" : "Préparation du profil"}</AppText>
          <AppText tone="secondary">{readError ?? "Vérification du profil local..."}</AppText>
          {readError ? <AppButton title="Réessayer" iconName="redo" onPress={() => router.replace("/")} /> : null}
        </AppCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll={false} contentClassName="flex-1 px-6 pb-0 pt-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        className="flex-1"
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerClassName="grow justify-between gap-4 pt-3"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 18, 30) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-3">
            <ImageBackground
              source={require("../../../assets/mianatra/pattern_lamba_horizontal.png")}
              resizeMode="cover"
              imageStyle={{ opacity: 1 }}
              className="h-[34px] overflow-hidden rounded-md bg-[#FFFDF8]"
            />

            <View className="items-center gap-1 pt-3">
              <AppText variant="title" className="text-center text-[44px] leading-[49px] text-[#D94B24]">
                Mianatra
              </AppText>
              <AppText tone="secondary" className="max-w-[286px] pt-4 text-center text-[15px] leading-[22px]">
                {"Faisons connaissance pour mieux t'accompagner."}
              </AppText>
            </View>

            <Image
              source={require("../../../assets/mianatra/illustration_onboarding_students.png")}
              accessibilityLabel="Deux lycéens en train d'étudier"
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              className="h-[162px] w-full self-center"
            />

            <OnboardingForm
              displayName={displayName}
              age={age}
              selectedGrade={selectedGrade}
              grades={[...onboardingGrades]}
              series={series}
              schoolName={schoolName}
              nameError={errors.displayName}
              ageError={errors.age}
              gradeError={errors.grade}
              onChangeDisplayName={setDisplayName}
              onChangeAge={setAge}
              onSelectGrade={setSelectedGrade}
              onChangeSeries={setSeries}
              onChangeSchoolName={setSchoolName}
              showOptionalDetails={false}
            />
          </View>

          <View className="gap-3 pt-2">
            {errors.form ? (
              <AppText accessibilityRole="alert" tone="error">
                {errors.form}
              </AppText>
            ) : null}
            <AppButton
              title={isSubmitting ? "Création..." : "Suivant"}
              iconName="arrow-right"
              iconPosition="right"
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={validateAndContinue}
              className="w-full"
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 5,
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

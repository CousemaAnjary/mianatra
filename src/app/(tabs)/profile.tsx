import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingForm } from "@/src/components/core";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
} from "@/src/components/shared";
import { AISettingsCard } from "@/src/features/ai-settings";
import { CourseProgressRing } from "@/src/features/courses/components";
import { onboardingGrades, type OnboardingProfileForm } from "@/src/features/profile";
import { useProfileView } from "@/src/features/profile/hooks/use-profile-view";
import { colors, fonts } from "@/src/theme";

function initials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").toLocaleUpperCase();
}

function formFromProfile(profile: NonNullable<ReturnType<typeof useProfileView>["profile"]>): OnboardingProfileForm {
  return {
    displayName: profile.displayName,
    age: String(profile.age),
    grade: profile.grade,
    series: profile.series ?? "",
    schoolName: profile.schoolName ?? "",
  };
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const saveInFlightRef = useRef(false);
  const { errorMessage, isSaving, profile, reload, saveErrors, status, updateProfile } = useProfileView();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<OnboardingProfileForm>({
    displayName: "",
    age: "",
    grade: onboardingGrades[0],
    series: "",
    schoolName: "",
  });

  useEffect(() => {
    if (profile && !isEditing) {
      setForm(formFromProfile(profile));
    }
  }, [isEditing, profile]);

  async function saveProfile() {
    if (saveInFlightRef.current) {
      return;
    }
    saveInFlightRef.current = true;
    try {
      const saved = await updateProfile(form);
      if (saved) {
        setIsEditing(false);
      }
    } finally {
      saveInFlightRef.current = false;
    }
  }

  if (status === "loading") {
    return (
      <AppScreen contentClassName="gap-5 pb-10">
        <ScreenHeader title="Profil" subtitle="Ton espace de progression" />
        <AppCard className="gap-3">
          <AppText variant="subtitle">Chargement du profil…</AppText>
          <AppText tone="secondary">On récupère tes informations enregistrées.</AppText>
        </AppCard>
        <AISettingsCard />
      </AppScreen>
    );
  }

  if (status === "error" || !profile) {
    return (
      <AppScreen contentClassName="gap-5 pb-10">
        <ScreenHeader title="Profil" subtitle="Ton espace de progression" />
        <AppCard className="gap-3">
          <AppText variant="subtitle">Impossible de charger le profil</AppText>
          <AppText tone="secondary">{errorMessage ?? "Une erreur est survenue."}</AppText>
          <AppButton title="Réessayer" iconName="redo" onPress={reload} />
          <AppButton title="Revenir à l'onboarding" iconName="user-plus" variant="secondary" onPress={() => router.replace("/onboarding")} />
        </AppCard>
        <AISettingsCard />
      </AppScreen>
    );
  }

  const progress = profile.statistics.averageProgress;

  return (
    <AppScreen
      contentClassName="gap-4 pt-3"
      contentStyle={{ paddingBottom: Math.max(insets.bottom + 88, 118) }}
    >
      <View className="gap-1.5">
        <AppText variant="heading" className="text-[24px] leading-[30px]" style={{ fontFamily: fonts.bold }}>
          Profil
        </AppText>
        <AppText tone="secondary" className="text-[15px] leading-5">
          Ton espace de progression
        </AppText>
      </View>

      <AppCard
        className="rounded-2xl bg-[#FFFDF8] px-4 py-4"
        style={{
          shadowColor: "#6E442A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center gap-3.5">
          <View className="h-[70px] w-[70px] items-center justify-center rounded-2xl bg-[#D94B24]">
            <AppText className="text-[26px] leading-8 text-white" style={{ fontFamily: fonts.bold }}>
              {initials(profile.displayName)}
            </AppText>
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <AppText numberOfLines={1} className="text-[22px] leading-[28px] text-[#2F241F]" style={{ fontFamily: fonts.bold }}>
              {profile.displayName}
            </AppText>
            <AppText tone="secondary" className="text-[14px] leading-5" style={{ fontFamily: fonts.semibold }}>
              {`${profile.age} ans • ${profile.grade}`}
            </AppText>
            {profile.series ? <AppText tone="secondary" numberOfLines={1} className="text-[13px] leading-5">{profile.series}</AppText> : null}
            {profile.schoolName ? <AppText tone="secondary" numberOfLines={1} className="text-[13px] leading-5">{profile.schoolName}</AppText> : null}
          </View>
        </View>
        <AppButton
          title={isEditing ? "Fermer la modification" : "Modifier le profil"}
          iconName={isEditing ? "times" : "pencil-alt"}
          variant="secondary"
          className="mt-4 min-h-[48px] self-start px-5"
          onPress={() => {
            setForm(formFromProfile(profile));
            setIsEditing((value) => !value);
          }}
        />
      </AppCard>

      {isEditing ? (
        <AppCard className="gap-4">
          <AppText variant="subtitle">Modifier mes informations</AppText>
          <OnboardingForm
            displayName={form.displayName}
            age={form.age}
            selectedGrade={form.grade}
            grades={[...onboardingGrades]}
            series={form.series}
            schoolName={form.schoolName}
            nameError={saveErrors.displayName}
            ageError={saveErrors.age}
            gradeError={saveErrors.grade}
            onChangeDisplayName={(displayName) => setForm((value) => ({ ...value, displayName }))}
            onChangeAge={(age) => setForm((value) => ({ ...value, age }))}
            onSelectGrade={(grade) => setForm((value) => ({ ...value, grade }))}
            onChangeSeries={(series) => setForm((value) => ({ ...value, series }))}
            onChangeSchoolName={(schoolName) => setForm((value) => ({ ...value, schoolName }))}
          />
          {saveErrors.form ? (
            <AppText accessibilityRole="alert" tone="error">
              {saveErrors.form}
            </AppText>
          ) : null}
          <AppButton
            title={isSaving ? "Enregistrement..." : "Enregistrer"}
            iconName="save"
            loading={isSaving}
            disabled={isSaving}
            onPress={saveProfile}
          />
        </AppCard>
      ) : null}

      <AppCard
        className="gap-4 rounded-2xl border-[#DDE6D8] bg-[#EAF0E3] px-4 py-4"
        style={{
          shadowColor: "#6E442A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="gap-1">
            <AppText className="text-[17px] leading-6 text-[#2F241F]" style={{ fontFamily: fonts.bold }}>
              Progression globale
            </AppText>
            <AppText tone="secondary" className="text-[13px] leading-5">
              {"Vue d'ensemble de tes notions"}
            </AppText>
          </View>
          <AppText className="text-[24px] leading-[30px] text-[#2F241F]" style={{ fontFamily: fonts.bold }}>
            {progress}%
          </AppText>
        </View>
        <View className="flex-row items-center gap-4">
          <CourseProgressRing
            value={progress}
            mastered={profile.statistics.masteredConceptCount}
            progressing={profile.statistics.progressingConceptCount}
            needsWork={profile.statistics.needsWorkConceptCount}
            notStarted={profile.statistics.notStartedConceptCount}
            size={96}
          />
          <View className="flex-1 gap-2.5">
            <LegendRow color={colors.secondary} label="Maîtrisé" value={`${profile.statistics.masteredConceptCount} notions`} />
            <LegendRow color={colors.accent} label="En progression" value={`${profile.statistics.progressingConceptCount} notions`} />
            <LegendRow color={colors.primary} label="À renforcer" value={`${profile.statistics.needsWorkConceptCount} notions`} />
            {profile.statistics.notStartedConceptCount > 0 ? (
              <LegendRow color={colors.surfaceSoft} label="Non commencé" value={`${profile.statistics.notStartedConceptCount} notions`} />
            ) : null}
          </View>
        </View>
        <View className="flex-row gap-3">
          <StatPill label="Cours" value={profile.statistics.courseCount} />
          <StatPill label="Séances" value={profile.statistics.completedSessionCount} />
        </View>
      </AppCard>

      <AISettingsCard />
    </AppScreen>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <AppText className="flex-1 text-[13px] leading-[18px] text-[#2F241F]">{label}</AppText>
      <AppText className="text-[12px] leading-[18px] text-[#2F241F]" style={{ fontFamily: fonts.bold }}>
        {value}
      </AppText>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <View className="min-h-[58px] flex-1 justify-center rounded-2xl border border-[#DDE6D8] bg-[#FFFDF8] px-4">
      <AppText className="text-[20px] leading-6 text-[#2F241F]" style={{ fontFamily: fonts.bold }}>
        {value}
      </AppText>
      <AppText className="text-[12px] leading-4" tone="secondary">{label}</AppText>
    </View>
  );
}

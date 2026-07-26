import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { router } from "expo-router";
import { OnboardingForm } from "@/src/components/core";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
  ScreenHeader,
} from "@/src/components/shared";
import { AISettingsCard } from "@/src/features/ai-settings";
import { onboardingGrades, type OnboardingProfileForm } from "@/src/features/profile";
import { useProfileView } from "@/src/features/profile/hooks/use-profile-view";
import { colors } from "@/src/theme";

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
    <AppScreen contentClassName="gap-5 pb-10">
      <ScreenHeader title="Profil" subtitle="Ton espace de progression" />

      <View className="items-center gap-4">
        <View className="h-[136px] w-[136px] items-center justify-center rounded-full bg-[#FAF1E2]">
          <AppText variant="title" className="text-[#D94B24]">
            {initials(profile.displayName)}
          </AppText>
        </View>
        <View className="items-center gap-1">
          <AppText variant="title">{profile.displayName}</AppText>
          <AppText variant="subtitle" tone="secondary">
            {`${profile.age} ans • ${profile.grade}`}
          </AppText>
          {profile.series ? <AppText tone="secondary">{profile.series}</AppText> : null}
          {profile.schoolName ? <AppText tone="secondary">{profile.schoolName}</AppText> : null}
        </View>
        <AppButton
          title={isEditing ? "Fermer la modification" : "Modifier le profil"}
          iconName={isEditing ? "times" : "pencil-alt"}
          variant="secondary"
          onPress={() => {
            setForm(formFromProfile(profile));
            setIsEditing((value) => !value);
          }}
        />
      </View>

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

      <AppCard className="gap-4">
        <AppText variant="subtitle">Ma progression globale</AppText>
        <View className="flex-row items-center gap-4">
          <View className="h-[118px] w-[118px] items-center justify-center">
            <Svg width={118} height={118} viewBox="0 0 118 118" accessibilityLabel={`Progression globale ${progress} pour cent`}>
              <Circle cx="59" cy="59" r="46" stroke={colors.surfaceSoft} strokeWidth="10" fill="none" />
              <Circle
                cx="59"
                cy="59"
                r="46"
                stroke={colors.secondary}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                strokeLinecap="round"
                rotation="-90"
                origin="59, 59"
              />
            </Svg>
            <View className="absolute">
              <AppText variant="heading">{progress}%</AppText>
            </View>
          </View>
          <View className="flex-1 gap-3">
            <LegendRow color={colors.secondary} label="Maîtrisé" value={`${profile.statistics.masteredConceptCount} notions`} />
            <LegendRow color={colors.accent} label="En progression" value={`${profile.statistics.progressingConceptCount} notions`} />
            <LegendRow color={colors.primary} label="À renforcer" value={`${profile.statistics.needsWorkConceptCount} notions`} />
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
      <View className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
      <AppText className="flex-1">{label}</AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <View className="min-h-16 flex-1 justify-center rounded-2xl border border-[#E8D9C7] bg-[#FFFDF8] px-4">
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" tone="secondary">{label}</AppText>
    </View>
  );
}

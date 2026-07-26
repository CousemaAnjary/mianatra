import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadProfileView, updateProfileFromForm } from "../services/profile-view.service";
import type { OnboardingProfileForm, OnboardingProfileValidationErrors } from "../services/onboarding-profile.service";
import type { ProfileViewData } from "../types/profile-view.types";

export type ProfileViewStatus = "loading" | "ready" | "error";

export function useProfileView() {
  const loadIdRef = useRef(0);
  const [profile, setProfile] = useState<ProfileViewData | null>(null);
  const [status, setStatus] = useState<ProfileViewStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveErrors, setSaveErrors] = useState<OnboardingProfileValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(() => {
    const loadId = loadIdRef.current + 1;
    loadIdRef.current = loadId;
    setStatus("loading");
    setErrorMessage(null);

    void loadProfileView()
      .then((nextProfile) => {
        if (loadIdRef.current !== loadId) {
          return;
        }
        setProfile(nextProfile);
        setStatus("ready");
      })
      .catch(() => {
        if (loadIdRef.current !== loadId) {
          return;
        }
        setErrorMessage("Impossible de charger ton profil.");
        setStatus("error");
      });
  }, []);

  const updateProfile = useCallback(
    async (form: OnboardingProfileForm) => {
      setSaveErrors({});
      setIsSaving(true);
      try {
        const result = await updateProfileFromForm(form);
        if (!result.success) {
          setSaveErrors(result.errors);
          return false;
        }
        reload();
        return true;
      } catch {
        setSaveErrors({ form: "Impossible d'enregistrer le profil. Réessaie." });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  useFocusEffect(
    useCallback(() => {
      reload();
      return () => {
        loadIdRef.current += 1;
      };
    }, [reload]),
  );

  return {
    profile,
    status,
    errorMessage,
    reload,
    updateProfile,
    saveErrors,
    isSaving,
  };
}

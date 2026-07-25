import { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { AppButton, AppCard, AppScreen, AppText } from "@/src/components/shared";
import { resolveInitialRoute } from "@/src/features/profile/services/app-start.service";

type InitialRouteStatus = "loading" | "error";

export default function Index() {
  const [status, setStatus] = useState<InitialRouteStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setStatus("loading");
    resolveInitialRoute()
      .then((route) => {
        if (!cancelled) {
          router.replace(route);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <AppScreen contentClassName="flex-1 justify-center">
      <View className="gap-4">
        <AppCard className="gap-3">
          <AppText variant="subtitle">{status === "loading" ? "Ouverture de Mianatra" : "Impossible d'ouvrir Mianatra"}</AppText>
          <AppText tone="secondary">
            {status === "loading" ? "Vérification du profil local..." : "La lecture du profil local a échoué. Réessaie."}
          </AppText>
          {status === "error" ? (
            <AppButton title="Réessayer" iconName="redo" onPress={() => setAttempt((value) => value + 1)} />
          ) : null}
        </AppCard>
      </View>
    </AppScreen>
  );
}

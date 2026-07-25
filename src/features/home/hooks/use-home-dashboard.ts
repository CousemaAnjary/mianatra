import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadHomeDashboard } from "../services/home-dashboard.service";
import type { HomeDashboard } from "../types/home-dashboard.types";

export type HomeDashboardStatus = "loading" | "ready" | "error";

export function useHomeDashboard() {
  const loadIdRef = useRef(0);
  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
  const [status, setStatus] = useState<HomeDashboardStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(() => {
    const loadId = loadIdRef.current + 1;
    loadIdRef.current = loadId;
    setStatus("loading");
    setErrorMessage(null);

    void loadHomeDashboard()
      .then((nextDashboard) => {
        if (loadIdRef.current !== loadId) {
          return;
        }
        setDashboard(nextDashboard);
        setStatus("ready");
      })
      .catch(() => {
        if (loadIdRef.current !== loadId) {
          return;
        }
        setErrorMessage("Impossible de charger ton accueil.");
        setStatus("error");
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
      return () => {
        loadIdRef.current += 1;
      };
    }, [reload]),
  );

  return {
    dashboard,
    status,
    errorMessage,
    reload,
  };
}

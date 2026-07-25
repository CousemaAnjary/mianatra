export type AppStartRoute = "/(tabs)" | "/onboarding";

type AppStartDeps = {
  hasProfile: () => Promise<boolean>;
};

export function createAppStartService(dependencies: AppStartDeps) {
  return {
    resolveInitialRoute: async (): Promise<AppStartRoute> => {
      const exists = await dependencies.hasProfile();
      return exists ? "/(tabs)" : "/onboarding";
    },
  };
}

export async function resolveInitialRoute() {
  const { hasProfile } = await import("./profile.service");
  return createAppStartService({ hasProfile }).resolveInitialRoute();
}

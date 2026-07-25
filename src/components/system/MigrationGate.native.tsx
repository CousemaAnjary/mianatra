import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { AppButton, AppText } from "@/src/components/shared";
import { db } from "@/src/db/client";
import { initializeDatabaseConnection } from "@/src/db/initialization";
import migrations from "@/src/db/migrations/migrations";

type MigrationGateProps = {
  children: React.ReactNode;
};

export function MigrationGate({ children }: MigrationGateProps) {
  const [attempt, setAttempt] = useState(0);

  return (
    <MigrationRunner key={attempt} onRetry={() => setAttempt((value) => value + 1)}>
      {children}
    </MigrationRunner>
  );
}

type MigrationRunnerProps = MigrationGateProps & {
  onRetry: () => void;
};

function MigrationRunner({ children, onRetry }: MigrationRunnerProps) {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    initializeDatabaseConnection();
  }, []);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-[#FFF7E8] p-6">
        <AppText variant="subtitle" className="text-center">Erreur de migration</AppText>
        <AppText tone="secondary" className="text-center">{error.message}</AppText>
        <AppButton title="Réessayer" iconName="redo" onPress={onRetry} />
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-[#FFF7E8] p-6">
        <AppText variant="subtitle" className="text-center">Préparation des données</AppText>
        <AppText tone="secondary" className="text-center">Migration locale en cours...</AppText>
      </View>
    );
  }

  return children;
}

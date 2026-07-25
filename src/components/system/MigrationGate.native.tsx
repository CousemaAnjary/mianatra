import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/src/components/shared";
import { db } from "@/src/db/client";
import { initializeDatabaseConnection } from "@/src/db/initialization";
import migrations from "@/src/db/migrations/migrations";
import { colors, spacing } from "@/src/theme";

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
      <View style={styles.container}>
        <Text style={styles.title}>Erreur de migration</Text>
        <Text style={styles.message}>{error.message}</Text>
        <AppButton title="Réessayer" iconName="redo" onPress={onRetry} />
      </View>
    );
  }

  if (!success) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Préparation des données</Text>
        <Text style={styles.message}>Migration locale en cours...</Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[4],
    padding: spacing[6],
    backgroundColor: colors.background,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0,
    textAlign: "center",
  },
  message: {
    color: colors.textSecondary,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 22,
    textAlign: "center",
  },
});

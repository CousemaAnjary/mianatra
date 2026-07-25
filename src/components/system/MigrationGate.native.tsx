import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Text } from "react-native";
import { db } from "@/src/db/client";
import migrations from "@/src/db/migrations/migrations";

type MigrationGateProps = {
  children: React.ReactNode;
};

export function MigrationGate({ children }: MigrationGateProps) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return <Text>Erreur de migration : {error.message}</Text>;
  }

  if (!success) {
    return <Text>Migration en cours...</Text>;
  }

  return children;
}

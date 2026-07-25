import "@/global.css";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { Text } from "react-native";
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';
import { db } from "@/src/db/client";
import migrations from "@/src/db/migrations/migrations";


export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <GluestackUIProvider>
        <Text>Erreur de migration : {error.message}</Text>
      </GluestackUIProvider>
    );
  }

  if (!success) {
    return (
      <GluestackUIProvider>
        <Text>Migration en cours...</Text>
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </GluestackUIProvider>
  );
}
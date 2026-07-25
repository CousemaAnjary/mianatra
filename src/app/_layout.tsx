import "@/global.css";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { Platform, Text } from "react-native";
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';
import { db } from "@/src/db/client";
import migrations from "@/src/db/migrations/migrations";

function AppStack() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (Platform.OS === "web") {
    return (
      <GluestackUIProvider>
        <AppStack />
      </GluestackUIProvider>
    );
  }

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
      <AppStack />
    </GluestackUIProvider>
  );
}

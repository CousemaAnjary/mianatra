import "@/global.css";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';
import { MigrationGate } from "@/src/components/system/MigrationGate";

function AppStack() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider>
        <MigrationGate>
          <AppStack />
        </MigrationGate>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}

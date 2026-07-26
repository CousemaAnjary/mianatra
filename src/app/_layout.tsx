import "@/global.css";
import {
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider';
import { MigrationGate } from "@/src/components/system/MigrationGate";

function AppStack() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

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

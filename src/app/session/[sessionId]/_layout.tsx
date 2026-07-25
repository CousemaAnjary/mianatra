import { Stack } from "expo-router";
import { DemoSessionProvider } from "@/src/features/study-session/context/DemoSessionProvider";

export default function SessionLayout() {
  return (
    <DemoSessionProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DemoSessionProvider>
  );
}

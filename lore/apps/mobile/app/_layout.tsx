import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ensureSeeded } from "../lib/store";
import { useTheme } from "../lib/theme";

export default function RootLayout() {
  const t = useTheme();

  useEffect(() => {
    ensureSeeded().catch(() => undefined);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerShadowVisible: false,
          headerTintColor: t.amber,
          headerTitleStyle: { color: t.text, fontWeight: "700" },
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "내 기록" }} />
        <Stack.Screen name="type/[id]" options={{ title: "" }} />
        <Stack.Screen name="record/new" options={{ title: "새 기록", presentation: "modal" }} />
      </Stack>
    </SafeAreaProvider>
  );
}

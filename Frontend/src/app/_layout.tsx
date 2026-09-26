import { Stack, ThemeProvider, DefaultTheme } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider } from "@/context/auth";

SplashScreen.preventAutoHideAsync();

const LAB_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#F8F6FB",
    card: "#FFFFFF",
    text: "#20203A",
    border: "#E9E3F4",
    primary: "#8D6BE8",
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={LAB_THEME}>
        <AnimatedSplashOverlay />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F8F6FB" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="landing" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="reset-password" />
          <Stack.Screen name="explore" />
          <Stack.Screen name="experiment" />
          <Stack.Screen name="dna-lab-game" />
          <Stack.Screen name="pcr-lab" />
          <Stack.Screen name="gram-staining-lab" />
          <Stack.Screen name="gel-electrophoresis-lab" />
          <Stack.Screen name="elisa-lab" />
          <Stack.Screen name="progress" />
          <Stack.Screen name="notes" />
          <Stack.Screen name="profile" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}

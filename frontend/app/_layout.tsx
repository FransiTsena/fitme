import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
          <Stack.Screen name="owner/home" options={{ headerShown: false }} />
          <Stack.Screen name="owner/menu" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
          <Stack.Screen name="owner/profile" options={{ headerShown: false }} />
          <Stack.Screen name="owner/members-list-owner" options={{ headerShown: false }} />
          <Stack.Screen name="owner/trainers-list-owner" options={{ headerShown: false }} />
          <Stack.Screen name="trainer/home" options={{ headerShown: false }} />
          <Stack.Screen name="trainer/menu" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
          <Stack.Screen name="trainer/profile" options={{ headerShown: false }} />
          <Stack.Screen name="trainer/clients" options={{ headerShown: false }} />
          <Stack.Screen name="trainer/schedule" options={{ headerShown: false }} />
          <Stack.Screen name="trainer/messages" options={{ headerShown: false }} />
          <Stack.Screen name="member/home" options={{ headerShown: false }} />
          <Stack.Screen name="member/day-plan-customization" options={{ headerShown: false }} />
          <Stack.Screen name="member/menu" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
          <Stack.Screen name="member/profile" options={{ headerShown: false }} />
          <Stack.Screen name="member/membership-plans" options={{ headerShown: false }} />
          <Stack.Screen name="member/user-workout" options={{ headerShown: false }} />
          <Stack.Screen name="member/workout-ai-welcome" options={{ headerShown: false }} />
          <Stack.Screen name="member/workout-customization" options={{ headerShown: false }} />
          <Stack.Screen name="member/workout-manual-plan" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

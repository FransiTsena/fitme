import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="owner/owner-home" options={{ headerShown: false }} />
            <Stack.Screen name="owner/menu" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
            <Stack.Screen name="owner/profile" options={{ headerShown: false }} />
            <Stack.Screen name="owner/members-list-owner" options={{ headerShown: false }} />
            <Stack.Screen name="owner/trainers-list-owner" options={{ headerShown: false }} />
            <Stack.Screen name="owner/membership-plans" options={{ headerShown: false }} />
            <Stack.Screen name="owner/owner-gym-registration" options={{ headerShown: false }} />
            <Stack.Screen name="owner/invite-trainer" options={{ headerShown: false }} />
            <Stack.Screen name="trainer/trainer-home" options={{ headerShown: false }} />
            <Stack.Screen name="trainer/menu" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
            <Stack.Screen name="trainer/profile" options={{ headerShown: false }} />
            <Stack.Screen name="trainer/clients" options={{ headerShown: false }} />
            <Stack.Screen name="trainer/schedule" options={{ headerShown: false }} />
            <Stack.Screen name="trainer/sessions" options={{ headerShown: false }} />
            <Stack.Screen name="trainer/complete-profile" options={{ headerShown: false }} />
            <Stack.Screen name="member/user-home" options={{ headerShown: false }} />
            <Stack.Screen name="member/day-plan-customization" options={{ headerShown: false }} />
            <Stack.Screen name="member/menu" options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }} />
            <Stack.Screen name="member/profile" options={{ headerShown: false }} />
            <Stack.Screen name="member/membership-plans" options={{ headerShown: false }} />
            <Stack.Screen name="member/user-workout" options={{ headerShown: false }} />
            <Stack.Screen name="member/workout-plan-detail" options={{ headerShown: false }} />
            <Stack.Screen name="member/workout-ai-welcome" options={{ headerShown: false }} />
            <Stack.Screen name="member/workout-ai-generation" options={{ headerShown: false }} />
            <Stack.Screen name="member/workout-customization" options={{ headerShown: false }} />
            <Stack.Screen name="member/workout-manual-plan" options={{ headerShown: false }} />
            <Stack.Screen name="member/gym-details" options={{ headerShown: false }} />
            <Stack.Screen name="member/gym-selection" options={{ headerShown: false }} />
            <Stack.Screen name="member/gym-plans" options={{ headerShown: false }} />
            <Stack.Screen name="member/book-session" options={{ headerShown: false }} />
            <Stack.Screen name="member/my-bookings" options={{ headerShown: false }} />
            <Stack.Screen name="member/my-subscriptions" options={{ headerShown: false }} />
            <Stack.Screen name="member/schedules" options={{ headerShown: false }} />
          </Stack>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

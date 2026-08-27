import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { hydrateAuth } from '@/store/auth-store';
import { hydrateChat } from '@/store/chat-store';
import { hydrateDirectory } from '@/store/directory-store';
import { hydrateFiles } from '@/store/files-store';
import { hydrateIntegrations } from '@/store/integrations-store';
import { hydrateBilling } from '@/store/invoices-store';
import { hydrateLanguage } from '@/store/language-store';
import { hydrateNotificationPrefs } from '@/store/notifications-store';
import { hydrateStaff } from '@/store/staff-store';
import { hydrateTasks } from '@/store/tasks-store';
import { hydrateThemeMode } from '@/store/theme-store';
import { hydrateWorkPressure } from '@/store/work-pressure-store';

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 480, fade: true });

export default function RootLayout() {
  const theme = useTheme();
  const [storesHydrated, setStoresHydrated] = useState(false);
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });

  useEffect(() => {
    void Promise.all([
      hydrateThemeMode(),
      hydrateLanguage(),
      hydrateAuth(),
      hydrateNotificationPrefs(),
      hydrateStaff(),
      hydrateTasks(),
      hydrateBilling(),
      hydrateWorkPressure(),
      hydrateDirectory(),
      hydrateChat(),
      hydrateFiles(),
      hydrateIntegrations(),
    ]).finally(() => setStoresHydrated(true));
  }, []);

  const ready = fontsLoaded && storesHydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.color.brand,
      background: theme.color.background,
      card: theme.color.surface,
      text: theme.color.text,
      border: theme.color.border,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme}>
          <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 280 }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
          <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

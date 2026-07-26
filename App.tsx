import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AddExpenseSheet } from './src/components/AddExpenseSheet';
import { ShareSheet } from './src/components/ShareSheet';
import { navigationRef } from './src/navigation/navigationRef';
import { RootNavigator } from './src/navigation/RootNavigator';
import { TripProvider, useTrip } from './src/state/TripContext';
import { UiProvider } from './src/state/UiContext';
import { ThemeProvider, useColors } from './src/theme/ThemeContext';
import { useAppFonts } from './src/theme/useAppFonts';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();

  const hideSplash = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <TripProvider>
          <UiProvider>
            <AppInner />
          </UiProvider>
        </TripProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppInner() {
  const { state, hydrated } = useTrip();
  if (!hydrated) return null;

  return (
    <ThemeProvider darkMode={state.darkMode}>
      <ThemedShell darkMode={state.darkMode} />
    </ThemeProvider>
  );
}

function ThemedShell({ darkMode }: { darkMode: boolean }) {
  const c = useColors();
  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
      <AddExpenseSheet />
      <ShareSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

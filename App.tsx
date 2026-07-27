import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AddExpenseSheet } from './src/components/AddExpenseSheet';
import { ShareSheet } from './src/components/ShareSheet';
import { navigationRef } from './src/navigation/navigationRef';
import { RootNavigator } from './src/navigation/RootNavigator';
import { TripPickerScreen } from './src/screens/TripPickerScreen';
import { TripProvider, useTrip } from './src/state/TripContext';
import { UiProvider, useUi } from './src/state/UiContext';
import { fontSize, fonts } from './src/theme/typography';
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
  const { hydrated, darkMode } = useTrip();
  if (!hydrated) return null;

  return (
    <ThemeProvider darkMode={darkMode}>
      <ThemedShell darkMode={darkMode} />
    </ThemeProvider>
  );
}

function ThemedShell({ darkMode }: { darkMode: boolean }) {
  const c = useColors();
  const { activeTripId, tripLoading, tripError, state } = useTrip();
  const { showTripPicker, closeTripPicker } = useUi();

  const needsPicker = !activeTripId || showTripPicker;

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      {needsPicker ? (
        <TripPickerScreen onCancel={activeTripId ? closeTripPicker : undefined} />
      ) : tripLoading || !state ? (
        <View style={[styles.center, { backgroundColor: c.bg }]}>
          <ActivityIndicator color={c.accent} size="large" />
          <Text style={[styles.centerLabel, { color: c.neutral700 }]}>Loading trip…</Text>
        </View>
      ) : tripError ? (
        <View style={[styles.center, { backgroundColor: c.bg }]}>
          <Text style={[styles.errorTitle, { color: c.text }]}>Couldn't load this trip</Text>
          <Text style={[styles.centerLabel, { color: c.neutral700 }]}>{tripError}</Text>
        </View>
      ) : (
        <>
          <NavigationContainer ref={navigationRef}>
            <RootNavigator />
          </NavigationContainer>
          <AddExpenseSheet />
          <ShareSheet />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  centerLabel: { fontSize: fontSize.small, textAlign: 'center' },
  errorTitle: { fontFamily: fonts.bold, fontSize: fontSize.sectionTitle, marginBottom: 4 },
});

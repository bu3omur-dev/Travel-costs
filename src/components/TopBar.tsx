import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTrip } from '../state/TripContext';
import { fonts, fontSize } from '../theme/typography';
import { useColors } from '../theme/ThemeContext';
import { GearIcon, MoonIcon, SunIcon } from './icons';

export function TopBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { state, toggleDarkMode } = useTrip();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 14, borderBottomColor: c.divider, backgroundColor: c.bg },
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.kicker, { color: c.accent }]}>Group trip</Text>
        <View style={styles.iconRow}>
          <Pressable
            onPress={onOpenSettings}
            hitSlop={8}
            style={[styles.iconButton, { borderColor: c.divider }]}
          >
            <GearIcon color={c.text} />
          </Pressable>
          <Pressable
            onPress={toggleDarkMode}
            hitSlop={8}
            style={[styles.iconButton, { borderColor: c.divider }]}
          >
            {state.darkMode ? <MoonIcon color={c.text} /> : <SunIcon color={c.text} />}
          </Pressable>
        </View>
      </View>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
          {state.tripName}
        </Text>
        <Text style={[styles.dates, { color: c.neutral700 }]}>{state.tripDates}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.tiny,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: fontSize.tripName,
    letterSpacing: -0.3,
  },
  dates: {
    fontSize: fontSize.body,
    flexShrink: 0,
  },
});

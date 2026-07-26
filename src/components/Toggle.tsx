import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useColors } from '../theme/ThemeContext';

// Flat, square-cornered on/off switch — matches the modernist system's
// "never round a corner" rule instead of the iOS pill-shaped default.
export function Toggle({ value, onChange }: { value: boolean; onChange: (next: boolean) => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[styles.track, { borderColor: c.divider, backgroundColor: value ? c.accentTint : 'transparent' }]}
    >
      <View style={[styles.thumb, { backgroundColor: value ? c.accent : c.neutral600, alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 18,
    height: 18,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColors } from '../theme/ThemeContext';

export function ProgressBar({
  pct,
  height = 6,
  fillColor,
  trackColor,
}: {
  pct: number; // 0-100
  height?: number;
  fillColor?: string;
  trackColor?: string;
}) {
  const c = useColors();
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={[styles.track, { height, backgroundColor: trackColor ?? c.neutral200 }]}>
      <View
        style={{
          height: '100%',
          width: `${clamped}%`,
          backgroundColor: fillColor ?? c.text,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
  },
});

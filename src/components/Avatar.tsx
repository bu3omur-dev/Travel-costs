import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';

export function Avatar({
  initials,
  isYou,
  size = 28,
}: {
  initials: string;
  isYou: boolean;
  size?: number;
}) {
  const c = useColors();
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          backgroundColor: isYou ? c.accent : c.neutral200,
        },
      ]}
    >
      <Text style={[styles.label, { color: isYou ? c.bg : c.text, fontSize: size * 0.36 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    fontFamily: fonts.bold,
  },
});

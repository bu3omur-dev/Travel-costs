import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';

export function Chip({
  label,
  active,
  onPress,
  size = 'md',
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  size?: 'sm' | 'md';
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        size === 'sm' && styles.chipSm,
        {
          borderColor: active ? c.accent : c.divider,
          backgroundColor: active ? c.accentTint : 'transparent',
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          size === 'sm' && styles.labelSm,
          { color: active ? c.accentText : c.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipSm: {
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
  },
  labelSm: {
    fontSize: fontSize.tiny,
    letterSpacing: 0.2,
  },
});

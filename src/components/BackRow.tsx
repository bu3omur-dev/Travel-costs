import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fontSize } from '../theme/typography';
import { BackChevronIcon } from './icons';

export function BackRow({ onPress }: { onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.row}>
      <BackChevronIcon color={c.accentText} />
      <Text style={[styles.label, { color: c.accentText }]}>Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: fontSize.small,
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const c = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[styles.action, { color: c.accentText }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sectionTitle,
  },
  action: {
    fontSize: fontSize.small,
  },
});

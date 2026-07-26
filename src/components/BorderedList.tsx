import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColors } from '../theme/ThemeContext';

export function BorderedList({ children, style }: { children: React.ReactNode; style?: object }) {
  const c = useColors();
  return <View style={[styles.box, { borderColor: c.divider }, style]}>{children}</View>;
}

export function BorderedRow({
  children,
  last,
  style,
}: {
  children: React.ReactNode;
  last?: boolean;
  style?: object;
}) {
  const c = useColors();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: c.divider }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
});

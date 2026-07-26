import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { PlusIcon } from './icons';

export function Fab({ onPress, bottom }: { onPress: () => void; bottom: number }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        {
          bottom,
          backgroundColor: pressed ? c.accentStrong : c.accent,
        },
      ]}
    >
      <PlusIcon color={c.bg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    zIndex: 5,
  },
});

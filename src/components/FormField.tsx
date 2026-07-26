import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';

export function FieldLabel({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[styles.label, { color: c.neutral700 }]}>{children}</Text>;
}

export function TextField(props: TextInputProps) {
  const c = useColors();
  return (
    <TextInput
      placeholderTextColor={c.neutral600}
      {...props}
      style={[styles.input, { backgroundColor: c.surface, borderColor: c.divider, color: c.text }, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.tiny,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: fonts.regular,
    fontSize: fontSize.input,
    borderWidth: 1,
  },
});

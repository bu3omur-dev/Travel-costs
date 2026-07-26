import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useColors } from '../theme/ThemeContext';

export function ScreenContainer({
  children,
  contentBottomPadding = 100,
}: {
  children: React.ReactNode;
  contentBottomPadding?: number;
}) {
  const c = useColors();
  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ padding: 18, paddingTop: 18, paddingHorizontal: 20, paddingBottom: contentBottomPadding }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

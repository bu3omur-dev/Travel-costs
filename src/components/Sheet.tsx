import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../theme/ThemeContext';

// Bottom sheet modal — backdrop + slide-up panel — matching the
// `showAddSheet`/`showShareSheet` overlays in the .dc.html prototype.
export function Sheet({
  visible,
  onClose,
  children,
  maxHeightPct = 80,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightPct?: number;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: c.backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.panel,
            {
              maxHeight: `${maxHeightPct}%`,
              backgroundColor: c.bg,
              borderTopColor: c.text,
              paddingBottom: insets.bottom + 18,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    width: '100%',
    borderTopWidth: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
});

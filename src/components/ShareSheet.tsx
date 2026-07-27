import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useTripData } from '../state/selectors';
import { useTrip } from '../state/TripContext';
import { useUi } from '../state/UiContext';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';
import { CloseIcon } from './icons';
import { Sheet } from './Sheet';

export function ShareSheet() {
  const c = useColors();
  const { state: rawState } = useTrip();
  const state = rawState!;
  const data = useTripData(state);
  const { showShareSheet, closeShare, shareMode } = useUi();
  const [copied, setCopied] = useState(false);

  const title = shareMode === 'recap' ? 'Share recap' : 'Share balances';
  const baseShareText = shareMode === 'recap' ? data.recapShareText : data.balancesShareText;
  const shareText = baseShareText + '\n\nJoin this trip: code ' + state.id;

  useEffect(() => {
    if (showShareSheet) setCopied(false);
  }, [showShareSheet, shareMode]);

  async function handleCopy() {
    await Clipboard.setStringAsync(shareText);
    setCopied(true);
  }

  async function handleNativeShare() {
    try {
      await Share.share({ message: shareText, title: state.tripName + (shareMode === 'recap' ? ' recap' : ' balances') });
    } catch {
      // user cancelled or share failed silently, nothing to recover
    }
  }

  return (
    <Sheet visible={showShareSheet} onClose={closeShare} maxHeightPct={80}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        <Pressable onPress={closeShare} style={[styles.closeBtn, { borderColor: c.divider }]} hitSlop={8}>
          <CloseIcon color={c.text} />
        </Pressable>
      </View>

      <View style={[styles.textBox, { backgroundColor: c.surface, borderColor: c.divider }]}>
        <Text style={[styles.textBoxContent, { color: c.text }]}>{shareText}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable onPress={handleCopy} style={[styles.copyBtn, { borderColor: c.text }]}>
          <Text style={[styles.copyLabel, { color: c.text }]}>{copied ? 'Copied!' : 'Copy text'}</Text>
        </Pressable>
        <Pressable onPress={handleNativeShare} style={[styles.shareBtn, { backgroundColor: c.accent }]}>
          <Text style={[styles.shareLabel, { color: c.bg }]}>Share…</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontFamily: fonts.bold, fontSize: fontSize.sheetTitle },
  closeBtn: { width: 30, height: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  textBox: { borderWidth: 1, padding: 14, marginBottom: 16 },
  textBoxContent: { fontSize: fontSize.body, lineHeight: fontSize.body * 1.6 },
  actionRow: { flexDirection: 'row', gap: 10 },
  copyBtn: { flex: 1, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'flex-start' },
  copyLabel: { fontFamily: fonts.bold, fontSize: fontSize.body },
  shareBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'flex-start' },
  shareLabel: { fontFamily: fonts.bold, fontSize: fontSize.body },
});

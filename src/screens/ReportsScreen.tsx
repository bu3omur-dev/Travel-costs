import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { TopBar } from '../components/TopBar';
import { RootStackParamList } from '../navigation/types';
import { useTripData } from '../state/selectors';
import { useTrip } from '../state/TripContext';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';
import { usd } from '../utils/format';

export function ReportsScreen() {
  const c = useColors();
  const { state: rawState } = useTrip();
  const state = rawState!;
  const data = useTripData(state);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <TopBar onOpenSettings={() => navigation.navigate('Settings')} />
      <ScreenContainer>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Budget vs. actual</Text>
        <View style={styles.budgetRows}>
          {data.categoryRows.map((row) => (
            <View key={row.id} style={styles.budgetRow}>
              <View style={styles.rowHeader}>
                <Text style={[styles.rowLabel, { color: c.text }]}>{row.label}</Text>
                <Text style={[styles.rowAmount, { color: row.over ? c.accentText : c.text }]}>
                  {usd(row.spent)} <Text style={{ color: c.neutral600 }}>/ {usd(row.budget)}</Text>
                </Text>
              </View>
              <View style={styles.trackWrap}>
                <ProgressBar pct={row.pct} height={14} fillColor={row.over ? c.accent : c.text} />
                <View style={[styles.marker, { backgroundColor: c.text }]} />
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.spacedTitle, { color: c.text }]}>Spend by traveler</Text>
        <View style={styles.paidRows}>
          {data.paidRows.map((p) => (
            <View key={p.id} style={styles.paidRow}>
              <View style={styles.rowHeader}>
                <Text style={[styles.rowLabel, { color: c.text }]}>{p.name}</Text>
                <Text style={[styles.rowAmount, { color: c.text }]}>{usd(p.amount)}</Text>
              </View>
              <ProgressBar pct={p.pct} fillColor={c.neutral700} />
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.spacedTitle, { color: c.text }]}>Currency exposure</Text>
        <View style={[styles.table, { borderBottomColor: c.divider }]}>
          <View style={[styles.tableHeaderRow, { borderBottomColor: c.divider }]}>
            <Text style={[styles.th, styles.thLeft, { color: c.neutral700 }]}>Currency</Text>
            <Text style={[styles.th, styles.thRight, { color: c.neutral700 }]}>Native</Text>
            <Text style={[styles.th, styles.thRight, { color: c.neutral700 }]}>≈ USD</Text>
          </View>
          {data.currencyRows.map((row) => (
            <View key={row.code} style={[styles.tableRow, { borderBottomColor: c.divider }]}>
              <Text style={[styles.td, styles.tdLeft, { color: c.text }]}>{row.code}</Text>
              <Text style={[styles.td, styles.tdRight, { color: c.text }]}>{row.nativeLabel}</Text>
              <Text style={[styles.td, styles.tdRight, { color: c.neutral700 }]}>{row.usdLabel}</Text>
            </View>
          ))}
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: fontSize.sectionTitle, marginBottom: 10 },
  spacedTitle: { marginTop: 24 },
  budgetRows: { gap: 14, marginBottom: 24 },
  budgetRow: {},
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rowLabel: { fontFamily: fonts.semibold, fontSize: fontSize.small },
  rowAmount: { fontSize: fontSize.small },
  trackWrap: { position: 'relative' },
  marker: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 2 },
  paidRows: { gap: 10, marginBottom: 24 },
  paidRow: {},
  table: { width: '100%' },
  tableHeaderRow: { flexDirection: 'row', borderBottomWidth: 2 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1 },
  th: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.9, paddingVertical: 8, paddingHorizontal: 4 },
  thLeft: { flex: 1, textAlign: 'left' },
  thRight: { flex: 1, textAlign: 'right' },
  td: { fontSize: fontSize.body, paddingVertical: 9, paddingHorizontal: 4 },
  tdLeft: { flex: 1, textAlign: 'left', fontFamily: fonts.semibold },
  tdRight: { flex: 1, textAlign: 'right' },
});

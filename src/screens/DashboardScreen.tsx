import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BorderedList, BorderedRow } from '../components/BorderedList';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionHeader } from '../components/SectionHeader';
import { TopBar } from '../components/TopBar';
import { RootStackParamList } from '../navigation/types';
import { useTripData } from '../state/selectors';
import { useTrip } from '../state/TripContext';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';
import { dateLabel, usd } from '../utils/format';

export function DashboardScreen() {
  const c = useColors();
  const { state: rawState } = useTrip();
  const state = rawState!;
  const data = useTripData(state);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const stats = [
    { label: 'Per person', value: usd(data.totalSpentUSD / state.travelers.length) },
    { label: 'Travelers', value: String(state.travelers.length) },
    { label: 'Expenses logged', value: String(data.enriched.length) },
    { label: 'Currencies', value: String(data.currencyRows.length) },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <TopBar onOpenSettings={() => navigation.navigate('Settings')} />
      <ScreenContainer>
        <View style={[styles.budgetCard, { borderColor: c.divider }]}>
          <View style={styles.budgetHeaderRow}>
            <Text style={[styles.kicker, { color: c.neutral700 }]}>Total spent</Text>
            <Text style={[styles.small, { color: c.neutral700 }]}>of {usd(data.totalBudgetUSD)} budget</Text>
          </View>
          <Text style={[styles.bigTotal, { color: c.text }]}>{usd(data.totalSpentUSD)}</Text>
          <ProgressBar pct={data.pctSpent} height={8} fillColor={c.accent} />
          <View style={styles.budgetFooterRow}>
            <Text style={[styles.small, { color: c.neutral700 }]}>{Math.round(data.pctSpent)}% used</Text>
            <Text style={[styles.small, { color: c.neutral700 }]}>
              {usd(Math.max(0, data.totalBudgetUSD - data.totalSpentUSD))} left
            </Text>
          </View>
        </View>

        <View style={[styles.statGrid, { borderColor: c.divider }]}>
          {stats.map((s, i) => (
            <View
              key={s.label}
              style={[
                styles.statCell,
                { backgroundColor: c.bg },
                i % 2 === 0 && { borderRightWidth: 1, borderRightColor: c.divider },
                i < 2 && { borderBottomWidth: 1, borderBottomColor: c.divider },
              ]}
            >
              <Text style={[styles.statLabel, { color: c.neutral700 }]}>{s.label}</Text>
              <Text style={[styles.statValue, { color: c.text }]}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionSpacer}>
          <SectionHeader title="By category" actionLabel="Full breakdown" onAction={() => navigation.navigate('Tabs', { screen: 'Reports' })} />
          <View style={styles.categoryList}>
            {data.categoryRows.map((row) => (
              <View key={row.id} style={styles.categoryRow}>
                <View style={styles.categoryLabelRow}>
                  <Text style={[styles.categoryLabel, { color: c.text }]}>{row.label}</Text>
                  <Text style={[styles.categorySpent, { color: row.over ? c.accentText : c.text }]}>
                    {usd(row.spent)} <Text style={{ color: c.neutral600 }}>/ {usd(row.budget)}</Text>
                  </Text>
                </View>
                <ProgressBar pct={row.pct} fillColor={row.over ? c.accent : c.text} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionSpacer}>
          <SectionHeader title="Recent activity" actionLabel="See all" onAction={() => navigation.navigate('Tabs', { screen: 'Expenses' })} />
          <Pressable
            onPress={() => navigation.navigate('Recap')}
            style={[styles.recapRow, { borderColor: c.divider }]}
          >
            <Text style={[styles.recapLabel, { color: c.text }]}>Trip recap</Text>
            <Text style={[styles.recapAction, { color: c.accentText }]}>View →</Text>
          </Pressable>
          <BorderedList style={styles.activityList}>
            {data.recentExpenses.map((e, i) => (
              <BorderedRow key={e.id} last={i === data.recentExpenses.length - 1} style={styles.activityRow}>
                <View style={styles.activityText}>
                  <Text style={[styles.activityDesc, { color: c.text }]}>{e.description}</Text>
                  <Text style={[styles.activityMeta, { color: c.neutral700 }]}>
                    {e.categoryLabel} · paid by {e.payer.name} · {dateLabel(e.date)}
                  </Text>
                </View>
                <Text style={[styles.activityAmount, { color: c.text }]}>{usd(e.amountUSD)}</Text>
              </BorderedRow>
            ))}
          </BorderedList>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  budgetCard: { borderWidth: 1, padding: 16 },
  budgetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  kicker: { fontSize: fontSize.tiny, letterSpacing: 0.9, textTransform: 'uppercase' },
  small: { fontSize: fontSize.tiny },
  bigTotal: { fontFamily: fonts.bold, fontSize: fontSize.display, lineHeight: fontSize.display, marginBottom: 12 },
  budgetFooterRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, marginTop: 16 },
  statCell: { width: '50%', padding: 14 },
  statLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.9 },
  statValue: { fontFamily: fonts.bold, fontSize: fontSize.stat, marginTop: 4 },
  sectionSpacer: { marginTop: 22 },
  categoryList: { marginTop: 10, gap: 12 },
  categoryRow: { gap: 4 },
  categoryLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoryLabel: { fontFamily: fonts.semibold, fontSize: fontSize.small },
  categorySpent: { fontSize: fontSize.small },
  recapRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    paddingHorizontal: 14,
  },
  recapLabel: { fontFamily: fonts.semibold, fontSize: fontSize.body },
  recapAction: { fontSize: fontSize.small },
  activityList: { marginTop: 10 },
  activityRow: { alignItems: 'center' },
  activityText: { flexShrink: 1 },
  activityDesc: { fontFamily: fonts.semibold, fontSize: fontSize.body },
  activityMeta: { fontSize: fontSize.tiny, marginTop: 2 },
  activityAmount: { fontFamily: fonts.semibold, fontSize: fontSize.body, marginLeft: 10 },
});

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BackRow } from '../components/BackRow';
import { BorderedList, BorderedRow } from '../components/BorderedList';
import { ProgressBar } from '../components/ProgressBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { TopBar } from '../components/TopBar';
import { RootStackParamList } from '../navigation/types';
import { useTripData } from '../state/selectors';
import { useTrip } from '../state/TripContext';
import { useUi } from '../state/UiContext';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';
import { usd } from '../utils/format';

export function RecapScreen() {
  const c = useColors();
  const { state: rawState } = useTrip();
  const state = rawState!;
  const data = useTripData(state);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { openShare } = useUi();

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <TopBar onOpenSettings={() => navigation.navigate('Settings')} />
      <ScreenContainer contentBottomPadding={28}>
        <BackRow onPress={() => navigation.goBack()} />
        <Text style={[styles.kicker, { color: c.accent }]}>Trip complete</Text>
        <Text style={[styles.tripName, { color: c.text }]}>{state.tripName}</Text>
        <Text style={[styles.subLine, { color: c.neutral700 }]}>
          {state.tripDates} · {data.recap.daysLabel}
        </Text>

        <View style={[styles.totalCard, { borderColor: c.divider }]}>
          <Text style={[styles.totalKicker, { color: c.neutral700 }]}>Total spent, the crew</Text>
          <Text style={[styles.totalValue, { color: c.text }]}>{usd(data.totalSpentUSD)}</Text>
          <Text style={[styles.totalSub, { color: c.neutral700 }]}>
            {usd(data.totalSpentUSD / state.travelers.length)} per person · {data.enriched.length} expenses logged
          </Text>
        </View>

        <BorderedList style={styles.statsList}>
          <BorderedRow>
            <Text style={[styles.statLabel, { color: c.neutral700 }]}>Biggest expense</Text>
            <View style={styles.statRight}>
              <Text style={[styles.statValue, { color: c.text }]}>{data.recap.biggestDesc}</Text>
              <Text style={[styles.statSub, { color: c.neutral700 }]}>{data.recap.biggestAmountLabel}</Text>
            </View>
          </BorderedRow>
          <BorderedRow>
            <Text style={[styles.statLabel, { color: c.neutral700 }]}>Top spender</Text>
            <Text style={[styles.statValue, { color: c.text }]}>
              {data.recap.topSpenderName} · {data.recap.topSpenderAmountLabel}
            </Text>
          </BorderedRow>
          <BorderedRow last>
            <Text style={[styles.statLabel, { color: c.neutral700 }]}>Top category</Text>
            <Text style={[styles.statValue, { color: c.text }]}>
              {data.recap.topCategoryLabel} · {data.recap.topCategoryAmountLabel}
            </Text>
          </BorderedRow>
        </BorderedList>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Where it went</Text>
        <View style={styles.categoryList}>
          {data.categoryRows.map((row) => (
            <View key={row.id} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryLabel, { color: c.text }]}>{row.label}</Text>
                <Text style={{ color: c.text, fontSize: fontSize.small }}>{usd(row.spent)}</Text>
              </View>
              <ProgressBar pct={row.pct} fillColor={c.text} />
            </View>
          ))}
        </View>

        <View style={[styles.settleRow, { borderColor: data.recap.outstandingCount ? c.accent : c.divider }]}>
          <Text style={[styles.settleLabel, { color: c.text }]}>{data.recap.settleLabel}</Text>
          <Pressable onPress={() => navigation.navigate('Tabs', { screen: 'Split' })} hitSlop={8}>
            <Text style={[styles.settleLink, { color: c.accentText }]}>View split →</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => openShare('recap')} style={[styles.shareBtn, { backgroundColor: c.accent }]}>
          <Text style={[styles.shareBtnLabel, { color: c.bg }]}>Share recap</Text>
        </Pressable>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  kicker: { fontFamily: fonts.semibold, fontSize: fontSize.tiny, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 4 },
  tripName: { fontFamily: fonts.bold, fontSize: fontSize.recapTitle, marginBottom: 2 },
  subLine: { fontSize: fontSize.small, marginBottom: 20 },
  totalCard: { borderWidth: 1, padding: 16, marginBottom: 16 },
  totalKicker: { fontSize: fontSize.tiny, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 },
  totalValue: { fontFamily: fonts.bold, fontSize: fontSize.display, lineHeight: fontSize.display },
  totalSub: { fontSize: fontSize.small, marginTop: 6 },
  statsList: { marginBottom: 20 },
  statLabel: { fontSize: fontSize.small, flexShrink: 0 },
  statRight: { alignItems: 'flex-end' },
  statValue: { fontFamily: fonts.bold, fontSize: fontSize.body, textAlign: 'right' },
  statSub: { fontSize: fontSize.tiny, textAlign: 'right' },
  sectionTitle: { fontFamily: fonts.bold, fontSize: fontSize.sectionTitle, marginBottom: 10 },
  categoryList: { gap: 12, marginBottom: 20 },
  categoryRow: { gap: 4 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoryLabel: { fontFamily: fonts.semibold, fontSize: fontSize.small },
  settleRow: { borderWidth: 1, padding: 14, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settleLabel: { fontSize: fontSize.body, flexShrink: 1 },
  settleLink: { fontSize: fontSize.small, marginLeft: 10 },
  shareBtn: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'flex-start' },
  shareBtnLabel: { fontFamily: fonts.bold, fontSize: fontSize.input },
});

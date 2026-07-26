import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { BorderedList, BorderedRow } from '../components/BorderedList';
import { Chip } from '../components/Chip';
import { ScreenContainer } from '../components/ScreenContainer';
import { TopBar } from '../components/TopBar';
import { CATEGORIES } from '../data/seed';
import { RootStackParamList } from '../navigation/types';
import { useTripData } from '../state/selectors';
import { useTrip } from '../state/TripContext';
import { useUi } from '../state/UiContext';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';
import { dateLabel, native, usd } from '../utils/format';

const FILTERS = [{ id: 'all', label: 'All' }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label }))];

export function ExpensesScreen() {
  const c = useColors();
  const { state } = useTrip();
  const data = useTripData(state);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { expensesFilter: filterCategory, setExpensesFilter: setFilterCategory } = useUi();

  const filtered = useMemo(() => {
    return data.enriched
      .filter((e) => filterCategory === 'all' || e.category === filterCategory)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.enriched, filterCategory]);

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <TopBar onOpenSettings={() => navigation.navigate('Settings')} />
      <ScreenContainer>
        <View style={styles.chipRow}>
          {FILTERS.map((f) => (
            <Chip key={f.id} label={f.label} active={filterCategory === f.id} onPress={() => setFilterCategory(f.id)} />
          ))}
        </View>

        <BorderedList>
          {filtered.map((e, i) => (
            <BorderedRow key={e.id} last={i === filtered.length - 1} style={styles.row}>
              <View style={styles.left}>
                <Avatar initials={e.payer.initials} isYou={e.payerId === 'you'} size={30} />
                <View style={styles.textCol}>
                  <Text style={[styles.desc, { color: c.text }]}>{e.description}</Text>
                  <Text style={[styles.meta, { color: c.neutral700 }]}>
                    {e.categoryLabel} · paid by {e.payer.name} · {dateLabel(e.date)}
                  </Text>
                  <Text style={[styles.splitLabel, { color: c.neutral600 }]}>
                    split {e.participantIds.length} of {state.travelers.length}
                  </Text>
                </View>
              </View>
              <View style={styles.right}>
                <Text style={[styles.native, { color: c.text }]}>{native(e.amount, e.currency)}</Text>
                {e.currency !== 'USD' && state.showConversions ? (
                  <Text style={[styles.usd, { color: c.neutral600 }]}>≈ {usd(e.amountUSD)}</Text>
                ) : null}
              </View>
            </BorderedRow>
          ))}
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: c.neutral600 }]}>No expenses in this category yet.</Text>
            </View>
          ) : null}
        </BorderedList>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  row: { alignItems: 'flex-start' },
  left: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', flexShrink: 1 },
  textCol: { flexShrink: 1 },
  desc: { fontFamily: fonts.semibold, fontSize: fontSize.body },
  meta: { fontSize: fontSize.tiny, marginTop: 3 },
  splitLabel: { fontSize: 10, marginTop: 2 },
  right: { alignItems: 'flex-end', marginLeft: 8 },
  native: { fontFamily: fonts.bold, fontSize: fontSize.body },
  usd: { fontSize: 10, marginTop: 2 },
  empty: { paddingVertical: 30, paddingHorizontal: 12, alignItems: 'center' },
  emptyText: { fontSize: fontSize.small },
});

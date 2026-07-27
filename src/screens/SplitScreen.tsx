import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { BorderedList, BorderedRow } from '../components/BorderedList';
import { ShareIcon } from '../components/icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { TopBar } from '../components/TopBar';
import { RootStackParamList } from '../navigation/types';
import { useTripData } from '../state/selectors';
import { useTrip } from '../state/TripContext';
import { useUi } from '../state/UiContext';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';
import { usd } from '../utils/format';

export function SplitScreen() {
  const c = useColors();
  const { state: rawState, myTravelerId, toggleSettled } = useTrip();
  const state = rawState!;
  const data = useTripData(state);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { openShare } = useUi();

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <TopBar onOpenSettings={() => navigation.navigate('Settings')} />
      <ScreenContainer>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Balances</Text>
          <Pressable onPress={() => openShare('balances')} hitSlop={8} style={styles.shareBtn}>
            <ShareIcon color={c.accentText} />
            <Text style={[styles.shareLabel, { color: c.accentText }]}>Share</Text>
          </Pressable>
        </View>

        <BorderedList style={styles.balancesList}>
          {data.balances.map((b, i) => {
            const netColor = b.net > 0.5 ? c.positive : b.net < -0.5 ? c.accentText : c.neutral700;
            const netLabel = b.net > 0.5 ? '+' + usd(b.net) + ' owed' : b.net < -0.5 ? '-' + usd(-b.net) + ' owes' : 'settled';
            return (
              <BorderedRow key={b.id} last={i === data.balances.length - 1}>
                <View style={styles.travelerLeft}>
                  <Avatar initials={b.initials} isYou={b.id === myTravelerId} />
                  <Text style={[styles.travelerName, { color: c.text }]}>{b.name}</Text>
                </View>
                <Text style={[styles.netLabel, { color: netColor }]}>{netLabel}</Text>
              </BorderedRow>
            );
          })}
        </BorderedList>

        <Text style={[styles.sectionTitle, styles.settlementsTitle, { color: c.text }]}>Suggested settlements</Text>
        <View style={styles.settlementsList}>
          {data.settlements.map((s) => {
            const settled = Object.prototype.hasOwnProperty.call(state.settledPayments, s.id);
            return (
              <View
                key={s.id}
                style={[styles.settlementRow, { borderColor: c.divider, opacity: settled ? 0.45 : 1 }]}
              >
                <View style={styles.settlementText}>
                  <Text style={{ color: c.text, fontSize: fontSize.body, textDecorationLine: settled ? 'line-through' : 'none' }}>
                    <Text style={styles.bold}>{s.from.name}</Text> owes <Text style={styles.bold}>{s.to.name}</Text>
                  </Text>
                  <Text
                    style={[
                      styles.settlementAmount,
                      { color: c.text, textDecorationLine: settled ? 'line-through' : 'none' },
                    ]}
                  >
                    {usd(s.amount)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => toggleSettled(s)}
                  style={[
                    styles.settleBtn,
                    {
                      backgroundColor: settled ? 'transparent' : c.accent,
                      borderColor: settled ? c.divider : c.accent,
                    },
                  ]}
                >
                  <Text style={[styles.settleBtnLabel, { color: settled ? c.text : c.bg }]}>
                    {settled ? 'Undo' : 'Settle up'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
          {data.settlements.length === 0 ? (
            <View style={[styles.emptyBox, { borderColor: c.divider }]}>
              <Text style={[styles.emptyText, { color: c.neutral600 }]}>Everyone is settled up.</Text>
            </View>
          ) : null}
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: fontSize.sectionTitle },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  shareLabel: { fontSize: fontSize.small },
  balancesList: { marginBottom: 22 },
  travelerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  travelerName: { fontFamily: fonts.semibold, fontSize: fontSize.body },
  netLabel: { fontFamily: fonts.bold, fontSize: fontSize.body },
  settlementsTitle: { marginBottom: 10 },
  settlementsList: { gap: 8 },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
  },
  settlementText: { flexShrink: 1 },
  bold: { fontFamily: fonts.bold },
  settlementAmount: { fontFamily: fonts.bold, fontSize: 16, marginTop: 4 },
  settleBtn: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, marginLeft: 10 },
  settleBtnLabel: { fontFamily: fonts.semibold, fontSize: fontSize.tiny },
  emptyBox: { padding: 20, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: fontSize.small },
});

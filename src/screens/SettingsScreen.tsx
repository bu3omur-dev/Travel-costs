import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { BackRow } from '../components/BackRow';
import { FieldLabel, TextField } from '../components/FormField';
import { ScreenContainer } from '../components/ScreenContainer';
import { Toggle } from '../components/Toggle';
import { TopBar } from '../components/TopBar';
import { CATEGORIES } from '../data/seed';
import { fetchTrip } from '../firebase/tripsApi';
import { RootStackParamList } from '../navigation/types';
import { useTrip } from '../state/TripContext';
import { useUi } from '../state/UiContext';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';
import { usd } from '../utils/format';

export function SettingsScreen() {
  const c = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    state: rawState,
    myTravelerId,
    joinedTrips,
    activeTripId,
    setTripName,
    setTripDates,
    addTraveler,
    removeTraveler,
    setCategoryBudget,
    resetSettled,
    resetTrip,
    setEurRate,
    setGbpRate,
    setKwdRate,
    setShowConversions,
    leaveTrip,
    switchTrip,
  } = useTrip();
  const state = rawState!;
  const { openTripPicker } = useUi();

  const [newTravelerName, setNewTravelerName] = useState('');
  const [eurRateText, setEurRateText] = useState(String(state.eurRate));
  const [gbpRateText, setGbpRateText] = useState(String(state.gbpRate));
  const [kwdRateText, setKwdRateText] = useState(String(state.kwdRate));
  const [tripNames, setTripNames] = useState<Record<string, string>>({});
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    setEurRateText(String(state.eurRate));
  }, [state.eurRate]);
  useEffect(() => {
    setGbpRateText(String(state.gbpRate));
  }, [state.gbpRate]);
  useEffect(() => {
    setKwdRateText(String(state.kwdRate));
  }, [state.kwdRate]);

  useEffect(() => {
    let cancelled = false;
    const others = joinedTrips.filter((j) => j.tripId !== activeTripId);
    (async () => {
      const entries = await Promise.all(
        others.map(async (j) => {
          const t = await fetchTrip(j.tripId).catch(() => null);
          return [j.tripId, t?.tripName || 'Untitled trip'] as const;
        })
      );
      if (!cancelled) setTripNames(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [joinedTrips, activeTripId]);

  const payerIds = useMemo(() => new Set(state.expenses.map((e) => e.payerId)), [state.expenses]);
  const totalBudget = CATEGORIES.reduce((a, cat) => a + (state.categoryBudgets[cat.id] ?? 0), 0);

  function handleAddTraveler() {
    if (!newTravelerName.trim()) return;
    addTraveler(newTravelerName);
    setNewTravelerName('');
  }

  function commitRate(text: string, setRate: (v: number) => void, fallback: number) {
    const v = parseFloat(text);
    setRate(Number.isFinite(v) && v > 0 ? v : fallback);
  }

  function confirmLeaveTrip(id: string, name: string) {
    Alert.alert(
      `Leave "${name || 'Untitled trip'}"?`,
      'You can rejoin later with the trip code. This only removes it from this device — nothing is deleted for the rest of the group.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => leaveTrip(id) },
      ]
    );
  }

  async function handleCopyCode() {
    await Clipboard.setStringAsync(state.id);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  }

  function confirmResetTrip() {
    Alert.alert(
      'Reset this trip?',
      'This clears all expenses, budgets and settlement status for this trip. Travelers are kept. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetTrip() },
      ]
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <TopBar onOpenSettings={() => navigation.navigate('Settings')} />
      <ScreenContainer contentBottomPadding={28}>
        <BackRow onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: c.text }]}>Trip settings</Text>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Share this trip</Text>
        <View style={[styles.codeBox, { borderColor: c.divider }]}>
          <View style={styles.codeText}>
            <Text style={[styles.codeKicker, { color: c.neutral700 }]}>Trip code</Text>
            <Text style={[styles.codeValue, { color: c.text }]}>{state.id}</Text>
          </View>
          <Pressable onPress={handleCopyCode} style={[styles.copyBtn, { borderColor: c.text }]}>
            <Text style={[styles.copyBtnLabel, { color: c.text }]}>{codeCopied ? 'Copied!' : 'Copy'}</Text>
          </Pressable>
        </View>
        <Text style={[styles.codeHint, { color: c.neutral700 }]}>
          Anyone with this code can view and add expenses to this trip.
        </Text>

        <Text style={[styles.sectionTitle, styles.sectionSpacer, { color: c.text }]}>Your trips</Text>
        <View style={[styles.travelerList, { borderColor: c.divider }]}>
          {joinedTrips.map((j, i) => {
            const active = j.tripId === activeTripId;
            const name = active ? state.tripName || 'Untitled trip' : tripNames[j.tripId] ?? 'Loading…';
            return (
              <View
                key={j.tripId}
                style={[
                  styles.tripRow,
                  i < joinedTrips.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.divider },
                  active && { backgroundColor: c.accentTint },
                ]}
              >
                <Pressable style={styles.tripRowText} onPress={() => switchTrip(j.tripId)} hitSlop={8}>
                  <Text style={[styles.travelerName, { color: active ? c.accentText : c.text }]}>{name}</Text>
                </Pressable>
                <Pressable onPress={() => confirmLeaveTrip(j.tripId, name)} hitSlop={8}>
                  <Text style={[styles.removeLabel, { color: c.accentText }]}>Leave</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
        <Pressable onPress={openTripPicker} style={[styles.dataBtn, styles.addTripBtn, { borderColor: c.accent }]}>
          <Text style={[styles.dataBtnLabel, { color: c.accentText }]}>+ Create or join another trip</Text>
        </Pressable>

        <View style={styles.field}>
          <FieldLabel>Trip name</FieldLabel>
          <TextField value={state.tripName} onChangeText={setTripName} />
        </View>
        <View style={[styles.field, styles.fieldGap]}>
          <FieldLabel>Dates</FieldLabel>
          <TextField value={state.tripDates} onChangeText={setTripDates} />
        </View>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Travelers</Text>
        <View style={[styles.travelerList, { borderColor: c.divider }]}>
          {state.travelers.map((t, i) => {
            const canRemove = t.id !== myTravelerId && !payerIds.has(t.id) && state.travelers.length > 1;
            return (
              <View
                key={t.id}
                style={[
                  styles.travelerRow,
                  i < state.travelers.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.divider },
                ]}
              >
                <View style={styles.travelerLeft}>
                  <Avatar initials={t.initials} isYou={t.id === myTravelerId} size={26} />
                  <Text style={[styles.travelerName, { color: c.text }]}>{t.name}</Text>
                </View>
                {canRemove ? (
                  <Pressable onPress={() => removeTraveler(t.id)} hitSlop={8}>
                    <Text style={[styles.removeLabel, { color: c.accentText }]}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
        <View style={styles.addTravelerRow}>
          <TextField
            value={newTravelerName}
            onChangeText={setNewTravelerName}
            placeholder="Add traveler name"
            style={styles.addTravelerInput}
            onSubmitEditing={handleAddTraveler}
          />
          <Pressable
            onPress={handleAddTraveler}
            style={[styles.addBtn, { backgroundColor: newTravelerName.trim() ? c.accent : c.neutral700 }]}
          >
            <Text style={[styles.addBtnLabel, { color: c.bg }]}>Add</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, styles.sectionSpacer, { color: c.text }]}>Category budgets</Text>
        <View style={styles.budgetList}>
          {CATEGORIES.map((cat) => (
            <View key={cat.id} style={styles.budgetRow}>
              <Text style={[styles.budgetLabel, { color: c.text }]}>{cat.label}</Text>
              <View style={[styles.budgetInputWrap, { borderColor: c.divider }]}>
                <Text style={[styles.dollar, { color: c.neutral700 }]}>$</Text>
                <TextField
                  value={String(state.categoryBudgets[cat.id] ?? 0)}
                  onChangeText={(v) => setCategoryBudget(cat.id, parseInt(v.replace(/[^0-9]/g, ''), 10) || 0)}
                  inputMode="numeric"
                  style={styles.budgetInput}
                />
              </View>
            </View>
          ))}
        </View>
        <View style={[styles.totalRow, { borderTopColor: c.divider }]}>
          <Text style={[styles.totalLabel, { color: c.neutral700 }]}>Total budget</Text>
          <Text style={[styles.totalValue, { color: c.neutral700 }]}>{usd(totalBudget)}</Text>
        </View>

        <Text style={[styles.sectionTitle, styles.sectionSpacer, { color: c.text }]}>Currency rates</Text>
        <View style={styles.rateRow}>
          <Text style={[styles.rateLabel, { color: c.text }]}>1 EUR =</Text>
          <View style={[styles.budgetInputWrap, { borderColor: c.divider }]}>
            <Text style={[styles.dollar, { color: c.neutral700 }]}>$</Text>
            <TextField
              value={eurRateText}
              onChangeText={setEurRateText}
              onEndEditing={() => commitRate(eurRateText, setEurRate, state.eurRate)}
              inputMode="decimal"
              style={styles.budgetInput}
            />
          </View>
        </View>
        <View style={[styles.rateRow, styles.rateRowGap]}>
          <Text style={[styles.rateLabel, { color: c.text }]}>1 GBP =</Text>
          <View style={[styles.budgetInputWrap, { borderColor: c.divider }]}>
            <Text style={[styles.dollar, { color: c.neutral700 }]}>$</Text>
            <TextField
              value={gbpRateText}
              onChangeText={setGbpRateText}
              onEndEditing={() => commitRate(gbpRateText, setGbpRate, state.gbpRate)}
              inputMode="decimal"
              style={styles.budgetInput}
            />
          </View>
        </View>
        <View style={[styles.rateRow, styles.rateRowGap]}>
          <Text style={[styles.rateLabel, { color: c.text }]}>1 KWD =</Text>
          <View style={[styles.budgetInputWrap, { borderColor: c.divider }]}>
            <Text style={[styles.dollar, { color: c.neutral700 }]}>$</Text>
            <TextField
              value={kwdRateText}
              onChangeText={setKwdRateText}
              onEndEditing={() => commitRate(kwdRateText, setKwdRate, state.kwdRate)}
              inputMode="decimal"
              style={styles.budgetInput}
            />
          </View>
        </View>
        <View style={[styles.toggleRow, { borderColor: c.divider }]}>
          <Text style={[styles.toggleLabel, { color: c.text }]}>Show converted amounts in Expenses</Text>
          <Toggle value={state.showConversions} onChange={setShowConversions} />
        </View>

        <Text style={[styles.sectionTitle, styles.sectionSpacer, { color: c.text }]}>Data</Text>
        <Pressable onPress={resetSettled} style={[styles.dataBtn, { borderColor: c.divider }]}>
          <Text style={[styles.dataBtnLabel, { color: c.text }]}>Clear all settled markers</Text>
        </Pressable>
        <Pressable onPress={confirmResetTrip} style={[styles.dataBtn, styles.dataBtnDanger, { borderColor: c.accent }]}>
          <Text style={[styles.dataBtnLabel, { color: c.accentText }]}>Reset this trip</Text>
        </Pressable>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: fontSize.sheetTitle, marginBottom: 16 },
  field: { marginBottom: 14 },
  fieldGap: { marginBottom: 22 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: fontSize.sectionTitle, marginBottom: 10 },
  sectionSpacer: { marginTop: 4 },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    padding: 12,
    paddingHorizontal: 14,
  },
  codeText: {},
  codeKicker: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 2 },
  codeValue: { fontFamily: fonts.bold, fontSize: fontSize.sectionTitle, letterSpacing: 1.5 },
  copyBtn: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 14 },
  copyBtnLabel: { fontFamily: fonts.semibold, fontSize: fontSize.small },
  codeHint: { fontSize: fontSize.tiny, marginTop: 6, marginBottom: 20 },
  travelerList: { borderWidth: 1, marginBottom: 10 },
  tripRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingHorizontal: 12 },
  tripRowText: { flex: 1 },
  addTripBtn: { marginBottom: 24 },
  travelerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingHorizontal: 12 },
  travelerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  travelerName: { fontFamily: fonts.semibold, fontSize: fontSize.body },
  removeLabel: { fontSize: fontSize.tiny },
  addTravelerRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  addTravelerInput: { flex: 1, minHeight: 36 },
  addBtn: { paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  addBtnLabel: { fontFamily: fonts.bold, fontSize: fontSize.small },
  budgetList: { gap: 10, marginBottom: 8 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  budgetLabel: { fontFamily: fonts.semibold, fontSize: fontSize.body, flex: 1 },
  budgetInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, paddingHorizontal: 8 },
  dollar: { fontSize: fontSize.small },
  budgetInput: { width: 70, minHeight: 32, borderWidth: 0, paddingHorizontal: 0, paddingVertical: 6, backgroundColor: 'transparent' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 2, marginBottom: 24 },
  totalLabel: { fontSize: fontSize.small },
  totalValue: { fontFamily: fonts.semibold, fontSize: fontSize.small },
  rateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rateRowGap: { marginTop: 10 },
  rateLabel: { fontFamily: fonts.semibold, fontSize: fontSize.body },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, marginBottom: 24, gap: 10 },
  toggleLabel: { fontSize: fontSize.body, flex: 1 },
  dataBtn: { borderWidth: 1, paddingVertical: 11, paddingHorizontal: 14, marginBottom: 8 },
  dataBtnDanger: { marginBottom: 0 },
  dataBtnLabel: { fontSize: fontSize.body },
});

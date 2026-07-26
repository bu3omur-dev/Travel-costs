import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { BackRow } from '../components/BackRow';
import { FieldLabel, TextField } from '../components/FormField';
import { ScreenContainer } from '../components/ScreenContainer';
import { Toggle } from '../components/Toggle';
import { TopBar } from '../components/TopBar';
import { CATEGORIES, DEFAULT_TRIP_ID } from '../data/seed';
import { RootStackParamList } from '../navigation/types';
import { useTrip } from '../state/TripContext';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';
import { usd } from '../utils/format';

export function SettingsScreen() {
  const c = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    state,
    trips,
    activeTripId,
    setTripName,
    setTripDates,
    addTraveler,
    removeTraveler,
    setCategoryBudget,
    resetSettled,
    restoreDefaults,
    setEurRate,
    setGbpRate,
    setKwdRate,
    setShowConversions,
    addTrip,
    deleteTrip,
    switchTrip,
  } = useTrip();
  const [newTravelerName, setNewTravelerName] = useState('');
  const [eurRateText, setEurRateText] = useState(String(state.eurRate));
  const [gbpRateText, setGbpRateText] = useState(String(state.gbpRate));
  const [kwdRateText, setKwdRateText] = useState(String(state.kwdRate));

  useEffect(() => {
    setEurRateText(String(state.eurRate));
  }, [state.eurRate]);
  useEffect(() => {
    setGbpRateText(String(state.gbpRate));
  }, [state.gbpRate]);
  useEffect(() => {
    setKwdRateText(String(state.kwdRate));
  }, [state.kwdRate]);

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

  function confirmDeleteTrip(id: string, name: string) {
    Alert.alert(
      `Delete "${name || 'Untitled trip'}"?`,
      'This permanently removes the trip and all of its expenses. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTrip(id) },
      ]
    );
  }

  const isDefaultTrip = activeTripId === DEFAULT_TRIP_ID;

  function confirmRestoreDefaults() {
    Alert.alert(
      isDefaultTrip ? 'Restore default trip data?' : 'Reset this trip?',
      isDefaultTrip
        ? 'This replaces travelers, expenses, budgets and settlement status with the original demo trip. This cannot be undone.'
        : 'This clears all expenses, budgets and settlement status for this trip. Travelers are kept. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isDefaultTrip ? 'Restore' : 'Reset',
          style: 'destructive',
          onPress: () => restoreDefaults(),
        },
      ]
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <TopBar onOpenSettings={() => navigation.navigate('Settings')} />
      <ScreenContainer contentBottomPadding={28}>
        <BackRow onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: c.text }]}>Trip settings</Text>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Your trips</Text>
        <View style={[styles.travelerList, { borderColor: c.divider }]}>
          {trips.map((trip, i) => {
            const active = trip.id === activeTripId;
            return (
              <View
                key={trip.id}
                style={[
                  styles.tripRow,
                  i < trips.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.divider },
                  active && { backgroundColor: c.accentTint },
                ]}
              >
                <Pressable style={styles.tripRowText} onPress={() => switchTrip(trip.id)} hitSlop={8}>
                  <Text style={[styles.travelerName, { color: active ? c.accentText : c.text }]}>
                    {trip.tripName || 'Untitled trip'}
                  </Text>
                  {trip.tripDates ? (
                    <Text style={[styles.tripDates, { color: c.neutral700 }]}>{trip.tripDates}</Text>
                  ) : null}
                </Pressable>
                {trips.length > 1 ? (
                  <Pressable onPress={() => confirmDeleteTrip(trip.id, trip.tripName)} hitSlop={8}>
                    <Text style={[styles.removeLabel, { color: c.accentText }]}>Delete</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>
        <Pressable onPress={addTrip} style={[styles.dataBtn, styles.addTripBtn, { borderColor: c.accent }]}>
          <Text style={[styles.dataBtnLabel, { color: c.accentText }]}>+ Add new trip</Text>
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
            const canRemove = t.id !== 'you' && !payerIds.has(t.id) && state.travelers.length > 1;
            return (
              <View
                key={t.id}
                style={[
                  styles.travelerRow,
                  i < state.travelers.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.divider },
                ]}
              >
                <View style={styles.travelerLeft}>
                  <Avatar initials={t.initials} isYou={t.id === 'you'} size={26} />
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
        <Pressable onPress={confirmRestoreDefaults} style={[styles.dataBtn, styles.dataBtnDanger, { borderColor: c.accent }]}>
          <Text style={[styles.dataBtnLabel, { color: c.accentText }]}>
            {isDefaultTrip ? 'Restore default trip data' : 'Reset this trip'}
          </Text>
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
  travelerList: { borderWidth: 1, marginBottom: 10 },
  tripRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingHorizontal: 12 },
  tripRowText: { flex: 1 },
  tripDates: { fontSize: fontSize.tiny, marginTop: 2 },
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

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES } from '../data/seed';
import { CurrencyCode } from '../data/types';
import { navigationRef } from '../navigation/navigationRef';
import { useTrip } from '../state/TripContext';
import { useUi } from '../state/UiContext';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';
import { native } from '../utils/format';
import { Chip } from './Chip';
import { CloseIcon } from './icons';
import { FieldLabel, TextField } from './FormField';
import { Sheet } from './Sheet';

const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP'];

export function AddExpenseSheet() {
  const c = useColors();
  const { showAddSheet, closeAdd, setExpensesFilter } = useUi();
  const { state, addExpense } = useTrip();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('EUR');
  const [category, setCategory] = useState('food');
  const [payerId, setPayerId] = useState('you');
  const [participantIds, setParticipantIds] = useState<string[]>(state.travelers.map((t) => t.id));

  useEffect(() => {
    if (showAddSheet) {
      setDescription('');
      setAmount('');
      setCurrency('EUR');
      setCategory('food');
      setPayerId('you');
      setParticipantIds(state.travelers.map((t) => t.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddSheet]);

  const amountNum = parseFloat(amount) || 0;
  const canSubmit = description.trim().length > 0 && amountNum > 0 && participantIds.length > 0;

  function toggleParticipant(id: string) {
    setParticipantIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function handleSubmit() {
    if (!canSubmit) return;
    addExpense({
      description: description.trim(),
      category,
      amount: amountNum,
      currency,
      payerId,
      participantIds,
    });
    setExpensesFilter('all');
    closeAdd();
    if (navigationRef.isReady()) {
      navigationRef.navigate('Tabs', { screen: 'Expenses' });
    }
  }

  const perPersonPreview = participantIds.length
    ? `≈ ${native(amountNum / participantIds.length, currency)} each · ${participantIds.length} people`
    : 'Select at least one traveler';

  return (
    <Sheet visible={showAddSheet} onClose={closeAdd} maxHeightPct={88}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: c.text }]}>Add expense</Text>
        <Pressable onPress={closeAdd} style={[styles.closeBtn, { borderColor: c.divider }]} hitSlop={8}>
          <CloseIcon color={c.text} />
        </Pressable>
      </View>

      <View style={styles.field}>
        <FieldLabel>Description</FieldLabel>
        <TextField value={description} onChangeText={setDescription} placeholder="e.g. Dinner at Taberna" />
      </View>

      <View style={styles.row}>
        <View style={styles.flexField}>
          <FieldLabel>Amount</FieldLabel>
          <TextField value={amount} onChangeText={setAmount} placeholder="0.00" inputMode="decimal" />
        </View>
        <View>
          <FieldLabel>Currency</FieldLabel>
          <View style={[styles.currencyRow, { borderColor: c.divider }]}>
            {CURRENCIES.map((code, i) => {
              const active = currency === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => setCurrency(code)}
                  style={[
                    styles.currencyChip,
                    i > 0 && { borderLeftWidth: 1, borderLeftColor: c.divider },
                    { backgroundColor: active ? c.text : 'transparent' },
                  ]}
                >
                  <Text style={[styles.currencyChipLabel, { color: active ? c.bg : c.text }]}>{code}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.field}>
        <FieldLabel>Category</FieldLabel>
        <View style={styles.chipWrap}>
          {CATEGORIES.map((cat) => (
            <Chip key={cat.id} label={cat.label} active={category === cat.id} onPress={() => setCategory(cat.id)} />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <FieldLabel>Paid by</FieldLabel>
        <View style={styles.chipWrap}>
          {state.travelers.map((t) => (
            <Chip key={t.id} label={t.name} active={payerId === t.id} onPress={() => setPayerId(t.id)} />
          ))}
        </View>
      </View>

      <View style={styles.fieldLast}>
        <FieldLabel>Split between</FieldLabel>
        <View style={styles.chipWrap}>
          {state.travelers.map((t) => {
            const active = participantIds.includes(t.id);
            return (
              <Pressable
                key={t.id}
                onPress={() => toggleParticipant(t.id)}
                style={[
                  styles.participantChip,
                  { borderColor: active ? c.text : c.divider, backgroundColor: active ? c.text : 'transparent' },
                ]}
              >
                <Text style={[styles.participantChipLabel, { color: active ? c.bg : c.text }]}>{t.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[styles.preview, { color: c.neutral600 }]}>{perPersonPreview}</Text>
      </View>

      <Pressable
        onPress={handleSubmit}
        style={[styles.submitBtn, { backgroundColor: canSubmit ? c.accent : c.neutral700 }]}
      >
        <Text style={[styles.submitLabel, { color: c.bg }]}>Save expense</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontFamily: fonts.bold, fontSize: fontSize.sheetTitle },
  closeBtn: { width: 30, height: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  field: { marginBottom: 14 },
  fieldLast: { marginBottom: 18 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  flexField: { flex: 1 },
  currencyRow: { flexDirection: 'row', borderWidth: 1, height: 38 },
  currencyChip: { paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  currencyChipLabel: { fontFamily: fonts.semibold, fontSize: fontSize.small },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  participantChip: { paddingHorizontal: 11, paddingVertical: 6, borderWidth: 1 },
  participantChipLabel: { fontSize: 11.5 },
  preview: { fontSize: fontSize.tiny, marginTop: 6 },
  submitBtn: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'flex-start' },
  submitLabel: { fontFamily: fonts.bold, fontSize: fontSize.input },
});

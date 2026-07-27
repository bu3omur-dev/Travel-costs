import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { BackRow } from '../components/BackRow';
import { FieldLabel, TextField } from '../components/FormField';
import { Trip } from '../data/types';
import { useTrip } from '../state/TripContext';
import { useColors } from '../theme/ThemeContext';
import { fonts, fontSize } from '../theme/typography';

type Mode = 'landing' | 'joinPreview';

export function TripPickerScreen({ onCancel }: { onCancel?: () => void }) {
  const c = useColors();
  const { createTripAndJoin, previewTrip, joinExistingTraveler, joinAsNewTraveler } = useTrip();

  const [mode, setMode] = useState<Mode>('landing');

  const [yourName, setYourName] = useState('');
  const [tripName, setTripName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [finding, setFinding] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState('');
  const [previewTripData, setPreviewTripData] = useState<Trip | null>(null);
  const [newName, setNewName] = useState('');
  const [claiming, setClaiming] = useState(false);

  const canCreate = yourName.trim().length > 0 && tripName.trim().length > 0 && !creating;
  const canFind = code.trim().length > 0 && !finding;

  async function handleCreate() {
    if (!canCreate) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createTripAndJoin(tripName, yourName);
      // Success: TripContext's activeTripId now points at the new trip, so
      // the app-level gate swaps away from this screen automatically.
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not create the trip. Try again.');
    } finally {
      setCreating(false);
    }
  }

  async function handleFind() {
    if (!canFind) return;
    setFinding(true);
    setJoinError(null);
    try {
      const found = await previewTrip(code);
      if (!found) {
        setJoinError("No trip found with that code — double-check it and try again.");
        return;
      }
      setPreviewCode(code.trim().toUpperCase());
      setPreviewTripData(found);
      setMode('joinPreview');
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setFinding(false);
    }
  }

  function handleClaimExisting(travelerId: string) {
    joinExistingTraveler(previewCode, travelerId);
  }

  async function handleAddSelfAndJoin() {
    if (!previewTripData || !newName.trim()) return;
    setClaiming(true);
    try {
      await joinAsNewTraveler(previewCode, previewTripData.travelers, newName);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not join the trip. Try again.');
    } finally {
      setClaiming(false);
    }
  }

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      <View style={styles.content}>
        {onCancel ? (
          <BackRow onPress={onCancel} />
        ) : (
          <Text style={[styles.kicker, { color: c.accent }]}>Trip expense tracker</Text>
        )}

        {mode === 'landing' ? (
          <>
            <Text style={[styles.title, { color: c.text }]}>Get started</Text>

            <Text style={[styles.sectionTitle, { color: c.text }]}>Create a new trip</Text>
            <View style={styles.field}>
              <FieldLabel>Your name</FieldLabel>
              <TextField value={yourName} onChangeText={setYourName} placeholder="e.g. Jordan" />
            </View>
            <View style={styles.field}>
              <FieldLabel>Trip name</FieldLabel>
              <TextField value={tripName} onChangeText={setTripName} placeholder="e.g. Lisbon & Porto Crew" />
            </View>
            <Pressable
              onPress={handleCreate}
              disabled={!canCreate}
              style={[styles.primaryBtn, { backgroundColor: canCreate ? c.accent : c.neutral700 }]}
            >
              {creating ? (
                <ActivityIndicator color={c.bg} />
              ) : (
                <Text style={[styles.primaryBtnLabel, { color: c.bg }]}>Create trip</Text>
              )}
            </Pressable>
            {createError ? <Text style={[styles.errorText, { color: c.accentText }]}>{createError}</Text> : null}

            <View style={[styles.divider, { borderColor: c.divider }]}>
              <Text style={[styles.dividerLabel, { color: c.neutral700, backgroundColor: c.bg }]}>or</Text>
            </View>

            <Text style={[styles.sectionTitle, { color: c.text }]}>Join a trip</Text>
            <View style={styles.field}>
              <FieldLabel>Trip code</FieldLabel>
              <TextField
                value={code}
                onChangeText={(v) => setCode(v.toUpperCase())}
                placeholder="e.g. 7XQK2M"
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
            <Pressable
              onPress={handleFind}
              disabled={!canFind}
              style={[styles.secondaryBtn, { borderColor: canFind ? c.text : c.divider }]}
            >
              {finding ? (
                <ActivityIndicator color={c.text} />
              ) : (
                <Text style={[styles.secondaryBtnLabel, { color: c.text }]}>Find trip</Text>
              )}
            </Pressable>
            {joinError ? <Text style={[styles.errorText, { color: c.accentText }]}>{joinError}</Text> : null}
          </>
        ) : (
          <>
            <Pressable onPress={() => setMode('landing')} hitSlop={8} style={styles.backLink}>
              <Text style={[styles.backLinkLabel, { color: c.accentText }]}>← Back</Text>
            </Pressable>
            <Text style={[styles.title, { color: c.text }]}>{previewTripData?.tripName || 'Trip'}</Text>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Which one are you?</Text>
            <View style={[styles.travelerList, { borderColor: c.divider }]}>
              {(previewTripData?.travelers ?? []).map((t, i) => (
                <Pressable
                  key={t.id}
                  onPress={() => handleClaimExisting(t.id)}
                  style={[
                    styles.travelerRow,
                    i < (previewTripData?.travelers.length ?? 0) - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: c.divider,
                    },
                  ]}
                >
                  <View style={styles.travelerLeft}>
                    <Avatar initials={t.initials} isYou={false} size={26} />
                    <Text style={[styles.travelerName, { color: c.text }]}>{t.name}</Text>
                  </View>
                  <Text style={[styles.claimLabel, { color: c.accentText }]}>That's me</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionTitle, styles.sectionSpacer, { color: c.text }]}>Not listed?</Text>
            <View style={styles.field}>
              <FieldLabel>Your name</FieldLabel>
              <TextField value={newName} onChangeText={setNewName} placeholder="e.g. Jordan" />
            </View>
            <Pressable
              onPress={handleAddSelfAndJoin}
              disabled={!newName.trim() || claiming}
              style={[styles.primaryBtn, { backgroundColor: newName.trim() ? c.accent : c.neutral700 }]}
            >
              {claiming ? (
                <ActivityIndicator color={c.bg} />
              ) : (
                <Text style={[styles.primaryBtnLabel, { color: c.bg }]}>Add me & join trip</Text>
              )}
            </Pressable>
            {joinError ? <Text style={[styles.errorText, { color: c.accentText }]}>{joinError}</Text> : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, padding: 20, paddingTop: 74, justifyContent: 'flex-start' },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.tiny,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: { fontFamily: fonts.bold, fontSize: fontSize.tripName, marginBottom: 20 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: fontSize.sectionTitle, marginBottom: 10 },
  sectionSpacer: { marginTop: 4 },
  field: { marginBottom: 14 },
  primaryBtn: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', marginBottom: 6 },
  primaryBtnLabel: { fontFamily: fonts.bold, fontSize: fontSize.input },
  secondaryBtn: { paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1, marginBottom: 6 },
  secondaryBtnLabel: { fontFamily: fonts.bold, fontSize: fontSize.input },
  errorText: { fontSize: fontSize.small, marginTop: 6, marginBottom: 8 },
  divider: { borderTopWidth: 1, marginVertical: 24, alignItems: 'center' },
  dividerLabel: { position: 'absolute', top: -9, paddingHorizontal: 10, fontSize: fontSize.tiny },
  backLink: { marginBottom: 12 },
  backLinkLabel: { fontSize: fontSize.small },
  travelerList: { borderWidth: 1, marginBottom: 8 },
  travelerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingHorizontal: 12 },
  travelerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  travelerName: { fontFamily: fonts.semibold, fontSize: fontSize.body },
  claimLabel: { fontSize: fontSize.tiny },
});

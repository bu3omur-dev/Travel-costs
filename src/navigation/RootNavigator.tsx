import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RecapScreen } from '../screens/RecapScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TabsScreen } from './TabsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Recap" component={RecapScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}

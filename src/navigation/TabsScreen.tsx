import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fab } from '../components/Fab';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SplitScreen } from '../screens/SplitScreen';
import { useUi } from '../state/UiContext';
import { CustomTabBar } from './CustomTabBar';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

// Base content height of CustomTabBar (paddingTop 10 + icon 18 + gap 4 +
// label line ~12 + paddingBottom 6 + 2px top border) — the FAB floats a
// fixed 16px above it, then clears the device's own safe-area inset.
const TAB_BAR_BASE_HEIGHT = 52;
const FAB_GAP = 16;

export function TabsScreen() {
  const insets = useSafeAreaInsets();
  const { openAdd } = useUi();

  const fabBottom = TAB_BAR_BASE_HEIGHT + Math.max(10, insets.bottom) + FAB_GAP;

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Expenses" component={ExpensesScreen} />
        <Tab.Screen name="Split" component={SplitScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
      </Tab.Navigator>
      <Fab onPress={openAdd} bottom={fabBottom} />
    </View>
  );
}

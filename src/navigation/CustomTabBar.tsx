import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabDashboardIcon, TabExpensesIcon, TabReportsIcon, TabSplitIcon } from '../components/icons';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/typography';

const TAB_CONFIG: Record<string, { label: string; Icon: React.ComponentType<{ color: string; size?: number }> }> = {
  Dashboard: { label: 'Trip', Icon: TabDashboardIcon },
  Expenses: { label: 'Expenses', Icon: TabExpensesIcon },
  Split: { label: 'Split', Icon: TabSplitIcon },
  Reports: { label: 'Reports', Icon: TabReportsIcon },
};

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { borderTopColor: c.divider, backgroundColor: c.bg, paddingBottom: Math.max(10, insets.bottom) },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const config = TAB_CONFIG[route.name];
        if (!config) return null;
        const { label, Icon } = config;
        const color = focused ? c.accentText : c.neutral700;

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={[styles.tab, { borderTopColor: focused ? c.accent : 'transparent' }]}
          >
            <Icon color={color} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: 2,
    marginTop: -2,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 10,
  },
});

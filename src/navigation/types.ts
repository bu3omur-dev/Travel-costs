import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  Expenses: undefined;
  Split: undefined;
  Reports: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Settings: undefined;
  Recap: undefined;
};

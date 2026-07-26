import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

// Components that live outside any Screen (the globally-mounted
// AddExpenseSheet/ShareSheet modals) can't use useNavigation(), since that
// hook only resolves a NavigationContext supplied by an enclosing Screen.
// This ref lets them trigger navigation directly once the container mounts.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

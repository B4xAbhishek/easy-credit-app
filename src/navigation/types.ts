import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabsParamList = {
  Home: undefined;
  Orders: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  OrderDetail: { productId: string };
  Payment: { productId?: string; payableAmountRupees: number };
  ContactUs: undefined;
  LegalDocument: { type: 'terms' | 'privacy' };
};

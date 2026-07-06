import React from 'react';
import { Text } from 'react-native';
import { S } from '../theme/styles';

type Props = {
  symbol: string;
  focused: boolean;
};

function TabIcon({ symbol, focused }: Props) {
  return (
    <Text style={focused ? S.tabIconActive : S.tabIconInactive}>{symbol}</Text>
  );
}

export const homeTabIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon symbol="⌂" focused={focused} />
);

export const ordersTabIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon symbol="☰" focused={focused} />
);

export const accountTabIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon symbol="◉" focused={focused} />
);

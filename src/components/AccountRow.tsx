import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { S } from '../theme/styles';

type Props = {
  iconName: string;
  iconBg: string;
  label: string;
  onPress: () => void;
};

export function AccountRow({ iconName, iconBg, label, onPress }: Props) {
  return (
    <Pressable style={S.accountRow} onPress={onPress}>
      <View style={[S.accountRowIcon, styles.iconBg(iconBg)]}>
        <MaterialCommunityIcons name={iconName} size={20} color="#FFFFFF" />
      </View>
      <Text style={S.accountRowLabel}>{label}</Text>
      <Text style={S.accountRowArrow}>›</Text>
    </Pressable>
  );
}

const styles = {
  iconBg: (bg: string) => StyleSheet.flatten({ backgroundColor: bg }),
};

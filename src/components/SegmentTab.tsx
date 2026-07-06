import React from 'react';
import { Pressable, Text } from 'react-native';
import { S } from '../theme/styles';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function SegmentTab({ label, active, onPress }: Props) {
  return (
    <Pressable style={[S.segBtn, active && S.segBtnActive]} onPress={onPress}>
      <Text style={[S.segBtnText, active && S.segBtnTextActive]}>{label}</Text>
    </Pressable>
  );
}

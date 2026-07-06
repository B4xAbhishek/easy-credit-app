import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Text, View } from 'react-native';
import { appLogo } from '../assets';
import { S } from '../theme/styles';

function LoadingSpinner() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[S.loadingSpinnerWrap, { transform: [{ rotate }] }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      importantForAccessibility="yes">
      <View style={S.loadingSpinnerRing} />
    </Animated.View>
  );
}

export function LoadingScreen() {
  return (
    <View style={S.loadingScreen}>
      <Image source={appLogo} style={S.loadingLogoImage} resizeMode="contain" />
      <LoadingSpinner />
      <Text style={S.loadingText}>Starting Easy Credit…</Text>
    </View>
  );
}

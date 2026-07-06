import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { toE164 } from '../utils';
import { appLogo } from '../assets';
import { S } from '../theme/styles';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function isOtpClientIdentifierError(err: unknown): boolean {
  if (!(err instanceof Error)) {
    return false;
  }
  const message = err.message.toLowerCase();
  const code = (err as { code?: string }).code;
  return (
    code === 'auth/missing-client-identifier' ||
    code === 'auth/invalid-app-credential' ||
    message.includes('missing-client-identifier') ||
    message.includes('play integrity') ||
    message.includes('app verification') ||
    message.includes('recaptcha') ||
    message.includes('reCAPTCHA')
  );
}

const OTP_SETUP_HELP =
  'Add this build’s SHA-1 and SHA-256 in Firebase Console → Project settings → Your Android app. ' +
  'For Play Store installs, also add the App signing key certificate from Play Console. ' +
  'Or use "Login with code" with the admin 6-digit code.';

export function LoginScreen({ navigation }: Props) {
  const { signInWithFallbackCode, signInWithFirebaseToken } = useAuth();
  const insets = useSafeAreaInsets();
  const [phoneDigits, setPhoneDigits] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [confirmation, setConfirmation] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigateToHome = useCallback(() => {
    navigation.replace('MainTabs', { screen: 'Home' });
  }, [navigation]);

  const onLoginWithCode = useCallback(async () => {
    const digits = phoneDigits.replace(/\D/g, '').slice(0, 10);
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    if (adminCode.trim().length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await signInWithFallbackCode(toE164(digits), adminCode.trim());
      navigateToHome();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  }, [adminCode, navigateToHome, phoneDigits, signInWithFallbackCode]);

  const onGetOtp = useCallback(async () => {
    const digits = phoneDigits.replace(/\D/g, '').slice(0, 10);
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit phone number first.');
      return;
    }

    try {
      setIsSendingOtp(true);
      setError(null);
      // Only force reCAPTCHA in dev/emulator; production should use Play Integrity / SMS
      // once SHA-1/SHA-256 are registered in Firebase for this keystore.
      auth().settings.forceRecaptchaFlowForTesting = __DEV__;
      const nextConfirmation = await auth().signInWithPhoneNumber(toE164(digits));
      setConfirmation(nextConfirmation);
      setOtpCode('');
      Alert.alert('OTP sent', 'Enter the 6-digit OTP sent to your phone.');
    } catch (err) {
      setConfirmation(null);
      if (isOtpClientIdentifierError(err)) {
        if (__DEV__) {
          console.warn('[Login] Phone auth failed:', err);
        }
        setError(
          `OTP could not start for this app signing key. ${OTP_SETUP_HELP}`,
        );
        return;
      }
      setError(
        err instanceof Error ? err.message : 'Could not send OTP. Please try again.',
      );
    } finally {
      setIsSendingOtp(false);
    }
  }, [phoneDigits]);

  const onVerifyOtp = useCallback(async () => {
    const digits = phoneDigits.replace(/\D/g, '').slice(0, 10);
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    if (!confirmation) {
      setError('Tap Get OTP first.');
      return;
    }
    if (otpCode.trim().length !== 6) {
      setError('Enter the 6-digit OTP.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const credential = await confirmation.confirm(otpCode.trim());
      const idToken = await credential.user.getIdToken();
      const verifiedPhone = credential.user.phoneNumber ?? toE164(digits);
      await signInWithFirebaseToken(verifiedPhone, idToken);
      navigateToHome();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmation, navigateToHome, otpCode, phoneDigits, signInWithFirebaseToken]);

  const onLoginRegister = useCallback(() => {
    if (confirmation) {
      onVerifyOtp();
      return;
    }
    if (adminCode.trim().length === 6) {
      onLoginWithCode();
    } else {
      onGetOtp();
    }
  }, [adminCode, confirmation, onGetOtp, onLoginWithCode, onVerifyOtp]);

  return (
    <View style={S.loginRoot}>
      <StatusBar barStyle="light-content" backgroundColor="#5B5CF6" />

      <View style={[S.loginHero, { paddingTop: insets.top + 20 }]}>
        <View style={S.loginLogoCard}>
          <Image source={appLogo} style={S.loginLogoImage} resizeMode="contain" />
          <Text style={S.loginLogoTitle}>Easy Credit</Text>
        </View>
        <Text style={S.loginTagline}>
          Your instant loan solution. Loans that keep you moving.
        </Text>
      </View>

      <ScrollView
        style={S.loginSheet}
        contentContainerStyle={[
          S.loginSheetContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled">
        <Text style={S.loginFieldLabel}>
          Please enter your mobile number{' '}
          <Text style={S.loginMandatory}>{'(mandatory)'}</Text>
        </Text>

        <View style={S.loginInputRow}>
          <Text style={S.loginInputIcon}>◲</Text>
          <Text style={S.loginPrefix}>+91</Text>
          <TextInput
            value={phoneDigits}
            onChangeText={v => {
              setPhoneDigits(v.replace(/\D/g, '').slice(0, 10));
              setError(null);
            }}
            keyboardType="number-pad"
            placeholder="Enter phone number"
            placeholderTextColor="#9CA3AF"
            style={S.loginTextInput}
          />
        </View>

        <Text style={S.loginHelperText}>
          Phone number is mandatory and required for OTP and Login / Register.
        </Text>

        <View style={S.loginInlineRow}>
          <View style={[S.loginInputRow, S.flex1]}>
            <Text style={S.loginInputIcon}>⬡</Text>
            <TextInput
              value={otpCode}
              onChangeText={v => {
                setOtpCode(v.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              placeholder="Enter OTP"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              style={S.loginTextInput}
              editable={Boolean(confirmation)}
            />
          </View>
          <Pressable
            style={[S.loginGetOtpBtn, isSendingOtp && S.opacity06]}
            onPress={onGetOtp}
            disabled={isSendingOtp || isSubmitting}>
            <Text style={S.loginGetOtpText}>
              {isSendingOtp ? 'Sending…' : confirmation ? 'Resend OTP' : 'Get OTP'}
            </Text>
          </Pressable>
        </View>

        <View style={[S.loginInlineRow, S.mt10]}>
          <View style={[S.loginInputRow, S.flex1]}>
            <Text style={S.loginInputIcon}>⬡</Text>
            <TextInput
              value={adminCode}
              onChangeText={v => {
                setAdminCode(v.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              placeholder="Admin code (6 digits)"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              secureTextEntry
              style={S.loginTextInput}
            />
          </View>
          <Pressable
            style={[S.loginCodeBtn, isSubmitting && S.opacity06]}
            onPress={onLoginWithCode}
            disabled={isSubmitting}>
            <Text style={S.loginCodeBtnText}>
              {isSubmitting ? '…' : 'Login with code'}
            </Text>
          </Pressable>
        </View>

        <Text style={S.loginHelperText}>
          If OTP is not arriving, ask admin for the latest rotating 6-digit code.
        </Text>

        {error ? <Text style={S.errorText}>{error}</Text> : null}

        <Pressable
          style={[S.loginPrimaryBtn, isSubmitting && S.opacity07]}
          onPress={onLoginRegister}
          disabled={isSubmitting || isSendingOtp}>
          <Text style={S.loginPrimaryBtnText}>
            {isSubmitting
              ? 'Signing in…'
              : confirmation
                ? 'Verify OTP'
                : 'Login / Register'}
          </Text>
        </Pressable>

        <Text style={S.loginTermsText}>
          By continuing you agree to our{' '}
          <Text
            style={S.loginTermsLink}
            onPress={() => navigation.navigate('LegalDocument', { type: 'terms' })}>
            Terms & Conditions
          </Text>{' '}
          and{' '}
          <Text
            style={S.loginTermsLink}
            onPress={() => navigation.navigate('LegalDocument', { type: 'privacy' })}>
            Privacy Policy
          </Text>
          . SMS is sent by Firebase; carrier charges may apply.
        </Text>
      </ScrollView>
    </View>
  );
}

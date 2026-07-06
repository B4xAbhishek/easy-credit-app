import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Clipboard,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { mobileFetch } from '../api/client';
import { buildUpiLink, formatInr } from '../utils';
import { PAYTM_ANDROID_PACKAGE, PHONEPE_ANDROID_PACKAGE } from '../constants';
import { paytmLogo, phonepeLogo, utrHowToFind } from '../assets';
import { S } from '../theme/styles';
import { LoadingScreen } from '../components/LoadingScreen';
import type { PaymentConfigResponse } from '../types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;
const INITIAL_SECONDS = 5 * 60 + 10;

function formatTime(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function PaymentScreen({ route, navigation }: Props) {
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigResponse | null>(null);
  const [utr, setUtr] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [qrVisible, setQrVisible] = useState(false);
  const [copyPressed, setCopyPressed] = useState(false);
  const [utrHelpOpen, setUtrHelpOpen] = useState(false);
  const [submitSuccessOpen, setSubmitSuccessOpen] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const upiId = paymentConfig?.paymentReceiveUpi?.trim() ?? '';
  const hasUpi = upiId.length > 0;
  const qrSrc = useMemo(() => {
    const payload = hasUpi
      ? buildUpiLink(upiId, route.params.payableAmountRupees)
      : 'easycredit:pay:ref-demo';
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
      payload,
    )}`;
  }, [hasUpi, route.params.payableAmountRupees, upiId]);

  useEffect(() => {
    async function load() {
      if (!session) {
        return;
      }
      try {
        const response = await mobileFetch<PaymentConfigResponse>(
          '/api/mobile/payment-config',
          { token: session.token },
        );
        setPaymentConfig(response);
      } catch (err) {
        if (err instanceof Error && err.message === 'unauthorized') {
          await signOut();
          return;
        }
        Alert.alert(
          'Payment',
          err instanceof Error ? err.message : 'Failed to load payment config.',
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session, signOut]);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(current => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const openUpiApp = useCallback(
    async (packageName?: string) => {
      if (!upiId) {
        Alert.alert('Payment', 'Repayment UPI is not configured yet.');
        return;
      }
      try {
        await Linking.openURL(
          buildUpiLink(upiId, route.params.payableAmountRupees, packageName),
        );
      } catch {
        Alert.alert('Payment', 'Could not open the selected UPI app.');
      }
    },
    [route.params.payableAmountRupees, upiId],
  );

  const submitUtr = useCallback(async () => {
    if (!session) {
      return;
    }
    if (utr.length === 0) {
      setRefError('This field is required.');
      return;
    }
    if (utr.length !== 12) {
      setRefError('Enter all 12 digits of your Ref No.');
      return;
    }
    try {
      setRefError(null);
      setSubmitting(true);
      await mobileFetch('/api/mobile/payments/submissions', {
        method: 'POST',
        token: session.token,
        body: {
          productId: route.params.productId,
          payableAmountRupees: route.params.payableAmountRupees,
          utr,
        },
      });
      setSubmitSuccessOpen(true);
    } catch (err) {
      Alert.alert(
        'Payment',
        err instanceof Error ? err.message : 'Could not submit payment.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [route.params.payableAmountRupees, route.params.productId, session, utr]);

  const showUpiId = useCallback(() => {
    if (!hasUpi) {
      return;
    }
    setCopyPressed(true);
    Clipboard.setString(upiId);
    Alert.alert('Copied!', 'UPI ID copied to clipboard.');
    setTimeout(() => setCopyPressed(false), 2000);
  }, [hasUpi, upiId]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={S.paymentRoot}>
      <StatusBar barStyle="dark-content" backgroundColor="#EBE4FB" />

      <SafeAreaView edges={['top']} style={S.paymentHeaderSafeArea}>
        <View style={S.paymentHeader}>
          <View style={S.paymentHeaderOrbRight} />
          <View style={S.paymentHeaderOrbLeft} />
          <View style={S.paymentHeaderRow}>
            <Pressable
              style={S.paymentBackBtn}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Back to previous screen">
              <Text style={S.paymentBackBtnText}>‹</Text>
            </Pressable>
            <Text style={S.paymentHeaderTitle}>Repayment</Text>
            <View style={S.w40} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[
          S.paymentScrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={S.paymentCard}>
          <Text style={S.paymentAmountIntro}>Amount Payable</Text>
          <View style={S.paymentAmountRow}>
            <View style={S.flex1}>
              <Text style={S.paymentAmountHero}>
                ₹{formatInr(route.params.payableAmountRupees)}
              </Text>
            </View>
            <View style={S.paymentDocBadge}>
              <Text style={S.paymentDocBadgeText}>▤</Text>
            </View>
          </View>

          <Text style={S.paymentTimer} accessibilityLiveRegion="polite">
            {formatTime(secondsLeft)}
          </Text>

          <View style={S.paymentQrSection}>
            <Text style={S.paymentQrTitle}>Use mobile scan code to pay</Text>
            <View style={S.paymentQrWrap}>
              <Image
                source={{ uri: qrSrc }}
                style={[S.paymentQrImage, !qrVisible && S.paymentQrImageHidden]}
                resizeMode="contain"
              />
              {!qrVisible ? (
                <View style={S.paymentQrOverlay}>
                  <Pressable style={S.paymentShowQrBtn} onPress={() => setQrVisible(true)}>
                    <Text style={S.paymentShowQrBtnText}>Show QR code</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>

          <View style={S.paymentMethodsSection}>
            <Text style={S.paymentMethodsHeading}>Choose a payment method to pay</Text>

            <Pressable
              style={[S.paymentMethodCard, !hasUpi && S.opacity06]}
              onPress={() => openUpiApp(PAYTM_ANDROID_PACKAGE)}
              disabled={!hasUpi}>
              <View style={S.paymentMethodIconWrap}>
                <Image source={paytmLogo} style={S.paymentMethodIcon} resizeMode="contain" />
              </View>
              <Text style={S.paymentMethodLabel}>Paytm</Text>
              <Text style={S.paymentMethodArrow}>›</Text>
            </Pressable>

            <Pressable
              style={[S.paymentMethodCard, !hasUpi && S.opacity06]}
              onPress={() => openUpiApp(PHONEPE_ANDROID_PACKAGE)}
              disabled={!hasUpi}>
              <View style={S.paymentMethodIconWrap}>
                <Image source={phonepeLogo} style={S.paymentMethodIcon} resizeMode="contain" />
              </View>
              <Text style={S.paymentMethodLabel}>PhonePe</Text>
              <Text style={S.paymentMethodArrow}>›</Text>
            </Pressable>

            <View style={S.paymentManualCard}>
              <Text style={S.paymentManualHeading}>Manual transfer</Text>

              <View style={S.mt10}>
                <Text style={S.paymentManualStep}>1. Manual transfer</Text>
                <View style={S.paymentManualCopyRow}>
                  <View style={S.paymentManualUpiBox}>
                    <Text style={S.paymentManualUpiText}>
                      {hasUpi ? upiId : 'UPI unavailable'}
                    </Text>
                  </View>
                  <Pressable
                    style={[S.paymentCopyBtn, !hasUpi && S.opacity06]}
                    onPress={showUpiId}
                    disabled={!hasUpi}>
                    <Text style={S.paymentCopyBtnText}>
                      {copyPressed ? 'Shown' : 'Copy'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={S.paymentManualDivider} />

              <Text style={S.paymentManualPrompt}>2. Need to enter your 12 Ref No (UTR)</Text>
              <Text style={S.paymentRefLabel}>Ref No.</Text>
              <TextInput
                value={utr}
                onChangeText={v => {
                  setUtr(v.replace(/\D/g, '').slice(0, 12));
                  setRefError(null);
                }}
                keyboardType="number-pad"
                placeholder="Ref No is required"
                placeholderTextColor="#9CA3AF"
                style={[S.paymentRefInput, refError ? S.paymentRefInputError : null]}
              />
              {refError ? <Text style={S.paymentRefError}>{refError}</Text> : null}
              <Text style={S.paymentManualHint}>
                Tip: open your UPI wallet, complete the transfer, and keep the reference
                number after payment.
              </Text>
              <Pressable
                style={S.paymentUtrHelpLinkWrap}
                onPress={() => setUtrHelpOpen(true)}>
                <Text style={S.paymentUtrHelpLink}>How to find UTR?</Text>
              </Pressable>
            </View>

            <Pressable
              style={[S.paymentSubmitBtn, submitting && S.opacity07]}
              onPress={submitUtr}
              disabled={submitting}>
              <Text style={S.paymentSubmitBtnText}>
                {submitting ? 'Submitting…' : 'Submit'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={submitSuccessOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSubmitSuccessOpen(false)}>
        <View style={S.paymentModalBackdrop}>
          <View style={S.paymentModalCard}>
            <View style={S.paymentModalHeader}>
              <Text style={S.paymentModalTitle}>Submit Success</Text>
              <Pressable
                style={S.paymentModalCloseBtn}
                onPress={() => setSubmitSuccessOpen(false)}>
                <Text style={S.paymentModalCloseBtnText}>×</Text>
              </Pressable>
            </View>
            <Text style={S.paymentModalBody}>
              We will confirm your payment shortly. Please wait a moment. If the
              payment has not been confirmed, please contact customer service in time.
            </Text>
            <View style={S.paymentModalActions}>
              <Pressable
                style={S.paymentModalSecondaryBtn}
                onPress={() => setSubmitSuccessOpen(false)}>
                <Text style={S.paymentModalSecondaryBtnText}>Resubmit</Text>
              </Pressable>
              <Pressable
                style={S.paymentModalPrimaryBtn}
                onPress={() => {
                  setSubmitSuccessOpen(false);
                  setUtr('');
                  navigation.navigate('MainTabs', { screen: 'Home' });
                }}>
                <Text style={S.paymentModalPrimaryBtnText}>Return to App</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={utrHelpOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setUtrHelpOpen(false)}>
        <View style={S.paymentModalBackdrop}>
          <View style={S.paymentImageModalCard}>
            <View style={S.paymentModalHeader}>
              <Text style={S.paymentImageModalTitle}>Where to find your UTR</Text>
              <Pressable
                style={S.paymentModalCloseBtn}
                onPress={() => setUtrHelpOpen(false)}>
                <Text style={S.paymentModalCloseBtnText}>×</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={S.paymentImageModalContent}>
              <Image source={utrHowToFind} style={S.paymentHelpImage} resizeMode="contain" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

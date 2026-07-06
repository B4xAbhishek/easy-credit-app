import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { mobileFetch } from '../api/client';
import { formatInr } from '../utils';
import { S } from '../theme/styles';
import { LoadingScreen } from '../components/LoadingScreen';
import type { OrderDetailResponse } from '../types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export function OrderDetailScreen({ route, navigation }: Props) {
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [detail, setDetail] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!session) {
        return;
      }
      try {
        const id = encodeURIComponent(route.params.productId);
        const response = await mobileFetch<OrderDetailResponse>(
          `/api/mobile/orders/${id}`,
          { token: session.token },
        );
        setDetail(response);
      } catch (err) {
        if (err instanceof Error && err.message === 'unauthorized') {
          await signOut();
          return;
        }
        const raw = err instanceof Error ? err.message : '';
        const friendly =
          raw === 'not_found'
            ? 'Loan not found for your account. Refresh the list and try again.'
            : raw || 'Failed to load order detail.';
        Alert.alert('Order details', friendly);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [route.params.productId, session, signOut]);

  if (loading || !detail) {
    return <LoadingScreen />;
  }

  return (
    <View style={S.lavenderRoot}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFFE" />

      {/* Header */}
      <View style={[S.detailHeader, { paddingTop: insets.top + 8, backgroundColor: '#F0EFFE' }]}>
        <Pressable style={S.backBtn} onPress={() => navigation.goBack()}>
          <Text style={S.backBtnText}>‹</Text>
        </Pressable>
        <Text style={S.detailHeaderTitle}>Order Details</Text>
        <View style={S.w40} />
      </View>

      <ScrollView
        contentContainerStyle={[
          S.detailContent,
          { paddingBottom: insets.bottom + 24 },
        ]}>

        {/* Clock icon */}
        <View style={S.detailIconCircle}>
          <Text style={S.detailIconText}>⏰</Text>
        </View>

        {/* Notice */}
        <Text style={S.detailNotice}>
          Making timely repayments not only maintains your financial health but
          also helps increase your borrowing limit. Recently there have been
          instances of individuals impersonating our company to collect debts. To
          protect your funds, please ensure you are transferring any money only
          through official Easy Credit channels—not to personal accounts.
        </Text>

        {/* Detail rows */}
        <View style={S.detailCard}>
          <View style={S.detailCardRow}>
            <Text style={S.detailCardRowLabel}>Loan Amount</Text>
            <Text style={S.detailCardRowValue}>
              {formatInr(detail.loanAmountRupees)}
            </Text>
          </View>
          <View style={S.detailCardDivider} />
          <View style={S.detailCardRow}>
            <Text style={S.detailCardRowLabel}>Unpaid Amount</Text>
            <Text style={S.detailCardRowValue}>
              {formatInr(detail.unpaidAmountRupees)}
            </Text>
          </View>
          <View style={S.detailCardDivider} />
          <View style={S.detailCardRow}>
            <Text style={S.detailCardRowLabel}>Interest Fee</Text>
            <Text style={S.detailCardRowValue}>
              {formatInr(detail.interestFeeRupees)}
            </Text>
          </View>
          <View style={S.detailCardDivider} />
          <View style={S.detailCardRow}>
            <Text style={S.detailCardRowLabel}>Due Date</Text>
            <Text style={S.detailCardRowValue}>{detail.dueDateDisplay}</Text>
          </View>
        </View>

        {/* Extension card */}
        <View style={S.extensionCard}>
          <View style={S.flex1}>
            <Text style={S.extensionTitle}>
              Is there a lot of repayment pressure? 🤔
            </Text>
            <Text style={S.extensionSub}>Try delaying the repayment now~~</Text>
          </View>
          <Pressable
            style={S.extensionBtn}
            onPress={() =>
              Alert.alert(
                'Extension',
                'Please contact support to request a repayment extension.',
              )
            }>
            <Text style={S.extensionBtnText}>Extended</Text>
          </Pressable>
        </View>

        {/* Repayment button */}
        <Pressable
          style={S.repaymentBtn}
          onPress={() =>
            navigation.navigate('Payment', {
              productId: detail.productId,
              payableAmountRupees: detail.unpaidAmountRupees,
            })
          }>
          <Text style={S.repaymentBtnText}>REPAYMENT</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

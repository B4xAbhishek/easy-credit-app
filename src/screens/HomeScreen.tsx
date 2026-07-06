import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { mobileFetch } from '../api/client';
import { getContactSettings } from '../api/contactSettings';
import { homeLogo } from '../assets';
import { formatInr, resolveOrderDetailId } from '../utils';
import { S } from '../theme/styles';
import { LoadingScreen } from '../components/LoadingScreen';
import type { HomeResponse } from '../types';
import type { RootStackParamList } from '../navigation/types';

export function HomeScreen() {
  const { session, signOut } = useAuth();
  const navigation =
    useNavigation<NativeStackScreenProps<RootStackParamList>['navigation']>();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<HomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) {
      return;
    }
    try {
      setError(null);
      const [response] = await Promise.all([
        mobileFetch<HomeResponse>('/api/mobile/home', {
          token: session.token,
        }),
        getContactSettings(session.token).catch(() => null),
      ]);
      setData(response);
    } catch (err) {
      if (err instanceof Error && err.message === 'unauthorized') {
        await signOut();
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load home.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [session, signOut]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={S.homeRoot}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F2FE" />

      <ScrollView
        contentContainerStyle={[
          S.homeContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor="#5B5CF6"
          />
        }>
        <View style={S.homeHeader}>
          <Text style={S.homeWelcome}>Welcome</Text>
          <View style={S.homeHeaderRow}>
            <View style={S.homeBrandWrap}>
              <Image source={homeLogo} style={S.homeBrandLogo} resizeMode="contain" />
              <Text style={S.homeBrandName}>Easy Credit</Text>
            </View>
            <Pressable style={S.homeBellBtn} accessibilityLabel="Notifications">
              <Text style={S.homeBellIcon}>◌</Text>
            </Pressable>
          </View>
        </View>

        <View style={S.homeFeaturedCard}>
          <View style={S.homeFeaturedGlowRight} />
          <View style={S.homeFeaturedGlowBottom} />
          <View style={S.homeFeaturedTopRow}>
            <View style={S.homeCardBadge}>
              <Text style={S.homeCardBadgeText}>▤</Text>
            </View>
            <View style={S.homeBrandPill}>
              <View style={S.homeBrandPillDot} />
              <Text style={S.homeBrandPillText}>Easy Credit</Text>
            </View>
          </View>

          <View style={S.homeFeaturedBottomRow}>
            <View>
              <Text style={S.homeFeaturedLabel}>Loan amount</Text>
              <Text style={S.homeFeaturedAmount}>
                {data?.featuredAmountRange ?? '2,000 - 80,000'}
              </Text>
            </View>
            <Pressable
              style={S.homeRepayBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Orders' })}>
              <Text style={S.homeRepayBtnText}>Repay</Text>
            </Pressable>
          </View>
        </View>

        <Text style={S.homeSectionTitle}>More recommendations</Text>

        {error ? (
          <View style={S.errorCard}>
            <Text style={S.errorText}>{error}</Text>
          </View>
        ) : null}

        {data?.recommendations.length === 0 ? (
          <Text style={S.emptyText}>No loan offers available right now.</Text>
        ) : null}

        {data?.recommendations.map(item => (
          <View key={item.id} style={S.homeLoanCard}>
            <View style={S.homeLoanCardTop}>
              <View style={S.homeLoanIconWrap}>
                <Text style={S.homeLoanIcon}>ϟ</Text>
              </View>
              <View style={S.flex1}>
                <View style={S.homeLoanTitleRow}>
                  <Text style={S.homeLoanCardName}>{item.productName}</Text>
                  <Text
                    style={[
                      S.homeLoanStatus,
                      item.statusVariant === 'settled' && S.statusSettled,
                    ]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={S.homeLoanIdRow}>
              <Text style={S.homeLoanIdLabel}>ID:</Text>
              <Text style={S.homeLoanIdValue}>{item.id}</Text>
            </View>

            <View style={S.homeLoanBottomRow}>
              <View>
                <Text style={S.homeLoanAmountLabel}>Amount of money</Text>
                <Text style={S.homeLoanAmount}>₹ {formatInr(item.amountRupees)}</Text>
              </View>
              <Pressable
                style={S.homeDetailBtn}
                onPress={() =>
                  navigation.navigate('OrderDetail', {
                    productId: resolveOrderDetailId(item),
                  })
                }>
                <Text style={S.homeDetailBtnText}>Detail</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={S.homePromoCard}>
          <View style={S.homePromoContent}>
            <Text style={S.homePromoTitle}>Lightning borrowing</Text>
            <Text style={S.homePromoChip}>Competitive rates · Quick approval</Text>
          </View>
          <View style={S.homePromoCircle}>
            <Text style={S.homePromoCurrency}>₹</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

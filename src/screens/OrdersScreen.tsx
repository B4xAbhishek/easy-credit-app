import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { mobileFetch } from '../api/client';
import { formatInr, resolveOrderDetailId } from '../utils';
import { S } from '../theme/styles';
import { LoadingScreen } from '../components/LoadingScreen';
import { SegmentTab } from '../components/SegmentTab';
import type { OrdersLoan, OrdersResponse } from '../types';
import type { MainTabsParamList, RootStackParamList } from '../navigation/types';

type Props = BottomTabScreenProps<MainTabsParamList, 'Orders'>;

export function OrdersScreen({ navigation }: Props) {
  const { session, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [loans, setLoans] = useState<OrdersLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) {
      return;
    }
    try {
      const response = await mobileFetch<OrdersResponse>('/api/mobile/orders', {
        token: session.token,
      });
      setLoans(response.loans);
    } catch (err) {
      if (err instanceof Error && err.message === 'unauthorized') {
        await signOut();
        return;
      }
      Alert.alert(
        'Orders',
        err instanceof Error ? err.message : 'Failed to load.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session, signOut]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = loans.filter(row =>
    tab === 'completed'
      ? row.statusVariant === 'settled'
      : row.statusVariant !== 'settled',
  );

  return (
    <View style={S.screenRoot}>
      {/* Purple header */}
      <View style={[S.screenHeader, { paddingTop: insets.top + 16 }]}>
        <Text style={S.screenHeaderTitle}>Loan List</Text>
      </View>

      {/* Segmented control */}
      <View style={S.segWrap}>
        <View style={S.seg}>
          <SegmentTab
            label="Ongoing"
            active={tab === 'ongoing'}
            onPress={() => setTab('ongoing')}
          />
          <SegmentTab
            label="Completed"
            active={tab === 'completed'}
            onPress={() => setTab('completed')}
          />
        </View>
      </View>

      {loading ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor="#5B5CF6"
            />
          }
          contentContainerStyle={S.listContent}
          renderItem={({ item }) => {
            const canOpenDetail = item.statusVariant !== 'settled';
            return (
              <View style={S.loanCard}>
                <View style={S.loanCardTop}>
                  <View style={S.loanIconWrap}>
                    <Text style={S.loanIcon}>⚡</Text>
                  </View>
                  <View style={S.flex1ml12}>
                    <View style={S.rowBetween}>
                      <Text style={S.loanCardName}>{item.productName}</Text>
                      <Text
                        style={[
                          S.loanStatus,
                          item.statusVariant === 'settled' && S.statusSettled,
                        ]}>
                        {item.status}
                      </Text>
                    </View>
                    <Text style={S.loanCardId} numberOfLines={1}>
                      ID:{'  '}{item.id}
                    </Text>
                  </View>
                </View>
                <Text style={S.loanAmountLabel}>Amount of money</Text>
                <View style={S.rowBetween}>
                  <Text style={S.loanAmount}>₹ {formatInr(item.amountRupees)}</Text>
                  {canOpenDetail ? (
                    <Pressable
                      style={S.detailBtn}
                      onPress={() =>
                        navigation
                          .getParent<
                            NativeStackScreenProps<RootStackParamList>['navigation']
                          >()
                          ?.navigate('OrderDetail', {
                            productId: resolveOrderDetailId(item),
                          })
                      }>
                      <Text style={S.detailBtnText}>Detail</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={S.emptyText}>No loans in this tab yet.</Text>
          }
        />
      )}
    </View>
  );
}

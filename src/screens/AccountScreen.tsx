import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { getContactSettings } from '../api/contactSettings';
import { mobileFetch } from '../api/client';
import { S } from '../theme/styles';
import { LoadingScreen } from '../components/LoadingScreen';
import { AccountRow } from '../components/AccountRow';
import type { MeResponse } from '../types';
import type { RootStackParamList } from '../navigation/types';

export function AccountScreen() {
  const { session, signOut } = useAuth();
  const navigation =
    useNavigation<NativeStackScreenProps<RootStackParamList>['navigation']>();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!session) {
        return;
      }
      try {
        const response = await mobileFetch<MeResponse>('/api/mobile/me', {
          token: session.token,
        });
        setProfile(response);
        const contactSettings = await getContactSettings(session.token);
        setContactPhone(contactSettings.contactPhone);
      } catch (err) {
        Alert.alert(
          'Account',
          err instanceof Error ? err.message : 'Failed to load.',
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  if (loading) {
    return <LoadingScreen />;
  }

  const accountLabel =
    profile?.accountLabel ??
    session?.user.phone ??
    session?.user.email ??
    'User';

  return (
    <View style={S.screenRoot}>
      {/* Purple header */}
      <View style={[S.accountHeader, { paddingTop: insets.top + 16 }]}>
        <View style={S.accountAvatarWrap}>
          <Text style={S.accountAvatarIcon}>👤</Text>
        </View>
        <Text style={S.accountLabel}>{accountLabel}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Promo banner */}
        <View style={S.promoBanner}>
          <View style={S.flex1}>
            <Text style={S.promoBannerTitle}>
              Loans That Keep You{'\n'}Moving
            </Text>
          </View>
          <View style={S.promoBannerIconWrap}>
            <Text style={S.promoBannerIcon}>📊</Text>
          </View>
        </View>

        {/* Common functions */}
        <Text style={S.sectionTitle}>Common functions</Text>

        <View style={S.accountList}>
          <AccountRow
            iconName="email-outline"
            iconBg="#7C3AED"
            label="Contact Us"
            onPress={() => navigation.navigate('ContactUs')}
          />
          {contactPhone ? (
            <>
              <View style={S.accountListDivider} />
              <AccountRow
                iconName="phone-outline"
                iconBg="#16A34A"
                label={`Call ${contactPhone}`}
                onPress={() => Linking.openURL(`tel:${contactPhone}`)}
              />
            </>
          ) : null}
          <View style={S.accountListDivider} />
          <AccountRow
            iconName="shield-lock-outline"
            iconBg="#4F46E5"
            label="Privacy Policy"
            onPress={() => navigation.navigate('LegalDocument', { type: 'privacy' })}
          />
          <View style={S.accountListDivider} />
          <AccountRow
            iconName="file-document-outline"
            iconBg="#4F46E5"
            label="Terms & Conditions"
            onPress={() => navigation.navigate('LegalDocument', { type: 'terms' })}
          />
          <View style={S.accountListDivider} />
          <AccountRow
            iconName="logout"
            iconBg="#4F46E5"
            label="Logout"
            onPress={async () => {
              await signOut();
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

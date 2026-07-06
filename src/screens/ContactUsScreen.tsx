import React, { useCallback, useState } from 'react';
import {
  Alert,
  Clipboard,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COMPANY_WEBSITE_URL, COMPANY_NAME } from '../constants';
import { useAuth } from '../context/AuthContext';
import {
  getContactSettings,
  getDefaultContactSettings,
} from '../api/contactSettings';
import { S } from '../theme/styles';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactUs'>;

function copyToClipboard(value: string, label: string) {
  Clipboard.setString(value);
  Alert.alert('Copied!', `${label} copied to clipboard.`, [{ text: 'OK' }]);
}

type ContactRowProps = {
  icon: string;
  label: string;
  value: string;
  canCopy?: boolean;
  onPress?: () => void;
  linkLabel?: string;
};

function ContactRow({ icon, label, value, canCopy, onPress, linkLabel }: ContactRowProps) {
  return (
    <View style={ls.row}>
      <View style={ls.iconWrap}>
        <Text style={ls.icon}>{icon}</Text>
      </View>
      <View style={ls.rowBody}>
        <Text style={ls.rowLabel}>{label}</Text>
        <Text style={ls.rowValue} selectable>{value}</Text>
        <View style={ls.rowActions}>
          {canCopy && (
            <Pressable
              style={({ pressed: p }) => [ls.chip, p && ls.chipPressed]}
              onPress={() => copyToClipboard(value, label)}>
              <Text style={ls.chipText}>Copy</Text>
            </Pressable>
          )}
          {onPress && linkLabel && (
            <Pressable
              style={({ pressed: p }) => [ls.chip, ls.chipPrimary, p && ls.chipPressed]}
              onPress={onPress}>
              <Text style={[ls.chipText, ls.chipTextPrimary]}>{linkLabel}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

export function ContactUsScreen({ navigation }: Props) {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [contactSettings, setContactSettings] = useState(getDefaultContactSettings);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadContactSettings() {
        if (!session?.token) {
          if (isMounted) {
            setContactSettings(getDefaultContactSettings());
          }
          return;
        }

        const nextSettings = await getContactSettings(session.token);
        if (isMounted) {
          setContactSettings(nextSettings);
        }
      }

      loadContactSettings();
      return () => {
        isMounted = false;
      };
    }, [session?.token]),
  );

  return (
    <View style={S.screenRoot}>
      <View style={[S.screenHeader, { paddingTop: insets.top + 10 }]}>
        <View style={S.contactHeaderRow}>
          <Pressable style={S.contactBackBtn} onPress={() => navigation.goBack()}>
            <Text style={S.contactBackBtnText}>‹</Text>
          </Pressable>
          <Text style={S.contactHeaderTitle}>Contact Us</Text>
          <View style={S.w40} />
        </View>
        <Text style={S.screenHeaderSub}>Here's how you can reach us.</Text>
      </View>

      <ScrollView contentContainerStyle={[S.contactContent, ls.scroll]}>
        {/* Company info banner */}
        <View style={ls.banner}>
          <View style={ls.bannerAvatar}>
            <Text style={ls.bannerAvatarText}>SK</Text>
          </View>
          <Text style={ls.bannerName}>{COMPANY_NAME}</Text>
          <Text style={ls.bannerTagline}>Smart credit solutions at your fingertips</Text>
        </View>

        {/* Contact details */}
        <View style={ls.card}>
          <Text style={ls.sectionTitle}>Contact Information</Text>

          <ContactRow
            icon="✉️"
            label="Email Address"
            value={contactSettings.contactEmail}
            canCopy
            onPress={() => Linking.openURL(contactSettings.contactMailtoHref)}
            linkLabel="Email"
          />

          {contactSettings.contactPhone ? (
            <>
              <View style={ls.divider} />
              <ContactRow
                icon="📞"
                label="Phone Number"
                value={contactSettings.contactPhone}
                canCopy
                onPress={() =>
                  Linking.openURL(`tel:${contactSettings.contactPhone}`)
                }
                linkLabel="Call"
              />
            </>
          ) : null}

          <View style={ls.divider} />

          <ContactRow
            icon="🌐"
            label="Website"
            value={COMPANY_WEBSITE_URL}
            canCopy
            onPress={() => Linking.openURL(COMPANY_WEBSITE_URL)}
            linkLabel="Open"
          />
        </View>

        {/* Note */}
        <View style={ls.noteCard}>
          <Text style={ls.noteText}>
            💡 You can copy any detail above and use it in your preferred app to reach us.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const ls = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  banner: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  bannerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#5B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#5B5CF6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  bannerAvatarText: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  bannerName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  bannerTagline: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  icon: { fontSize: 18 },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 2 },
  rowValue: { fontSize: 15, color: '#111827', fontWeight: '600', marginBottom: 8 },
  rowActions: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipPrimary: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  chipPressed: { opacity: 0.65 },
  chipText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  chipTextPrimary: { color: '#4F46E5' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: -16 },
  noteCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  noteText: { fontSize: 13, color: '#4338CA', lineHeight: 20 },
});

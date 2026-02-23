import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { getUserAddresses, deleteAddress, UserAddress } from '../../services/userService';

function addressLabel(type: string): string {
  const t = type?.toLowerCase() || '';
  if (t === 'home') return 'Home';
  if (t === 'work' || t === 'office') return 'Work';
  if (t === 'other') return 'Other';
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Address';
}

function addressIcon(type: string): 'home-outline' | 'briefcase-outline' | 'location-outline' {
  const t = type?.toLowerCase() || '';
  if (t === 'home') return 'home-outline';
  if (t === 'work' || t === 'office') return 'briefcase-outline';
  return 'location-outline';
}

function formatAddressLine(addr: UserAddress): string {
  const parts = [addr.street_address, addr.city].filter(Boolean);
  return parts.join(', ') || '—';
}

const AddressesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAddresses = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    try {
      const list = await getUserAddresses();
      setAddresses(list ?? []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses(false);
    }, [fetchAddresses])
  );

  const handleDelete = (addr: UserAddress) => {
    Alert.alert(
      t('addressesScreen.deleteTitle', 'Delete address'),
      t('addressesScreen.deleteMessage', 'Are you sure you want to delete this address?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            setDeletingId(addr.id);
            try {
              const ok = await deleteAddress(addr.id);
              if (ok) fetchAddresses(false);
              else Alert.alert(t('common.error', 'Error'), t('addressesScreen.deleteFailed', 'Could not delete address.'));
            } catch {
              Alert.alert(t('common.error', 'Error'), t('addressesScreen.deleteFailed', 'Could not delete address.'));
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('addressesScreen.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchAddresses(true)} colors={[COLORS.primary]} />
          }
        >
          {addresses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="location-outline" size={32} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>{t('addressesScreen.noAddresses', 'No saved addresses')}</Text>
            </View>
          ) : (
            addresses.map((addr) => (
              <View key={addr.id} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.row}>
                    <Ionicons name={addressIcon(addr.type)} size={18} color={COLORS.primary} />
                    <Text style={styles.addrTitle}>{addressLabel(addr.type)}</Text>
                  </View>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => navigation.navigate('EditAddress', { address: addr })}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => handleDelete(addr)}
                      disabled={deletingId === addr.id}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={deletingId === addr.id ? COLORS.textSecondary : COLORS.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.addrText}>{formatAddressLine(addr)}</Text>
              </View>
            ))
          )}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('AddAddress')}
          >
            <Text style={styles.primaryBtnText}>{t('addressesScreen.addNewAddress')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { margin: SPACING.lg, paddingBottom: SPACING.xl },
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  iconBtn: { padding: SPACING.xs },
  addrTitle: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.md },
  addrText: { color: COLORS.textSecondary, marginBottom: 0, fontSize: FONT_SIZES.sm },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  primaryBtnText: { color: '#fff', fontWeight: FONT_WEIGHTS.medium },
});

export default AddressesScreen;

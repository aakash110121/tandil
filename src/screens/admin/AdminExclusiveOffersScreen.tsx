import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { buildFullImageUrl } from '../../config/api';
import Header from '../../components/common/Header';
import { adminService, AdminExclusiveOffer } from '../../services/adminService';

const AdminExclusiveOffersScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [offers, setOffers] = useState<AdminExclusiveOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchOffers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await adminService.getExclusiveOffers({ per_page: 50 });
      setOffers(response.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('admin.exclusiveOffers.errorLoad', { defaultValue: 'Failed to load offers' }));
      setOffers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [fetchOffers])
  );

  const onRefresh = useCallback(() => {
    fetchOffers(true);
  }, [fetchOffers]);

  const handleDeleteOffer = useCallback(
    (item: AdminExclusiveOffer) => {
      const title = item.title ?? item.name ?? `#${item.id}`;
      Alert.alert(
        t('admin.exclusiveOffers.deleteTitle', { defaultValue: 'Delete offer?' }),
        t('admin.exclusiveOffers.deleteMessage', { defaultValue: 'Are you sure you want to delete "{{title}}"?' }).replace('{{title}}', String(title)),
        [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('common.delete', 'Delete'),
            style: 'destructive',
            onPress: async () => {
              setDeletingId(item.id);
              try {
                await adminService.deleteExclusiveOffer(item.id);
                setOffers((prev) => prev.filter((o) => o.id !== item.id));
              } catch (err: any) {
                const msg = err.response?.data?.message || err.message || t('admin.exclusiveOffers.deleteFailed', 'Failed to delete offer.');
                Alert.alert(t('admin.users.error', 'Error'), msg);
              } finally {
                setDeletingId(null);
              }
            },
          },
        ]
      );
    },
    [t]
  );

  const getOfferTitle = (item: AdminExclusiveOffer) =>
    item.title ?? item.name ?? `#${item.id}`;

  const getOfferImage = (item: AdminExclusiveOffer) => {
    const raw =
      item.image_url ??
      item.image ??
      (item as any).image_path ??
      (item as any).thumbnail_url ??
      (item as any).banner_url ??
      (item as any).media?.url;
    if (typeof raw === 'string' && raw.trim()) {
      return raw.startsWith('http') ? raw : buildFullImageUrl(raw);
    }
    return null;
  };

  const renderItem = ({ item }: { item: AdminExclusiveOffer }) => {
    const imageUri = getOfferImage(item);
    const title = getOfferTitle(item);
    const isActive = item.is_active === true || item.is_active === 1 || (item.status && String(item.status).toLowerCase() === 'active');
    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardMain}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('AdminEditExclusiveOffer' as never, { offer: item } as never)}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.cardImage}
              contentFit="cover"
              cachePolicy="disk"
              recyclingKey={String(item.id)}
              placeholder={{ uri: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"><rect fill="%23f0f0f0" width="1" height="1"/></svg>') }}
            />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <Ionicons name="pricetags-outline" size={40} color={COLORS.textSecondary} />
            </View>
          )}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
            {item.description ? (
              <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
            ) : null}
            <View style={styles.cardFooter}>
              <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextInactive]}>
                  {isActive ? t('admin.exclusiveOffers.active', { defaultValue: 'Active' }) : t('admin.exclusiveOffers.inactive', { defaultValue: 'Inactive' })}
                </Text>
              </View>
              {item.valid_from || item.valid_to ? (
                <Text style={styles.cardDates} numberOfLines={1}>
                  {item.valid_from && item.valid_to
                    ? `${String(item.valid_from).slice(0, 10)} – ${String(item.valid_to).slice(0, 10)}`
                    : item.valid_from
                      ? String(item.valid_from).slice(0, 10)
                      : item.valid_to
                        ? String(item.valid_to).slice(0, 10)
                        : ''}
                </Text>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('AdminEditExclusiveOffer' as never, { offer: item } as never)}
          >
            <Ionicons name="create-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleDeleteOffer(item)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <Ionicons name="trash-outline" size={22} color={COLORS.error} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header
        title={t('admin.dashboard.exclusiveOffers')}
        showBack={true}
        showLanguage={false}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AdminAddExclusiveOffer' as never)}
          >
            <Ionicons name="add" size={26} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      {loading && !refreshing ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('admin.exclusiveOffers.loading', { defaultValue: 'Loading offers…' })}</Text>
        </View>
      ) : error ? (
        <View style={styles.centerWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOffers()}>
            <Text style={styles.retryBtnText}>{t('common.retry', { defaultValue: 'Retry' })}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={offers}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerWrap}>
              <Ionicons name="pricetags-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>{t('admin.exclusiveOffers.empty', { defaultValue: 'No exclusive offers yet' })}</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  retryBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.xs,
    gap: SPACING.xs,
  },
  iconBtn: {
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  cardImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.border + '40',
  },
  cardImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeActive: {
    backgroundColor: COLORS.success + '20',
  },
  badgeInactive: {
    backgroundColor: COLORS.textSecondary + '30',
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  badgeTextActive: {
    color: COLORS.success,
  },
  badgeTextInactive: {
    color: COLORS.textSecondary,
  },
  cardDates: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  addButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
  },
});

export default AdminExclusiveOffersScreen;

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { buildFullImageUrl } from '../../config/api';
import { adminService, AdminService } from '../../services/adminService';

const PER_PAGE = 50;

const AdminServicesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchServices = useCallback(async (page = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (page === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const response = await adminService.getServices({
        page,
        per_page: PER_PAGE,
      });
      const list = Array.isArray(response.data) ? response.data : [];
      const pagination = response.pagination;
      const current = pagination?.current_page ?? 1;
      const last = pagination?.last_page ?? 1;
      if (page === 1) {
        setServices(list);
      } else {
        setServices((prev) => [...prev, ...list]);
      }
      setCurrentPage(current);
      setLastPage(last);
      setHasMore(current < last);
    } catch (err: any) {
      const rawMessage = err.response?.data?.message || err.message || '';
      const isServerOrDbError =
        typeof rawMessage === 'string' &&
        (rawMessage.includes('SQLSTATE') ||
          rawMessage.includes("doesn't exist") ||
          rawMessage.includes('Table ') ||
          rawMessage.includes('mysql'));
      const friendlyMessage = isServerOrDbError
        ? t('admin.services.serverError', 'Services are not available right now. Please try again later or contact support.')
        : (rawMessage || t('admin.services.loadError', 'Failed to load services'));
      setError(friendlyMessage);
      if (page === 1) setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchServices(1);
    }, [fetchServices])
  );

  const onRefresh = useCallback(() => {
    fetchServices(1, true);
  }, [fetchServices]);

  const onEndReached = useCallback(() => {
    if (loadingMore || !hasMore || currentPage >= lastPage) return;
    fetchServices(currentPage + 1);
  }, [loadingMore, hasMore, currentPage, lastPage, fetchServices]);

  const handleEditService = useCallback(
    (service: AdminService) => {
      navigation.navigate('AdminEditService', { service });
    },
    [navigation]
  );

  const handleDeleteService = useCallback(
    (service: AdminService) => {
      Alert.alert(
        t('admin.services.deleteTitle', 'Delete service'),
        t('admin.services.deleteMessage', { name: service.name, defaultValue: `Are you sure you want to delete "${service.name}"? This action cannot be undone.` }),
        [
          { text: t('admin.settings.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('admin.users.delete', 'Delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await adminService.deleteService(service.id);
                fetchServices(1, true);
                Alert.alert(
                  t('admin.users.success'),
                  t('admin.services.deleteSuccess', 'Service deleted successfully.'),
                  [{ text: t('common.done') }]
                );
              } catch (err: any) {
                const apiMessage = (err.response?.data?.message || err.message || '') as string;
                const msg = apiMessage || t('admin.services.deleteFailed', 'Failed to delete service');
                Alert.alert(t('admin.users.error'), msg, [{ text: t('common.done') }]);
              }
            },
          },
        ]
      );
    },
    [t, fetchServices]
  );

  const handleToggleStatus = useCallback(
    async (item: AdminService) => {
      if (togglingId != null) return;
      const previousActive = item.is_active !== false;
      setTogglingId(item.id);
      setServices((prev) =>
        prev.map((s) =>
          s.id === item.id ? { ...s, is_active: !previousActive } : s
        )
      );
      try {
        const res = await adminService.toggleServiceStatus(item.id);
        if (res.data) {
          setServices((prev) =>
            prev.map((s) => (s.id === item.id ? { ...s, ...res.data } : s))
          );
        }
      } catch (err: any) {
        setServices((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, is_active: previousActive } : s))
        );
        const msg = err.response?.data?.message || err.message || t('admin.services.toggleFailed', 'Failed to update status');
        Alert.alert(t('admin.users.error'), msg, [{ text: t('common.done') }]);
      } finally {
        setTogglingId(null);
      }
    },
    [t, togglingId]
  );

  const renderItem = ({ item }: { item: AdminService }) => {
    const imageUri = item.image_url ?? (item.image ? buildFullImageUrl(item.image) : null);
    return (
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.serviceThumb} contentFit="cover" />
          ) : (
            <Ionicons name="construct-outline" size={24} color={COLORS.primary} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          {item.slug ? (
            <Text style={styles.slug} numberOfLines={1}>{item.slug}</Text>
          ) : null}
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <View style={styles.metaRow}>
            {item.products_count != null && (
              <Text style={styles.meta}>{item.products_count} products</Text>
            )}
            {item.is_active === false && (
              <Text style={styles.inactiveBadge}>{t('admin.services.inactive', 'Inactive')}</Text>
            )}
          </View>
        </View>
        <View style={styles.rowRight}>
          <View style={styles.toggleWrap}>
            <Switch
              value={item.is_active !== false}
              onValueChange={() => handleToggleStatus(item)}
              disabled={togglingId === item.id}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.background}
            />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => handleEditService(item)}
            >
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => handleDeleteService(item)}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('admin.services.title', 'Services')}
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminAddService')}
        >
          <Ionicons name="add" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {t('admin.services.loading', 'Loading services…')}
          </Text>
        </View>
      ) : error && services.length === 0 ? (
        <View style={styles.centerWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchServices(1)}>
            <Text style={styles.retryBtnText}>
              {t('admin.users.retry', 'Retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                {t('admin.services.empty', 'No services found')}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
        />
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  addBtn: { padding: SPACING.xs, width: 40, alignItems: 'flex-end' },
  listContent: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  errorText: { fontSize: FONT_SIZES.sm, color: COLORS.error, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryBtnText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.background },
  emptyWrap: { paddingVertical: SPACING.xl * 2, alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  serviceThumb: { width: '100%', height: '100%' },
  info: { marginLeft: SPACING.md, flex: 1, minWidth: 0 },
  rowRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    minWidth: 100,
  },
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 2,
  },
  actions: { flexDirection: 'row', gap: 8 },
  smallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  name: { color: COLORS.text, fontWeight: FONT_WEIGHTS.semiBold, fontSize: FONT_SIZES.md, marginBottom: 2 },
  slug: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, marginBottom: 2 },
  description: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 2 },
  meta: { fontSize: FONT_SIZES.xs, color: COLORS.primary },
  inactiveBadge: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  footer: { paddingVertical: SPACING.md, alignItems: 'center' },
});

export default AdminServicesScreen;

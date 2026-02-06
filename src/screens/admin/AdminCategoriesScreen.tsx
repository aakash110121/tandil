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
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { buildFullImageUrl } from '../../config/api';
import { adminService, AdminCategory } from '../../services/adminService';

const PER_PAGE = 10;

const AdminCategoriesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchCategories = useCallback(async (page = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (page === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const response = await adminService.getCategories({
        page,
        per_page: PER_PAGE,
      });
      // API returns either: { data: Category[], pagination: { current_page, last_page, ... } } or legacy { data: { data, current_page, ... } }
      const isArray = Array.isArray(response.data);
      const list = isArray ? response.data : (response.data as any)?.data ?? [];
      const pagination = response.pagination ?? (!isArray ? (response.data as any) : null);
      const current = pagination?.current_page ?? 1;
      const last = pagination?.last_page ?? 1;
      if (page === 1) {
        setCategories(Array.isArray(list) ? list : []);
      } else {
        setCategories((prev) => [...prev, ...(Array.isArray(list) ? list : [])]);
      }
      setCurrentPage(current);
      setLastPage(last);
      setHasMore(current < last);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load categories');
      if (page === 1) setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategories(1);
    }, [fetchCategories])
  );

  const onRefresh = useCallback(() => {
    fetchCategories(1, true);
  }, [fetchCategories]);

  const onEndReached = useCallback(() => {
    if (loadingMore || !hasMore || currentPage >= lastPage) return;
    fetchCategories(currentPage + 1);
  }, [loadingMore, hasMore, currentPage, lastPage, fetchCategories]);

  const handleEditCategory = useCallback(
    (category: AdminCategory) => {
      navigation.navigate('AdminEditCategory', { category });
    },
    [navigation]
  );

  const handleDeleteCategory = useCallback(
    (category: AdminCategory) => {
      Alert.alert(
        t('admin.categoriesAdmin.deleteTitle', 'Delete category'),
        t(
          'admin.categoriesAdmin.deleteMessage',
          { name: category.name, defaultValue: `Are you sure you want to delete "${category.name}"? This action cannot be undone.` }
        ),
        [
          { text: t('admin.settings.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('admin.users.delete', 'Delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await adminService.deleteCategory(category.id);
                fetchCategories(1, true);
              } catch (err: any) {
                const apiMessage = (err.response?.data?.message || err.message || '') as string;
                const isHasProductsError =
                  /existing products|cannot delete category|has products|products first/i.test(apiMessage);
                const msg = isHasProductsError
                  ? t('admin.categoriesAdmin.cannotDeleteHasProducts')
                  : apiMessage || t('admin.categoriesAdmin.deleteFailed');
                Alert.alert(t('admin.users.error'), msg, [{ text: t('common.done') }]);
              }
            },
          },
        ]
      );
    },
    [fetchCategories, t]
  );

  const renderItem = ({ item }: { item: AdminCategory }) => {
    const imageUri = item.image_url ?? (item.image ? buildFullImageUrl(item.image) : null);
    return (
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.categoryThumb} contentFit="cover" />
          ) : (
            <Ionicons name="pricetag-outline" size={24} color={COLORS.primary} />
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
          <Text style={styles.meta}>
            {item.products_count != null ? `${item.products_count} products` : ''}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => handleEditCategory(item)}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => handleDeleteCategory(item)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
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
          {t('admin.categoriesAdmin.listTitle', 'Categories')}
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminAddCategory')}
        >
          <Ionicons name="add" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {t('admin.categoriesAdmin.loading', 'Loading categories…')}
          </Text>
        </View>
      ) : error && categories.length === 0 ? (
        <View style={styles.centerWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchCategories(1)}>
            <Text style={styles.retryBtnText}>
              {t('admin.users.retry', 'Retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories}
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
                {t('admin.categoriesAdmin.empty', 'No categories found')}
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
  categoryThumb: { width: '100%', height: '100%' },
  info: { marginLeft: SPACING.md, flex: 1, minWidth: 0 },
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
  meta: { fontSize: FONT_SIZES.xs, color: COLORS.primary },
  footer: { paddingVertical: SPACING.md, alignItems: 'center' },
});

export default AdminCategoriesScreen;

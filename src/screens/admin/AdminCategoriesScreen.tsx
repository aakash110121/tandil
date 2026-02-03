import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { adminService, AdminCategory } from '../../services/adminService';

const PER_PAGE = 10;

const AdminCategoriesScreen: React.FC = () => {
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
      const pagination = response.data;
      const list = Array.isArray(pagination?.data) ? pagination.data : [];
      if (page === 1) {
        setCategories(list);
      } else {
        setCategories((prev) => [...prev, ...list]);
      }
      setCurrentPage(pagination?.current_page ?? 1);
      setLastPage(pagination?.last_page ?? 1);
      setHasMore((pagination?.current_page ?? 1) < (pagination?.last_page ?? 1));
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

  const renderItem = ({ item }: { item: AdminCategory }) => (
    <View style={styles.row}>
      <View style={styles.iconCircle}>
        <Ionicons name="pricetag-outline" size={24} color={COLORS.primary} />
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={styles.headerRight} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading categories…</Text>
        </View>
      ) : error && categories.length === 0 ? (
        <View style={styles.centerWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchCategories(1)}>
            <Text style={styles.retryBtnText}>Retry</Text>
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
              <Text style={styles.emptyText}>No categories found</Text>
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
  headerRight: { width: 40 },
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
  },
  info: { marginLeft: SPACING.md, flex: 1 },
  name: { color: COLORS.text, fontWeight: FONT_WEIGHTS.semiBold, fontSize: FONT_SIZES.md, marginBottom: 2 },
  slug: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, marginBottom: 2 },
  description: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginBottom: 2 },
  meta: { fontSize: FONT_SIZES.xs, color: COLORS.primary },
  footer: { paddingVertical: SPACING.md, alignItems: 'center' },
});

export default AdminCategoriesScreen;

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
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { buildFullImageUrl } from '../../config/api';
import { adminService, AdminProduct } from '../../services/adminService';

const PER_PAGE = 15;

// Pick first/primary image for list. Prefer thumbnail_url if API provides it (faster load). Else image_url, etc.
function getProductImageUri(item: AdminProduct): string | null {
  const o = item as Record<string, unknown>;
  const thumbnailUrl = (typeof o['thumbnail_url'] === 'string' && (o['thumbnail_url'] as string).trim()) ? (o['thumbnail_url'] as string) : null;
  const imageUrl = o['image_url'] ?? item.image_url;
  const image = o['image'] ?? item.image;
  const primary = o['primary_image'] as { image_path?: string; image_url?: string; thumbnail_url?: string } | null;
  const primaryUrl = primary?.image_url;
  const primaryThumb = primary?.thumbnail_url;
  const primaryPath = primary?.image_path ?? item.primary_image?.image_path;
  const imagesArr = (o['images'] as Array<{ image_path?: string; image_url?: string; thumbnail_url?: string; is_primary?: number }> | null) ?? item.images;
  const firstImg = imagesArr?.length
    ? (imagesArr.find((i) => i.is_primary === 1 || i.is_primary === true) ?? imagesArr[0])
    : null;
  const firstImgUrl = firstImg?.image_url;
  const firstImgThumb = firstImg?.thumbnail_url;
  const firstImgPath = firstImg?.image_path;
  const raw =
    (thumbnailUrl ? thumbnailUrl : null) ??
    (typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl : null) ??
    (typeof primaryThumb === 'string' && primaryThumb.trim() ? primaryThumb : null) ??
    (typeof primaryUrl === 'string' && primaryUrl.trim() ? primaryUrl : null) ??
    (typeof image === 'string' && image.trim() ? image : null) ??
    (typeof primaryPath === 'string' && primaryPath.trim() ? primaryPath : null) ??
    (typeof firstImgThumb === 'string' && firstImgThumb.trim() ? firstImgThumb : null) ??
    (typeof firstImgUrl === 'string' && firstImgUrl.trim() ? firstImgUrl : null) ??
    (typeof firstImgPath === 'string' && firstImgPath.trim() ? firstImgPath : null);
  if (!raw || typeof raw !== 'string' || !raw.trim()) return null;
  return buildFullImageUrl(raw);
}

// Prefetch first N image URIs with expo-image (disk cache) so list shows images faster
const PREFETCH_COUNT = 15;
function prefetchProductImages(products: AdminProduct[]) {
  const urls: string[] = [];
  for (const item of products) {
    if (urls.length >= PREFETCH_COUNT) break;
    const uri = getProductImageUri(item);
    if (uri) urls.push(uri);
  }
  if (urls.length > 0) {
    Image.prefetch(urls, { cachePolicy: 'disk' }).catch(() => {});
  }
}

const ProductImage: React.FC<{ uri: string | null; productId: number }> = ({ uri, productId }) => {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }]}>
        <Ionicons name="leaf-outline" size={18} color={COLORS.primary} />
      </View>
    );
  }
  return (
    <Image
      key={`img-${productId}-${uri}`}
      source={{ uri }}
      style={styles.productImage}
      contentFit="cover"
      cachePolicy="disk"
      recyclingKey={`product-${productId}`}
      onError={() => setFailed(true)}
    />
  );
};

const AdminProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await adminService.getProducts({
        search: '',
        category_id: '',
        filter: 'all',
        per_page: PER_PAGE,
        page: 1,
      });
      // API returns { data: [...], pagination } – use response.data as the list
      const list = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
      setProducts(list);
      prefetchProductImages(list);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'number' ? price : parseFloat(String(price));
    if (isNaN(num)) return String(price);
    return `AED ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteProduct = useCallback((item: AdminProduct) => {
    Alert.alert(
      'Delete product',
      `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(item.id);
            try {
              await adminService.deleteProduct(item.id);
              setProducts((prev) => prev.filter((p) => p.id !== item.id));
            } catch (err: any) {
              const msg = err.response?.data?.message ?? err.message ?? 'Failed to delete product';
              Alert.alert('Error', msg);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }, []);

  const renderProduct = ({ item }: { item: AdminProduct }) => {
    const imageUri = getProductImageUri(item);
    const isDeleting = deletingId === item.id;
    return (
    <View style={styles.row}>
      <View style={styles.left}>
        <ProductImage uri={imageUri} productId={item.id} />
        <View style={styles.productInfo}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.meta}>{item.vendor}</Text>
          <Text style={styles.meta}>{formatPrice(item.price)} • Stock {item.stock}</Text>
          {item.category?.name && (
            <Text style={styles.categoryTag}>{item.category.name}</Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.smallBtn}>
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() => handleDeleteProduct(item)}
          disabled={isDeleting}
        >
          {isDeleting
            ? <ActivityIndicator size="small" color={COLORS.error} />
            : <Ionicons name="trash-outline" size={18} color={COLORS.error} />}
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
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminAddProduct' as never)}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading products…</Text>
        </View>
      ) : error && products.length === 0 ? (
        <View style={styles.centerWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProducts()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts(true)} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
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
  addBtn: { padding: SPACING.xs },
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
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { marginLeft: SPACING.md, flex: 1 },
  name: { color: COLORS.text, fontWeight: FONT_WEIGHTS.semiBold, fontSize: FONT_SIZES.md, marginBottom: 2 },
  meta: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, marginBottom: 1 },
  categoryTag: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: 2,
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
});

export default AdminProductsScreen;

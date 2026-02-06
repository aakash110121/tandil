import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { useAppStore } from '../../store';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import { shopService, ShopProduct } from '../../services/shopService';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=60';

type CategoryItem = { id: string; name: string; icon: string };

const StoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { cart, addToCart } = useAppStore();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const getProductImage = useCallback((p: ShopProduct) => {
    return p.image_url ?? (p.main_image as any)?.image_url ?? p.image ?? FALLBACK_IMAGE;
  }, []);

  const toDetailProduct = useCallback((p: ShopProduct) => ({
    id: String(p.id),
    name: p.name,
    price: typeof p.price === 'string' ? parseFloat(p.price) || 0 : p.price,
    originalPrice: typeof p.compare_at_price === 'string' ? parseFloat(p.compare_at_price) || 0 : (p.compare_at_price ?? 0),
    rating: 4.5,
    reviews: 0,
    image: getProductImage(p),
    badge: '',
    inStock: (p.stock ?? 0) > 0,
    description: p.description,
    features: [],
  }), [getProductImage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await shopService.getProductCategories();
        if (cancelled) return;
        const allItem: CategoryItem = { id: 'all', name: t('store.categories.all', { defaultValue: 'All' }), icon: 'grid-outline' };
        const fromApi: CategoryItem[] = list.map(c => ({ id: String(c.id), name: c.name, icon: 'leaf-outline' }));
        setCategories([allItem, ...fromApi]);
      } catch (_) {
        if (!cancelled) setCategories([{ id: 'all', name: t('store.categories.all', { defaultValue: 'All' }), icon: 'grid-outline' }]);
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  // Debounced search term for API (used when "All" is selected)
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        if (selectedCategoryId === 'all') {
          const res = await shopService.getProducts({
            per_page: 12,
            page: 1,
            search: debouncedSearch || undefined,
          });
          if (!cancelled) setProducts(Array.isArray(res?.data) ? res.data : []);
        } else {
          const data = await shopService.getProductsByCategory(selectedCategoryId, { page: 1 });
          if (!cancelled) setProducts(data?.products ?? []);
        }
      } catch (_) {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedCategoryId, debouncedSearch]);

  // When a category is selected, filter its products by search client-side
  const filteredProducts =
    selectedCategoryId === 'all'
      ? products
      : products.filter(p => {
          const q = searchQuery.trim().toLowerCase();
          if (!q) return true;
          const name = (p.name ?? '').toLowerCase();
          const desc = (p.description ?? '').toLowerCase();
          return name.includes(q) || desc.includes(q);
        });

  const handleAddToCart = (product: ShopProduct) => {
    const detail = toDetailProduct(product);
    addToCart(detail);
    setAddedToCart(String(product.id));
    setTimeout(() => setAddedToCart(null), 1000);
  };

  const cartItemCount = (cart || []).reduce((total, item) => total + item.quantity, 0);

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedCategoryId === item.id && styles.categoryItemActive]}
      onPress={() => setSelectedCategoryId(item.id)}
    >
      <Ionicons name={item.icon as any} size={18} color={selectedCategoryId === item.id ? COLORS.background : COLORS.primary} />
      <Text style={[styles.categoryText, selectedCategoryId === item.id && styles.categoryTextActive]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: ShopProduct }) => {
    const detail = toDetailProduct(item);
    const imageUri = getProductImage(item);
    const priceNum = typeof item.price === 'string' ? parseFloat(item.price) || 0 : item.price;
    const originalNum = typeof item.compare_at_price === 'string' ? parseFloat(item.compare_at_price) || 0 : (item.compare_at_price ?? 0);
    const showDiscount = originalNum > priceNum;
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { product: detail })}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: imageUri || FALLBACK_IMAGE }} style={styles.productImage} contentFit="cover" transition={200} cachePolicy="disk" />
          {showDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(((originalNum - priceNum) / originalNum) * 100)}% {t('product.off')}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.productContent}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={1}>{item.description ?? ''}</Text>
          <View style={styles.productFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>{t('orders.currency', { defaultValue: 'AED' })} {priceNum}</Text>
              {showDiscount && <Text style={styles.originalPrice}>{t('orders.currency', { defaultValue: 'AED' })} {originalNum}</Text>}
            </View>
            <View style={styles.productRating}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.addToCartButton, addedToCart === String(item.id) && styles.addToCartButtonAdded]}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name={addedToCart === String(item.id) ? 'checkmark' : 'add'} size={20} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title={t('tabs.store')} 
        showBack={false}
        showCart={true}
        rightComponent={
          cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )
        }
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchTextInput}
            placeholder={t('store.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products Grid */}
      <View style={styles.productsContainer}>
        <View style={styles.productsHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategoryId === 'all' ? t('category.allProducts') : `${categories.find(c => c.id === selectedCategoryId)?.name ?? ''} ${t('category.products')}`}
          </Text>
          <Text style={styles.productsCount}>{t('store.productsCount', { count: filteredProducts.length })}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('store.noProducts', { defaultValue: 'No products found' })}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            columnWrapperStyle={styles.productRow}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  cartButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesList: {
    paddingHorizontal: SPACING.lg,
  },
  categoryItem: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.sm,
    minWidth: 64,
  },
  categoryItemActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginTop: 2,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: COLORS.background,
  },
  productsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  productsCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  productsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    width: '48%',
  },
  productImageContainer: {
    height: 120,
    backgroundColor: COLORS.primary + '10',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  discountText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  productContent: {
    padding: SPACING.md,
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    paddingRight: SPACING.sm,
  },
  productPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: SPACING.xs,
    flexShrink: 1,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  addToCartButtonAdded: {
    backgroundColor: COLORS.success,
  },
});

export default StoreScreen;

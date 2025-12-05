import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants';
import { mockProducts } from '../../data/mockData';

const OffersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const discounted = mockProducts.filter(p => typeof p.originalPrice === 'number' && p.originalPrice > p.price);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'care', label: 'Care' },
    { id: 'protection', label: 'Protection' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'storage', label: 'Storage' },
    { id: 'polish', label: 'Polish' },
  ];

  const sortOptions = [
    { id: 'popular', label: 'Popular' },
    { id: 'price_low', label: 'Price: Low to High' },
    { id: 'price_high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Rating' },
    { id: 'discount', label: 'Discount %' },
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortIndex, setSortIndex] = useState(0);

  const displayed = useMemo(() => {
    const filtered = discounted.filter(p => selectedCategory === 'all' || p.category === selectedCategory);
    const option = sortOptions[sortIndex]?.id;
    const sorted = [...filtered].sort((a: any, b: any) => {
      if (option === 'price_low') return a.price - b.price;
      if (option === 'price_high') return b.price - a.price;
      if (option === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (option === 'discount') {
        const da = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
        const db = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
        return db - da;
      }
      return 0;
    });
    return sorted;
  }, [discounted, selectedCategory, sortIndex]);

  const FallbackImage = ({ uri }: { uri: string }) => {
    const [currentUri, setCurrentUri] = useState(uri);
    const fallback = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=60&auto=format&fit=crop';
    return (
      <View style={styles.rowImageContainer}>
        <Image
          source={{ uri: currentUri }}
          style={styles.rowImage}
          onError={() => setCurrentUri(fallback)}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }] }>
      <View style={[styles.header, { marginBottom: 20 }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offers</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filters + Sort */}
      <View style={styles.controls}>
        <ScrollView style={{ flex: 1 }} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.sortPill} onPress={() => setSortIndex((prev) => (prev + 1) % sortOptions.length)}>
          <Ionicons name="swap-vertical" size={16} color={COLORS.primary} />
          <Text style={styles.sortText}>{sortOptions[sortIndex].label}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: insets.bottom + SPACING.xxl + 56 }}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.rowCard} onPress={() => navigation.navigate('ProductDetail', { product: {
            id: item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice ?? item.price,
            rating: item.rating,
            reviews: item.reviews,
            image: item.images[0],
            badge: 'Sale',
            inStock: item.inStock,
          }})}>
            <FallbackImage uri={item.images[0]} />
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
              <View style={styles.rowRating}>
                <Ionicons name="star" size={14} color={COLORS.warning} />
                <Text style={styles.rowRatingText}>{item.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.rowSubtitle} numberOfLines={2}>{item.description}</Text>
              <View style={styles.rowPrices}>
                <Text style={styles.rowPrice}>${item.price}</Text>
                {item.originalPrice && (
                  <Text style={styles.rowOriginal}>${item.originalPrice}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Bottom navigation mimic bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.sm }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
          <Ionicons name="home-outline" size={22} color={COLORS.text} />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
          <Ionicons name="construct-outline" size={22} color={COLORS.text} />
          <Text style={styles.tabLabel}>Services</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
          <Ionicons name="list-outline" size={22} color={COLORS.text} />
          <Text style={styles.tabLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
          <Ionicons name="bag-outline" size={22} color={COLORS.text} />
          <Text style={styles.tabLabel}>Store</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
          <Ionicons name="person-outline" size={22} color={COLORS.text} />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  controls: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipsRow: {
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  chipText: { color: COLORS.text, fontSize: FONT_SIZES.xs },
  chipTextActive: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortText: { color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.medium },
  rowCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  rowImageContainer: {
    width: 96,
    height: 96,
    overflow: 'hidden',
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  rowImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  rowContent: { flex: 1, padding: SPACING.md, justifyContent: 'center' },
  rowTitle: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  rowRating: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  rowRatingText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  rowSubtitle: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  rowPrices: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: SPACING.xs },
  rowPrice: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },
  rowOriginal: { color: COLORS.textSecondary, textDecorationLine: 'line-through', marginLeft: 8 },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  tabItem: { alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: FONT_SIZES.xs, color: COLORS.text },
});

export default OffersScreen;



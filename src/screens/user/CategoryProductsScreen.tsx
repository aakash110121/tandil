import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get('window');

interface CategoryProductsScreenProps {
  route: {
    params: {
      category: {
        id: string;
        name: string;
        image: string;
      };
    };
  };
}

const CategoryProductsScreen: React.FC<CategoryProductsScreenProps> = ({ route }) => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { category } = route.params;

  // Fallback image component
  const FallbackImage = ({ uri }: { uri: string }) => {
    const [currentUri, setCurrentUri] = useState(uri);
    const fallback = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=60';
    return (
      <Image
        source={{ uri: currentUri }}
        style={styles.productImage}
        onError={() => setCurrentUri(fallback)}
      />
    );
  };

  // Mock products data for the category
  const [products] = useState([
    {
      id: 'product_001',
      name: 'Organic Fertilizer 5kg',
      description: 'Natural compost blend for fruit trees and palms',
      price: 89.99,
      originalPrice: 129.99,
      rating: 4.8,
      reviews: 124,
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=60&v=fert1',
      badge: 'Best Seller',
      inStock: true,
      features: ['Slow-release formula', 'Rich in nutrients', 'Improves soil health', 'Eco-friendly', 'For all plants'],
    },
    {
      id: 'product_002',
      name: 'Premium Potting Soil',
      description: 'Nutrient-rich mix for container gardening',
      price: 59.99,
      originalPrice: 79.99,
      rating: 4.6,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?auto=format&fit=crop&w=800&q=60',
      badge: 'New',
      inStock: true,
      features: ['Perfect pH balance', 'Excellent drainage', 'Moisture retention', 'Organic matter', '25L bag'],
    },
    {
      id: 'product_003',
      name: 'Professional Pruning Shears',
      description: 'Sharp bypass pruners for precision trimming',
      price: 149.99,
      originalPrice: 199.99,
      rating: 4.9,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=60&v=shears1',
      badge: 'Premium',
      inStock: true,
      features: ['Stainless steel blades', 'Ergonomic grip', 'Safety lock', 'Professional grade', '1 year warranty'],
    },
    {
      id: 'product_004',
      name: 'Drip Irrigation Kit',
      description: 'Complete watering system for gardens',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=60',
      badge: 'Sale',
      inStock: true,
      features: ['50m tubing included', 'Adjustable drippers', 'Water efficient', 'Easy installation', 'Timer compatible'],
    },
    {
      id: 'product_005',
      name: 'Garden Tool Set',
      description: 'Complete toolkit for garden maintenance',
      price: 119.99,
      originalPrice: 159.99,
      rating: 4.5,
      reviews: 43,
      image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&w=800&q=60&v=tools1',
      badge: 'Limited',
      inStock: true,
      features: ['10 essential tools', 'Rust-resistant', 'Carrying case', 'Lifetime warranty', 'Professional quality'],
    },
    {
      id: 'product_006',
      name: 'Fresh Vegetables Box',
      description: 'Mixed seasonal vegetables from local farms',
      price: 39.99,
      originalPrice: 59.99,
      rating: 4.4,
      reviews: 78,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=60&v=veg1',
      badge: 'Trending',
      inStock: true,
      features: ['Fresh daily', 'Organic certified', 'Local farms', 'Seasonal variety', 'Pesticide-free'],
    },
  ]);

  const renderProductCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.productImageContainer}>
        <FallbackImage uri={item.image} />
        {item.badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={COLORS.warning} />
          <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews} {t('product.reviews')})</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>{t('orders.currency', { defaultValue: 'AED' })} {item.price}</Text>
          {item.originalPrice > item.price && (
             <Text style={styles.originalPrice}>{t('orders.currency', { defaultValue: 'AED' })} {item.originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Header 
        title={category.name}
        showBack={true}
        showCart={true}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <Image source={{ uri: category.image }} style={styles.categoryImage} />
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <Text style={styles.productCount}>{products.length} Products</Text>
          </View>
        </View>

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('category.allProducts')}</Text>
            <TouchableOpacity>
              <Text style={styles.filterText}>{t('category.filter')}</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  productsContainer: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  productCard: {
    width: (screenWidth - SPACING.md * 3) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    position: 'relative',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  originalPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
});

export default CategoryProductsScreen;




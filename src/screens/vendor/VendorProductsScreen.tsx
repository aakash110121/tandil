import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { VendorProduct } from '../../types';
import ModelViewer3D from '../../components/common/ModelViewer3D';

const { width } = Dimensions.get('window');

const VendorProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Only 3D panoramic viewer is used now
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [selectedModelUrl, setSelectedModelUrl] = useState<string | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  const getFallbackImageUrl = (product: VendorProduct): string => {
    switch (product.category) {
      case 'shoes':
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
      case 'accessories':
        return 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400';
      case 'clothing':
        return 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400';
      default:
        return 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400';
    }
  };

  // Demo products data
  const demoProducts: VendorProduct[] = [
    {
      id: '1',
      vendorId: 'vendor_001',
      name: 'Premium Leather Sneakers',
      description: 'High-quality leather sneakers with comfortable sole',
      category: 'shoes',
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
      ],
      threeSixtyImages: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&1',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&2',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&3',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&4',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&5',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&6',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&7',
      ],
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      isAvailable: true,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      vendorId: 'vendor_001',
      name: 'Casual Canvas Shoes',
      description: 'Lightweight canvas shoes perfect for daily wear',
      category: 'shoes',
      images: [
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      ],
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      isAvailable: true,
      createdAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      vendorId: 'vendor_001',
      name: 'Leather Wallet',
      description: 'Genuine leather wallet with multiple card slots',
      category: 'accessories',
      images: [
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
      ],
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      isAvailable: true,
      createdAt: new Date('2024-01-08'),
    },
    {
      id: '4',
      vendorId: 'vendor_001',
      name: 'Sports Socks Pack',
      description: 'Comfortable sports socks for athletic activities',
      category: 'accessories',
      images: [
        'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400',
      ],
      modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      isAvailable: false,
      createdAt: new Date('2024-01-05'),
    },
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: 'grid-outline' },
    { id: 'shoes', name: 'Shoes', icon: 'footsteps-outline' },
    { id: 'accessories', name: 'Accessories', icon: 'bag-outline' },
    { id: 'clothing', name: 'Clothing', icon: 'shirt-outline' },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? demoProducts 
    : demoProducts.filter(product => product.category === selectedCategory);

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleEditProduct = (productId: string) => {
    navigation.navigate('EditProduct', { productId });
  };

  // Vendor flow does not need a product detail page

  const handleToggleAvailability = (productId: string) => {
    Alert.alert(
      'Toggle Availability',
      'Do you want to change the availability of this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          // Here you would update the product availability in your backend
          Alert.alert('Success', 'Product availability updated!');
        }},
      ]
    );
  };

  // Clicking image opens 3D viewer directly

  const handleOpen3DViewer = (product: VendorProduct) => {
    const url = product.modelUrl;
    if (url) {
      setSelectedModelUrl(url);
      setShow3DViewer(true);
    } else {
      Alert.alert('3D Model Unavailable', 'This product does not have a 3D model yet.');
    }
  };

  const handleClose3DViewer = () => {
    setShow3DViewer(false);
    setSelectedModelUrl(null);
  };

  const renderProductCard = ({ item }: { item: VendorProduct }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => handleOpen3DViewer(item)} style={{ flex: 1 }}>
          <Image 
            defaultSource={require('../../../assets/splash-icon.png')}
            source={imageErrorMap[item.id] || !item.images[0] ? { uri: getFallbackImageUrl(item) } : { uri: item.images[0] }} 
            style={styles.productImage}
            resizeMode="cover"
            onError={() => setImageErrorMap(prev => ({ ...prev, [item.id]: true }))}
          />
        </TouchableOpacity>
        <View style={styles.imageCountBadge}>
          <Text style={styles.imageCountText}>{item.images.length}</Text>
        </View>
        {(item.modelUrl || (item.threeSixtyImages && item.threeSixtyImages.length >= 8)) ? (
          <View style={styles.threeSixtyBadge}>
            <Ionicons name="refresh" size={14} color="#fff" />
            <Text style={styles.threeSixtyText}>360°</Text>
          </View>
        ) : null}
        <View style={[styles.availabilityBadge, { 
          backgroundColor: item.isAvailable ? COLORS.success : COLORS.error 
        }]}>
          <Text style={styles.availabilityText}>
            {item.isAvailable ? 'Available' : 'Out of Stock'}
          </Text>
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        {/* 3D view opens on image tap; button removed for cleaner UI */}
        <Text style={styles.productCategory}>
          Category: {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>
        <Text style={styles.productDate}>
          Added: {item.createdAt.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.productActions}>
        {/* Removed View action for vendor */}
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditProduct(item.id)}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.warning} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleToggleAvailability(item.id)}
        >
          <Ionicons 
            name={item.isAvailable ? "close-circle-outline" : "checkmark-circle-outline"} 
            size={20} 
            color={item.isAvailable ? COLORS.error : COLORS.success} 
          />
          <Text style={styles.actionText}>
            {item.isAvailable ? 'Disable' : 'Enable'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>My Products</Text>
          <Text style={styles.subtitle}>Manage your product catalog</Text>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Ionicons name="add" size={24} color={COLORS.background} />
          <Text style={styles.addButtonText}>Add New Product</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={20} 
                color={selectedCategory === category.id ? COLORS.background : COLORS.primary} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <View style={styles.productsContainer}>
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>
            {selectedCategory === 'all' ? 'All Products' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
          </Text>
          <Text style={styles.productsCount}>{filteredProducts.length} products</Text>
        </View>

        {filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Products Found</Text>
            <Text style={styles.emptyStateText}>
              {selectedCategory === 'all' 
                ? 'You haven\'t added any products yet.' 
                : `No products found in ${selectedCategory} category.`
              }
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddProduct}>
              <Text style={styles.emptyStateButtonText}>Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* 3D Model Viewer Modal */}
      <Modal visible={show3DViewer} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleClose3DViewer}>
        {selectedModelUrl && (
          <ModelViewer3D modelUrl={selectedModelUrl} onClose={handleClose3DViewer} title="Product 3D Preview" />
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 0,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  addButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginLeft: SPACING.xs,
  },
  categoryContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  categoryTextActive: {
    color: COLORS.background,
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  productsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  productsCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  productsList: {
    paddingBottom: SPACING.xl,
  },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    height: 200,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  threeSixtyBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
  },
  threeSixtyText: {
    color: '#fff',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  imageCountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.background + 'CC',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  imageCountText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  availabilityBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  availabilityText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.background,
  },
  productInfo: {
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
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  modelButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  modelButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  productCategory: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.xs,
  },
  productDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  productActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyStateButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});

export default VendorProductsScreen;

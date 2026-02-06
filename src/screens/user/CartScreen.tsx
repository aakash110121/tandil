import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  brand?: string;
  quantity: number;
}

const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  
  // Fallback image component
  const FallbackImage = ({ uri, style }: { uri: string; style: any }) => {
    const [currentUri, setCurrentUri] = useState(uri);
    const fallback = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=60';
    return (
      <Image
        source={{ uri: currentUri }}
        style={style}
        onError={() => setCurrentUri(fallback)}
      />
    );
  };
  
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      productId: 'product_001',
      name: 'Organic Fertilizer 5kg',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1615486363561-9be0d9e74075?auto=format&fit=crop&w=400&q=60&v=cart1',
      category: 'Fertilizer',
      brand: 'GreenFarm',
      quantity: 1,
    },
    {
      id: '2',
      productId: 'product_004',
      name: 'Drip Irrigation Kit',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=60&v=cart2',
      category: 'Irrigation',
      brand: 'AquaFlow',
      quantity: 2,
    },
  ]);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    Alert.alert(
      t('cart.removeTitle'),
      t('cart.removeBody'),
      [
        { text: t('cart.cancel'), style: 'cancel' },
        {
          text: t('cart.remove'),
          style: 'destructive',
          onPress: () => {
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
          },
        },
      ]
    );
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    return cartItems.reduce((total, item) => {
      if (item.originalPrice) {
        return total + ((item.originalPrice - item.price) * item.quantity);
      }
      return total;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const shipping = subtotal > 0 ? 9.99 : 0;
    return subtotal + shipping;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert(t('cart.emptyCartTitle'), t('cart.emptyCartBody'));
      return;
    }
    navigation.navigate('Checkout', { cartItems, total: calculateTotal() });
  };

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartItem}>
      <FallbackImage uri={item.image} style={styles.itemImage} />
      
      <View style={styles.itemContent}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.itemDetails}>
          <View style={styles.itemSpecs}>
            {item.category && <Text style={styles.itemSpec}>{t('cart.category')}: {item.category}</Text>}
            {item.brand && <Text style={styles.itemSpec}>{t('cart.brand')}: {item.brand}</Text>}
          </View>
          
          <View style={styles.itemPrice}>
            <Text style={styles.currentPrice}>{t('orders.currency', { defaultValue: 'AED' })} {item.price}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>{t('orders.currency', { defaultValue: 'AED' })} {item.originalPrice}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.itemActions}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={COLORS.text} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title={t('cart.title')} 
        showBack={true}
        showCart={true}
      />

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyStateTitle}>{t('cart.emptyTitle')}</Text>
          <Text style={styles.emptyStateText}>{t('cart.emptyText')}</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Main' as never, { screen: 'Home' } as never)}
          >
            <Text style={styles.shopButtonText}>{t('cart.startShopping')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Cart Items */}
          <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
            {cartItems.map(renderCartItem)}
          </ScrollView>

          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <Text style={styles.summaryTitle}>{t('cart.orderSummary')}</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
              <Text style={styles.summaryValue}>{t('orders.currency', { defaultValue: 'AED' })} {calculateSubtotal().toFixed(2)}</Text>
            </View>
            
            {calculateDiscount() > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('cart.discount')}</Text>
                <Text style={[styles.summaryValue, styles.discountText]}>
                  -{t('orders.currency', { defaultValue: 'AED' })} {calculateDiscount().toFixed(2)}
                </Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.shipping')}</Text>
              <Text style={styles.summaryValue}>
                {calculateSubtotal() > 0 ? `${t('orders.currency', { defaultValue: 'AED' })} 9.99` : t('cart.free')}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('cart.total')}</Text>
              <Text style={styles.totalValue}>{t('orders.currency', { defaultValue: 'AED' })} {calculateTotal().toFixed(2)}</Text>
            </View>
          </View>

          {/* Checkout Button */}
          <View style={styles.checkoutContainer}>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>{t('cart.proceed', { amount: `${t('orders.currency', { defaultValue: 'AED' })} ${calculateTotal().toFixed(2)}` })}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
            </TouchableOpacity>
          </View>
        </>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  shopButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.background,
  },
  cartList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  itemSpecs: {
    flex: 1,
  },
  itemSpec: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  itemPrice: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityButton: {
    padding: SPACING.sm,
    minWidth: 32,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: SPACING.sm,
  },
  orderSummary: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  discountText: {
    color: COLORS.success,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  checkoutContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  checkoutButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.background,
  },
});

export default CartScreen;

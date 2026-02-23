import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import { getShopSettings, ShopSettings } from '../../services/shopSettingsService';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'cash';
  name: string;
  icon: string;
  last4?: string;
}

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const { cartItems = [], total: routeTotal = 0 } = route.params || { cartItems: [], total: 0 };
  
  const [currentStep, setCurrentStep] = useState<'address' | 'payment' | 'review'>('address');
  const [loading, setLoading] = useState(false);
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: 'Ahmed Hassan',
    phone: '+971501234567',
    street: 'Sheikh Zayed Road',
    city: 'Dubai',
    state: 'Dubai',
    zipCode: '12345',
    country: 'UAE',
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('paypal');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'paypal',
      type: 'paypal',
      name: t('checkout.paypal'),
      icon: 'logo-paypal',
    },
    {
      id: 'cash',
      type: 'cash',
      name: t('checkout.cashOnDelivery'),
      icon: 'cash-outline',
    },
  ];

  const calculateSubtotal = () => {
    const items: CartItem[] = (cartItems || []) as CartItem[];
    return items.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const items: CartItem[] = (cartItems || []) as CartItem[];
    return items.reduce((acc: number, item: CartItem) => {
      if (item.originalPrice) {
        return acc + ((item.originalPrice - item.price) * item.quantity);
      }
      return acc;
    }, 0);
  };

  useEffect(() => {
    let cancelled = false;
    getShopSettings().then((s) => {
      if (!cancelled) setShopSettings(s);
    });
    return () => { cancelled = true; };
  }, []);

  useFocusEffect(
    useCallback(() => {
      getShopSettings().then(setShopSettings);
    }, [])
  );

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const shippingAmount = shopSettings?.shipping_amount ?? 0;
  const taxPercent = shopSettings?.tax_percent ?? 0;
  const taxAmount = Math.round((subtotal - discount) * (taxPercent / 100) * 100) / 100;
  const total = Math.round((subtotal - discount + shippingAmount + taxAmount) * 100) / 100;
  const currency = shopSettings?.currency ?? 'AED';

  const handlePlaceOrder = () => {
    setLoading(true);
    
    // Simulate order processing
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        t('checkout.placedTitle'),
        t('checkout.placedBody'),
        [
          { text: t('checkout.viewOrders'), onPress: () => navigation.navigate('OrderHistory') },
        { text: t('checkout.continueShopping'), onPress: () => navigation.navigate('Main' as never, { screen: 'Home' } as never) },
        ]
      );
    }, 2000);
  };

  const renderAddressForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('checkout.shippingAddress')}</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('checkout.fullName')}</Text>
        <TextInput
          style={styles.input}
          value={shippingAddress.fullName}
          onChangeText={(text) => setShippingAddress(prev => ({ ...prev, fullName: text }))}
          placeholder={t('checkout.fullName')}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('checkout.phoneNumber')}</Text>
        <TextInput
          style={styles.input}
          value={shippingAddress.phone}
          onChangeText={(text) => setShippingAddress(prev => ({ ...prev, phone: text }))}
          placeholder={t('checkout.phoneNumber')}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>{t('checkout.streetAddress')}</Text>
        <TextInput
          style={styles.input}
          value={shippingAddress.street}
          onChangeText={(text) => setShippingAddress(prev => ({ ...prev, street: text }))}
          placeholder={t('checkout.streetAddress')}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.sm }]}>
          <Text style={styles.label}>{t('checkout.city')}</Text>
          <TextInput
            style={styles.input}
            value={shippingAddress.city}
            onChangeText={(text) => setShippingAddress(prev => ({ ...prev, city: text }))}
            placeholder={t('checkout.city')}
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: SPACING.sm }]}>
          <Text style={styles.label}>{t('checkout.state')}</Text>
          <TextInput
            style={styles.input}
            value={shippingAddress.state}
            onChangeText={(text) => setShippingAddress(prev => ({ ...prev, state: text }))}
            placeholder={t('checkout.state')}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.sm }]}>
          <Text style={styles.label}>{t('checkout.zipCode')}</Text>
          <TextInput
            style={styles.input}
            value={shippingAddress.zipCode}
            onChangeText={(text) => setShippingAddress(prev => ({ ...prev, zipCode: text }))}
            placeholder={t('checkout.zipCode')}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: SPACING.sm }]}>
          <Text style={styles.label}>{t('checkout.country')}</Text>
          <TextInput
            style={styles.input}
            value={shippingAddress.country}
            onChangeText={(text) => setShippingAddress(prev => ({ ...prev, country: text }))}
            placeholder={t('checkout.country')}
          />
        </View>
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>

      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethod,
            selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
          ]}
          onPress={() => setSelectedPaymentMethod(method.id)}
        >
          <View style={styles.paymentMethodContent}>
            <View style={styles.paymentMethodIcon}>
              <Ionicons name={method.icon as any} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodName}>{method.name}</Text>
              {method.last4 && (
                <Text style={styles.paymentMethodDetails}>•••• {method.last4}</Text>
              )}
            </View>
          </View>
          <View style={[
            styles.paymentMethodRadio,
            selectedPaymentMethod === method.id && styles.selectedRadio,
          ]}>
            {selectedPaymentMethod === method.id && (
              <View style={styles.radioDot} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOrderReview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('checkout.orderReview')}</Text>
      
      {/* Order Items */}
      <View style={styles.orderItems}>
        {cartItems.map((item: any) => (
          <View key={item.id} style={styles.orderItem}>
            <Image source={{ uri: item.image }} style={styles.orderItemImage} />
            <View style={styles.orderItemContent}>
              <Text style={styles.orderItemName}>{item.name}</Text>
              <Text style={styles.orderItemSpecs}>
                {t('checkout.qty')} {item.quantity}
              </Text>
              <Text style={styles.orderItemPrice}>{t('orders.currency', { defaultValue: 'AED' })} {(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Shipping Address */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>{t('checkout.reviewShippingAddress')}</Text>
        <Text style={styles.reviewText}>
          {shippingAddress.fullName}{'\n'}
          {shippingAddress.street}{'\n'}
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}{'\n'}
          {shippingAddress.country}{'\n'}
          {shippingAddress.phone}
        </Text>
      </View>

      {/* Payment Method */}
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>{t('checkout.reviewPaymentMethod')}</Text>
        <Text style={styles.reviewText}>
          {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
        </Text>
      </View>
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          currentStep === 'address' && styles.activeStepCircle,
        ]}>
          <Text style={[
            styles.stepNumber,
            currentStep === 'address' && styles.activeStepNumber,
          ]}>1</Text>
        </View>
        <Text style={[
          styles.stepLabel,
          currentStep === 'address' && styles.activeStepLabel,
        ]}>{t('checkout.addressStep')}</Text>
      </View>
      
      <View style={styles.stepLine} />
      
      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          currentStep === 'payment' && styles.activeStepCircle,
        ]}>
          <Text style={[
            styles.stepNumber,
            currentStep === 'payment' && styles.activeStepNumber,
          ]}>2</Text>
        </View>
        <Text style={[
          styles.stepLabel,
          currentStep === 'payment' && styles.activeStepLabel,
        ]}>{t('checkout.paymentStep')}</Text>
      </View>
      
      <View style={styles.stepLine} />
      
      <View style={styles.stepContainer}>
        <View style={[
          styles.stepCircle,
          currentStep === 'review' && styles.activeStepCircle,
        ]}>
          <Text style={[
            styles.stepNumber,
            currentStep === 'review' && styles.activeStepNumber,
          ]}>3</Text>
        </View>
        <Text style={[
          styles.stepLabel,
          currentStep === 'review' && styles.activeStepLabel,
        ]}>{t('checkout.reviewStep')}</Text>
      </View>
    </View>
  );

  const getNextStep = () => {
    switch (currentStep) {
      case 'address':
        return 'payment';
      case 'payment':
        return 'review';
      default:
        return null;
    }
  };

  const handleNext = () => {
    const nextStep = getNextStep();
    if (nextStep) {
      setCurrentStep(nextStep as any);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'payment':
        setCurrentStep('address');
        break;
      case 'review':
        setCurrentStep('payment');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <Header 
        title={t('checkout.title')} 
        showBack={true}
      />

      {/* Step Indicator */}
      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 'address' && renderAddressForm()}
        {currentStep === 'payment' && renderPaymentMethods()}
        {currentStep === 'review' && renderOrderReview()}

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>{t('cart.orderSummary')}</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
            <Text style={styles.summaryValue}>{currency} {subtotal.toFixed(2)}</Text>
          </View>
          
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.discount')}</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>
                -{currency} {discount.toFixed(2)}
              </Text>
            </View>
          )}
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.shipping')}</Text>
            <Text style={styles.summaryValue}>
              {shippingAmount === 0 ? t('cart.free', 'Free') : `${currency} ${shippingAmount.toFixed(2)}`}
            </Text>
          </View>
          
          {taxAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.tax', 'Tax')}</Text>
              <Text style={styles.summaryValue}>{currency} {taxAmount.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>{currency} {total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {currentStep !== 'address' && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>{t('checkout.back')}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === 'review' && styles.placeOrderButton,
          ]}
          onPress={currentStep === 'review' ? handlePlaceOrder : handleNext}
          disabled={loading}
        >
            <Text style={styles.nextButtonText}>
              {loading ? t('checkout.processing') : 
               currentStep === 'review' ? t('checkout.placeOrder') : t('checkout.next')}
            </Text>
          {currentStep !== 'review' && (
            <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
          )}
        </TouchableOpacity>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  activeStepCircle: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  activeStepNumber: {
    color: COLORS.background,
  },
  stepLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  activeStepLabel: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  selectedPaymentMethod: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  paymentMethodDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  paymentMethodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  paypalSubSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  paypalSubTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  paypalSubOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  paypalSubOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paypalSubHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  paypalOrDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  paypalOrLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  paypalOrText: {
    marginHorizontal: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  cardFormSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cardFormTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cardRow: {
    flexDirection: 'row',
  },
  reviewCardDetails: {
    marginTop: SPACING.sm,
  },
  orderItems: {
    marginBottom: SPACING.lg,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  orderItemContent: {
    flex: 1,
  },
  orderItemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  orderItemSpecs: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  orderItemPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  reviewSection: {
    marginBottom: SPACING.lg,
  },
  reviewSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reviewText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  orderSummary: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
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
  bottomActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  nextButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  placeOrderButton: {
    backgroundColor: COLORS.success,
  },
  nextButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.background,
  },
});

export default CheckoutScreen;

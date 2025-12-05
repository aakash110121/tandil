import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useAppStore } from '../../store';
import { useTranslation } from 'react-i18next';

const OrderSummaryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;
  const { orders } = useAppStore();
  const { t, i18n } = useTranslation();

  const order = orders.find(o => o.id === orderId) || {
    id: orderId,
    serviceId: 'service_001',
    status: 'confirmed',
    totalAmount: 49.99,
    createdAt: new Date(),
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    address: {
      id: 'address_001',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    paymentMethod: 'card',
    specialInstructions: 'Please be careful with the leather shoes',
    tracking: [
      {
        id: '1',
        status: 'confirmed',
        timestamp: new Date(),
        message: 'Order confirmed and scheduled',
      },
    ],
  };

  const service = {
    id: order.serviceId,
    name: 'Premium Shoe Cleaning',
    description: 'Deep cleaning and conditioning for leather shoes',
    price: order.totalAmount,
    duration: 90,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'confirmed': return COLORS.info;
      case 'assigned': return COLORS.primary;
      case 'in_progress': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'delivered': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title={t('orderSummary.title')} 
        showBack={true}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {t(`orders.status.${order.status}`, { defaultValue: getStatusLabel(order.status) })}
              </Text>
            </View>
            <Text style={styles.orderId}>{t('orderSummary.orderId', { id: order.id, defaultValue: `Order #${order.id}` })}</Text>
          </View>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString(i18n.language)} {new Date(order.createdAt).toLocaleTimeString(i18n.language)}
          </Text>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orderSummary.serviceDetails')}</Text>
          <View style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{t(`services.items.${service.id}.name`, { defaultValue: service.name })}</Text>
              <Text style={styles.serviceDescription}>{t(`services.items.${service.id}.description`, { defaultValue: service.description })}</Text>
              <View style={styles.serviceDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{service.duration} {t('services.details.minutes', { defaultValue: 'minutes' })}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>
                    {new Date(order.scheduledDate).toLocaleDateString(i18n.language)}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.servicePrice}>{t('orders.currency', { defaultValue: 'AED' })} {service.price}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orderSummary.deliveryAddress')}</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addressTitle}>{t('orderSummary.deliveryAddress')}</Text>
            </View>
            <Text style={styles.addressText}>
              {order.address.street}
            </Text>
            <Text style={styles.addressText}>
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </Text>
            <Text style={styles.addressText}>
              {order.address.country}
            </Text>
          </View>
        </View>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('orderSummary.specialInstructions')}</Text>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
            </View>
          </View>
        )}

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orderSummary.paymentInformation')}</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>{t('orderSummary.paymentMethod')}</Text>
              <Text style={styles.paymentValue}>
                {order.paymentMethod === 'card' ? t('booking.paymentMethods.card') : 
                 order.paymentMethod === 'cash' ? t('booking.paymentMethods.cash') : t('booking.paymentMethods.wallet')}
              </Text>
            </View>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>{t('orderSummary.paymentStatus')}</Text>
              <Text style={[styles.paymentValue, { color: COLORS.success }]}>{t('orderSummary.paid')}</Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orderSummary.summaryTitle')}</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('orderSummary.serviceCost')}</Text>
              <Text style={styles.summaryValue}>{t('orders.currency', { defaultValue: 'AED' })} {service.price}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('orderSummary.tax')}</Text>
              <Text style={styles.summaryValue}>{t('orders.currency', { defaultValue: 'AED' })} 0.00</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('orderSummary.deliveryFee')}</Text>
              <Text style={styles.summaryValue}>{t('orders.currency', { defaultValue: 'AED' })} 0.00</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryTotalLabel}>{t('orderSummary.total')}</Text>
              <Text style={styles.summaryTotalValue}>{t('orders.currency', { defaultValue: 'AED' })} {order.totalAmount}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title={t('orderSummary.trackOrder')}
          onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
          style={styles.trackButton}
        />
        <Button
          title={t('orderSummary.contactSupport')}
          variant="outline"
          onPress={() => navigation.navigate('HelpCenter')}
          style={styles.supportButton}
        />
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
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  orderId: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  orderDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  serviceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  serviceDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  serviceDetails: {
    gap: SPACING.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  servicePrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addressTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  addressText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  instructionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  instructionsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  paymentLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  paymentValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  summaryItem: {
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
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  summaryTotalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  summaryTotalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  bottomActions: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  trackButton: {
    width: '100%',
  },
  supportButton: {
    width: '100%',
  },
});

export default OrderSummaryScreen;

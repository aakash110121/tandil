import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import BeforeAfter from '../../components/common/BeforeAfter';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { useTranslation } from 'react-i18next';
import Header from '../../components/common/Header';
import { StatusStepper } from '../../components/common/StatusStepper';
import { useAppStore } from '../../store';

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;
  const { t, i18n } = useTranslation();
  const { orders } = useAppStore();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const foundOrder = orders.find(o => o.id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      // Mock order for demo
      setOrder({
        id: orderId,
        serviceId: 'service_001',
        status: 'in_progress',
        totalAmount: 25.00,
        createdAt: new Date('2024-01-15T10:30:00'),
        scheduledDate: new Date('2024-01-16T14:00:00'),
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        technicianId: 'tech_001',
        tracking: [
          {
            id: '1',
            status: 'pending',
            timestamp: new Date('2024-01-15T10:30:00'),
            message: 'Order placed successfully',
          },
          {
            id: '2',
            status: 'confirmed',
            timestamp: new Date('2024-01-15T11:00:00'),
            message: 'Order confirmed by technician',
          },
          {
            id: '3',
            status: 'assigned',
            timestamp: new Date('2024-01-15T13:30:00'),
            message: 'Technician assigned to your order',
          },
          {
            id: '4',
            status: 'in_progress',
            timestamp: new Date('2024-01-16T14:00:00'),
            message: 'Technician is on the way',
          },
          {
            id: '5',
            status: 'completed',
            timestamp: new Date('2024-01-16T16:30:00'),
            message: 'Maintenance completed with before/after photos',
            photos: {
              before: [
                'https://images.unsplash.com/photo-1522156373667-4c7234bbd804?w=400',
                'https://images.unsplash.com/photo-1523345863763-5b0b9c4a9d17?w=400',
              ],
              after: [
                'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400',
                'https://images.unsplash.com/photo-1501004314611-86f71c37b23a?w=400',
              ],
            },
          },
        ],
        paymentMethod: 'card',
        specialInstructions: 'Please call before arrival',
      });
    }
  }, [orderId, orders]);

  const handleContactTechnician = () => {
    Alert.alert('Contact Technician', 'Calling technician...');
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleRateService = () => {
    console.log('OrderTrackingScreen: Rate service pressed, navigating to RateReview');
    try {
      navigation.navigate('RateReview', { orderId });
    } catch (error) {
      console.error('OrderTrackingScreen: Navigation error to RateReview:', error);
    }
  };

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      <Header 
        title={t('tabs.orders')} 
        showBack={true}
        rightComponent={
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusHeader}>
            <Text style={styles.orderId}>{t('orders.orderNumber', { id: order.id, defaultValue: `Order #${order.id}` })}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                 {t(`orders.status.${order.status}`, { defaultValue: order.status.replace('_', ' ').toUpperCase() })}
              </Text>
            </View>
          </View>
          
          <StatusStepper tracking={order.tracking} currentStatus={order.status} />
        </View>

        {/* Before / After Photos (horizontal sliders) */}
        {(() => {
          const withPhotos = order.tracking?.find((t: any) => t.photos && (t.photos.before?.length || t.photos.after?.length));
          // Tree maintenance demo fallbacks (used if technician photos are not present)
          const demoBefore = [
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60',
            'https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&q=60',
          ];
          const demoAfter = [
            'https://images.unsplash.com/photo-1520975954732-35dd22f4758f?auto=format&fit=crop&w=1200&q=60',
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=60',
          ];

          const beforeList: string[] = withPhotos?.photos?.before ?? demoBefore;
          const afterList: string[] = withPhotos?.photos?.after ?? demoAfter;
          const count = Math.min(beforeList.length, afterList.length);

          const screenWidth = Dimensions.get('window').width;
          const horizontalPadding = SPACING.lg * 2; // approximate section padding
          const cardWidth = Math.min(screenWidth - horizontalPadding, 320);

          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('home.maintenancePhotos')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row' }}>
                  {beforeList.slice(0, count).map((bUri, idx) => (
                    <View key={`ot-ba-${idx}`} style={{ width: cardWidth, marginRight: SPACING.md }}>
                      <BeforeAfter
                        beforeUri={bUri}
                        afterUri={afterList[idx]}
                        width={cardWidth}
                        aspectRatio={0.6}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          );
        })()}

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.orderSummary')}</Text>
          <View style={styles.orderCard}>
            <View style={styles.orderInfo}>
              <View style={styles.orderInfoItem}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
                <View style={styles.orderInfoText}>
                  <Text style={styles.orderInfoLabel}>{t('booking.date')}</Text>
                  <Text style={styles.orderInfoValue}>
                    {(() => {
                      const sched = order.scheduledDate ? new Date(order.scheduledDate) : null;
                      if (!sched || isNaN(sched.getTime())) return '-';
                      try {
                        const { default: i18next } = require('i18next');
                        const lang = i18next?.language || 'en';
                        const resolved = lang === 'ar' ? 'ar-EG' : lang === 'ur' ? 'ur-PK' : 'en-US';
                        return `${sched.toLocaleDateString(resolved)} ${sched.toLocaleTimeString(resolved, { hour: '2-digit', minute: '2-digit' })}`;
                      } catch {
                        return sched.toString();
                      }
                    })()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.orderInfoItem}>
                <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
                <View style={styles.orderInfoText}>
                  <Text style={styles.orderInfoLabel}>{t('booking.addressSection')}</Text>
                  <Text style={styles.orderInfoValue}>
                    {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}
                  </Text>
                </View>
              </View>

              <View style={styles.orderInfoItem}>
                <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} />
                <View style={styles.orderInfoText}>
                  <Text style={styles.orderInfoLabel}>{t('booking.payment')}</Text>
                  <Text style={styles.orderInfoValue}>
                    {t(`booking.paymentMethods.${order.paymentMethod}`, { defaultValue: order.paymentMethod })}
                  </Text>
                </View>
              </View>

              <View style={styles.orderInfoItem}>
                <Ionicons name="cash-outline" size={20} color={COLORS.textSecondary} />
                <View style={styles.orderInfoText}>
                  <Text style={styles.orderInfoLabel}>{t('booking.total')}</Text>
                  <Text style={styles.orderInfoValue}>${order.totalAmount.toFixed(2)}</Text>
                </View>
              </View>

              {order.specialInstructions && (
                <View style={styles.orderInfoItem}>
                  <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                  <View style={styles.orderInfoText}>
                  <Text style={styles.orderInfoLabel}>{t('booking.special')}</Text>
                    <Text style={styles.orderInfoValue}>{order.specialInstructions}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Technician Info */}
        {order.technicianId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('tabs.orders')}</Text>
            <View style={styles.technicianCard}>
              <View style={styles.technicianInfo}>
                <View style={styles.technicianAvatar}>
                  <Text style={styles.technicianInitial}>T</Text>
                </View>
                <View style={styles.technicianDetails}>
                  <Text style={styles.technicianName}>John Smith</Text>
                 <Text style={styles.technicianRating}>⭐ 4.8 {t('orders.reviewsCount', { count: 120 })}</Text>
                 <Text style={styles.technicianStatus}>{t('services.details.related')}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactTechnician}>
                <Ionicons name="call" size={20} color={COLORS.background} />
                <Text style={styles.contactButtonText}>{t('common.call', { defaultValue: 'Call' })}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Estimated Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.estimatedTime')}</Text>
          <View style={styles.timeCard}>
            <View style={styles.timeInfo}>
              <Ionicons name="time-outline" size={24} color={COLORS.primary} />
              <View style={styles.timeText}>
                <Text style={styles.estimatedTime}>15-20 {t('booking.minutes')}</Text>
                <Text style={styles.timeDescription}>{t('common.eta')}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {order.status === 'completed' ? (
            <TouchableOpacity style={styles.rateButton} onPress={handleRateService}>
            <Ionicons name="star-outline" size={20} color={COLORS.background} />
              <Text style={styles.rateButtonText}>{t('orders.rateService')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
            <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
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
  moreButton: {
    padding: SPACING.sm,
  },
  statusContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  orderId: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
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
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  orderInfo: {
    gap: SPACING.md,
  },
  orderInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  orderInfoText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  orderInfoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  orderInfoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  photosRow: {
    marginTop: SPACING.sm,
  },
  photoGroupTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  technicianCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  technicianAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  technicianInitial: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  technicianDetails: {
    flex: 1,
  },
  technicianName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  technicianRating: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  technicianStatus: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.xs,
  },
  timeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  estimatedTime: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  timeDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  bottomActions: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.error + '20',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.sm,
  },
});

export default OrderTrackingScreen;

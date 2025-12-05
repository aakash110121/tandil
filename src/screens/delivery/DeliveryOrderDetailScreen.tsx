import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Button } from '../../components/common/Button';
import { useTranslation } from 'react-i18next';

const DeliveryOrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const { deliveryId } = route.params;
  
  const [deliveryStatus, setDeliveryStatus] = useState('in_progress');
  const [isLoading, setIsLoading] = useState(false);

  const delivery = {
    id: deliveryId,
    customerName: 'Sarah Johnson',
    customerPhone: '+1 (555) 123-4567',
    customerEmail: 'sarah.johnson@email.com',
    pickupAddress: '123 Main Street, New York, NY 10001',
    dropoffAddress: '456 Oak Avenue, Brooklyn, NY 11201',
    scheduledTime: '2:30 PM',
    estimatedDuration: '25 minutes',
    distance: '3.2 km',
    specialInstructions: 'Please ring the doorbell and wait for customer to open the door.',
    earnings: 12.50,
    status: deliveryStatus,
    createdAt: '2024-01-15',
  };

  const handleStatusUpdate = (newStatus: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setDeliveryStatus(newStatus);
      setIsLoading(false);
      Alert.alert(t('delivery.detail.alerts.statusUpdatedTitle'), t('delivery.detail.alerts.statusUpdatedBody', { status: t(`orders.status.${newStatus}`, { defaultValue: newStatus.replace('_', ' ') }) }));
    }, 1000);
  };

  const handleCompleteDelivery = () => {
    Alert.alert(
      t('delivery.detail.alerts.completeTitle'),
      t('delivery.detail.alerts.completeBody'),
      [
        { text: t('delivery.detail.alerts.cancel'), style: 'cancel' },
        { text: t('delivery.detail.alerts.complete'), onPress: () => handleStatusUpdate('completed') },
      ]
    );
  };

  const handleCallCustomer = () => {
    Alert.alert(t('delivery.detail.alerts.callTitle'), t('delivery.detail.alerts.callBody', { name: delivery.customerName, phone: delivery.customerPhone }));
  };

  const handleMessageCustomer = () => {
    Alert.alert(t('delivery.detail.alerts.messageTitle'), t('delivery.detail.alerts.messageBody', { name: delivery.customerName }));
  };

  const handleAcceptOrder = () => {
    Alert.alert(
      t('delivery.detail.alerts.acceptTitle'),
      t('delivery.detail.alerts.acceptBody'),
      [
        { text: t('delivery.detail.alerts.cancel'), style: 'cancel' },
        { text: t('delivery.detail.alerts.accept'), onPress: () => handleStatusUpdate('in_progress') },
      ]
    );
  };

  const handleRejectOrder = () => {
    Alert.alert(
      t('delivery.detail.alerts.rejectTitle'),
      t('delivery.detail.alerts.rejectBody'),
      [
        { text: t('delivery.detail.alerts.cancel'), style: 'cancel' },
        { text: t('delivery.detail.alerts.reject'), style: 'destructive', onPress: () => handleStatusUpdate('cancelled') },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return COLORS.info;
      case 'in_progress': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('delivery.detail.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Delivery Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(deliveryStatus) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(deliveryStatus) }]}>
                {t(`orders.status.${deliveryStatus}`, { defaultValue: getStatusLabel(deliveryStatus) })}
              </Text>
            </View>
            <Text style={styles.deliveryId}>{t('delivery.detail.deliveryId', { id: delivery.id })}</Text>
          </View>
          <Text style={styles.deliveryDate}>{delivery.createdAt}</Text>
        </View>

        {/* Pickup Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('delivery.detail.pickupLocation')}</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="location-outline" size={20} color={COLORS.success} />
              <Text style={styles.addressTitle}>{t('delivery.detail.pickupAddress')}</Text>
            </View>
            <Text style={styles.addressText}>{delivery.pickupAddress}</Text>
            <TouchableOpacity style={styles.directionsButton}>
              <Ionicons name="navigate-outline" size={16} color={COLORS.success} />
              <Text style={styles.directionsText}>{t('delivery.detail.navigateToPickup')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropoff Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('delivery.detail.dropoffLocation')}</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.addressTitle}>{t('delivery.detail.dropoffAddress')}</Text>
            </View>
            <Text style={styles.addressText}>{delivery.dropoffAddress}</Text>
            <TouchableOpacity style={styles.directionsButton}>
              <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
              <Text style={styles.directionsText}>{t('delivery.detail.navigateToDropoff')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('delivery.detail.customerInformation')}</Text>
          <View style={styles.customerCard}>
            <Text style={styles.customerName}>{delivery.customerName}</Text>
            <View style={styles.customerDetails}>
              <TouchableOpacity style={styles.customerDetail} onPress={handleCallCustomer}>
                <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                <Text style={styles.customerDetailText}>{delivery.customerPhone}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.customerDetail} onPress={handleMessageCustomer}>
                <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
                <Text style={styles.customerDetailText}>{delivery.customerEmail}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('delivery.detail.deliveryDetails')}</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{t('delivery.detail.scheduled', { time: delivery.scheduledTime })}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="timer-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{t('delivery.detail.duration', { duration: delivery.estimatedDuration })}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="navigate-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{t('delivery.detail.distance', { distance: delivery.distance })}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{t('delivery.detail.earnings', { amount: `${t('orders.currency', { defaultValue: 'AED' })} ${delivery.earnings}` })}</Text>
            </View>
          </View>
        </View>

        {/* Special Instructions */}
        {delivery.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('delivery.detail.specialInstructions')}</Text>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsText}>{delivery.specialInstructions}</Text>
            </View>
          </View>
        )}

        {/* Delivery Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('delivery.detail.actions')}</Text>
          <View style={styles.actionsContainer}>
            {deliveryStatus === 'assigned' && (
              <>
                <Button
                  title={t('delivery.detail.acceptOrder')}
                  onPress={handleAcceptOrder}
                  disabled={isLoading}
                  style={styles.actionButton}
                />
                <Button
                  title={t('delivery.detail.rejectOrder')}
                  variant="outline"
                  onPress={handleRejectOrder}
                  disabled={isLoading}
                  style={styles.actionButton}
                />
              </>
            )}
            
            {deliveryStatus === 'in_progress' && (
              <Button
                title={t('delivery.detail.completeDelivery')}
                onPress={handleCompleteDelivery}
                disabled={isLoading}
                style={styles.actionButton}
              />
            )}
            
            <Button
              title={t('delivery.detail.callCustomer')}
              variant="outline"
              onPress={handleCallCustomer}
              style={styles.actionButton}
            />
            
            <Button
              title={t('delivery.detail.messageCustomer')}
              variant="outline"
              onPress={handleMessageCustomer}
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
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
  deliveryId: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  deliveryDate: {
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
    marginBottom: SPACING.sm,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  directionsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.xs,
  },
  customerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  customerName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  customerDetails: {
    gap: SPACING.sm,
  },
  customerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerDetailText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
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
  actionsContainer: {
    gap: SPACING.md,
  },
  actionButton: {
    width: '100%',
  },
  rejectButton: {
    borderColor: COLORS.error,
  },
});

export default DeliveryOrderDetailScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { useTranslation } from 'react-i18next';

const MapViewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [selectedDelivery, setSelectedDelivery] = useState('delivery_001');

  const deliveries = [
    {
      id: 'delivery_001',
      customerName: 'Sarah Johnson',
      pickupAddress: '123 Main Street, New York, NY',
      dropoffAddress: '456 Oak Avenue, Brooklyn, NY',
      status: 'in_progress',
      distance: '3.2 km',
      estimatedTime: '25 min',
      earnings: 12.50,
    },
    {
      id: 'delivery_002',
      customerName: 'Mike Davis',
      pickupAddress: '789 Pine Street, Queens, NY',
      dropoffAddress: '321 Elm Street, Bronx, NY',
      status: 'assigned',
      distance: '4.8 km',
      estimatedTime: '35 min',
      earnings: 15.75,
    },
    {
      id: 'delivery_003',
      customerName: 'Lisa Wilson',
      pickupAddress: '555 Broadway, Manhattan, NY',
      dropoffAddress: '777 5th Avenue, Manhattan, NY',
      status: 'assigned',
      distance: '2.1 km',
      estimatedTime: '15 min',
      earnings: 10.25,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return COLORS.info;
      case 'in_progress': return COLORS.primary;
      case 'completed': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const renderDeliveryItem = (delivery: any) => (
    <TouchableOpacity
      key={delivery.id}
      style={[
        styles.deliveryItem,
        selectedDelivery === delivery.id && styles.selectedDeliveryItem
      ]}
      onPress={() => setSelectedDelivery(delivery.id)}
    >
      <View style={styles.deliveryHeader}>
        <Text style={styles.customerName}>{delivery.customerName}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(delivery.status) + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(delivery.status) }
          ]}>
            {getStatusLabel(delivery.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.addressContainer}>
        <View style={styles.addressItem}>
          <Ionicons name="location-outline" size={14} color={COLORS.success} />
          <Text style={styles.addressText}>{t('delivery.map.pickup')}: {delivery.pickupAddress}</Text>
        </View>
        <View style={styles.addressItem}>
          <Ionicons name="location" size={14} color={COLORS.primary} />
          <Text style={styles.addressText}>{t('delivery.map.dropoff')}: {delivery.dropoffAddress}</Text>
        </View>
      </View>
      
      <View style={styles.deliveryFooter}>
        <View style={styles.deliveryInfo}>
          <Ionicons name="navigate-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.deliveryInfoText}>{delivery.distance}</Text>
        </View>
        <View style={styles.deliveryInfo}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.deliveryInfoText}>{delivery.estimatedTime}</Text>
        </View>
        <View style={styles.deliveryInfo}>
          <Ionicons name="cash-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.deliveryInfoText}>${delivery.earnings}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>{t('delivery.map.title')}</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.mapPlaceholderText}>{t('delivery.map.placeholderTitle')}</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            {t('delivery.map.placeholderSubtitle')}
          </Text>
        </View>
        
        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControl}>
            <Ionicons name="locate" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControl}>
            <Ionicons name="layers" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControl}>
            <Ionicons name="navigate" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Delivery List */}
      <View style={styles.deliveryListContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t('delivery.map.listTitle')}</Text>
          <Text style={styles.deliveryCount}>{t('delivery.map.count', { count: deliveries.length })}</Text>
        </View>
        
        <ScrollView 
          style={styles.deliveryList}
          showsVerticalScrollIndicator={false}
        >
          {deliveries.map(renderDeliveryItem)}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
                      onPress={() => navigation.navigate('OrderDetail', { 
            deliveryId: selectedDelivery 
          })}
        >
          <Ionicons name="list" size={20} color={COLORS.background} />
          <Text style={styles.quickActionText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAction}
                      onPress={() => navigation.navigate('OrderStatus')}
        >
          <Ionicons name="refresh" size={20} color={COLORS.background} />
          <Text style={styles.quickActionText}>Update Status</Text>
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
  settingsButton: {
    padding: SPACING.sm,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  mapPlaceholderText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  mapPlaceholderSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  mapControls: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    gap: SPACING.sm,
  },
  mapControl: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryListContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingTop: SPACING.lg,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  listTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  deliveryCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  deliveryList: {
    maxHeight: 300,
    paddingHorizontal: SPACING.lg,
  },
  deliveryItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  selectedDeliveryItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  addressContainer: {
    marginBottom: SPACING.sm,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  addressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryInfoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.background,
  },
});

export default MapViewScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Button } from '../../components/common/Button';

const DeliveryOrderStatusScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const deliveries = [
    {
      id: 'delivery_001',
      customerName: 'Sarah Johnson',
      pickupAddress: '123 Main Street, New York, NY',
      dropoffAddress: '456 Oak Avenue, Brooklyn, NY',
      status: 'in_progress',
      scheduledTime: '2:30 PM',
      estimatedDuration: '25 min',
      distance: '3.2 km',
      earnings: 12.50,
      createdAt: '2024-01-15',
    },
    {
      id: 'delivery_002',
      customerName: 'Mike Davis',
      pickupAddress: '789 Pine Street, Queens, NY',
      dropoffAddress: '321 Elm Street, Bronx, NY',
      status: 'assigned',
      scheduledTime: '4:15 PM',
      estimatedDuration: '35 min',
      distance: '4.8 km',
      earnings: 15.75,
      createdAt: '2024-01-15',
    },
    {
      id: 'delivery_003',
      customerName: 'Lisa Wilson',
      pickupAddress: '555 Broadway, Manhattan, NY',
      dropoffAddress: '777 5th Avenue, Manhattan, NY',
      status: 'completed',
      scheduledTime: '1:00 PM',
      estimatedDuration: '15 min',
      distance: '2.1 km',
      earnings: 10.25,
      createdAt: '2024-01-15',
    },
  ];

  const filteredDeliveries = deliveries.filter(delivery => {
    if (selectedFilter === 'all') return true;
    return delivery.status === selectedFilter;
  });

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

  const handleStatusUpdate = (deliveryId: string, newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Update delivery ${deliveryId} to ${newStatus.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => Alert.alert('Success', 'Delivery status updated successfully!')
        },
      ]
    );
  };

  const renderDeliveryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.deliveryCard}
                  onPress={() => navigation.navigate('OrderDetail', { deliveryId: item.id })}
    >
      <View style={styles.deliveryHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.addressContainer}>
        <View style={styles.addressItem}>
          <Ionicons name="location-outline" size={14} color={COLORS.success} />
          <Text style={styles.addressText}>Pickup: {item.pickupAddress}</Text>
        </View>
        <View style={styles.addressItem}>
          <Ionicons name="location" size={14} color={COLORS.primary} />
          <Text style={styles.addressText}>Dropoff: {item.dropoffAddress}</Text>
        </View>
      </View>
      
      <View style={styles.deliveryInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.scheduledTime}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="timer-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.estimatedDuration}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="navigate-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.distance}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="cash-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>${item.earnings}</Text>
        </View>
      </View>
      
      {item.status === 'assigned' && (
        <View style={styles.actionButtons}>
          <Button
            title="Start Delivery"
            onPress={() => handleStatusUpdate(item.id, 'in_progress')}
            style={styles.actionButton}
          />
        </View>
      )}
      
      {item.status === 'in_progress' && (
        <View style={styles.actionButtons}>
          <Button
            title="Complete Delivery"
            onPress={() => handleStatusUpdate(item.id, 'completed')}
            style={styles.actionButton}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFilterTab = (filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterTab,
        selectedFilter === filter.id && styles.filterTabActive
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text style={[
        styles.filterTabText,
        selectedFilter === filter.id && styles.filterTabTextActive
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const filterTabs = [
    { id: 'all', label: 'All Deliveries' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  const stats = {
    total: deliveries.length,
    assigned: deliveries.filter(d => d.status === 'assigned').length,
    inProgress: deliveries.filter(d => d.status === 'in_progress').length,
    completed: deliveries.filter(d => d.status === 'completed').length,
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
        <Text style={styles.headerTitle}>Order Status</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="list-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={COLORS.info} />
            <Text style={styles.statValue}>{stats.assigned}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="navigate-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterTabs.map(renderFilterTab)}
          </ScrollView>
        </View>

        {/* Deliveries List */}
        <View style={styles.deliveriesContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Deliveries</Text>
            <Text style={styles.deliveryCount}>{filteredDeliveries.length} deliveries</Text>
          </View>
          
          {filteredDeliveries.length > 0 ? (
            <FlatList
              data={filteredDeliveries}
              renderItem={renderDeliveryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bicycle-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Deliveries Found</Text>
              <Text style={styles.emptyStateDescription}>
                No deliveries match your current filters.
              </Text>
            </View>
          )}
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
  refreshButton: {
    padding: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  filterTabTextActive: {
    color: COLORS.background,
  },
  deliveriesContainer: {
    paddingHorizontal: SPACING.lg,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  deliveryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
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
  deliveryInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  actionButtons: {
    marginTop: SPACING.sm,
  },
  actionButton: {
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default DeliveryOrderStatusScreen;

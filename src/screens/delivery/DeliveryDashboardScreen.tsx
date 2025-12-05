import React from 'react';
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
import { useTranslation } from 'react-i18next';

const DeliveryDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const deliveryPerson = {
    id: 'delivery_001',
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@shozy.com',
    phone: '+1 (555) 987-6543',
    rating: 4.9,
    completedDeliveries: 89,
    totalEarnings: 1247.30,
    thisWeekEarnings: 156.75,
    isOnline: true,
  };

  const currentDeliveries = [
    {
      id: 'delivery_001',
      customerName: 'Sarah Johnson',
      pickupAddress: '123 Main St, New York, NY',
      dropoffAddress: '456 Oak Ave, Brooklyn, NY',
      scheduledTime: '2:30 PM',
      status: 'in_progress',
      estimatedDuration: '25 min',
      distance: '3.2 km',
    },
    {
      id: 'delivery_002',
      customerName: 'Mike Davis',
      pickupAddress: '789 Pine St, Queens, NY',
      dropoffAddress: '321 Elm St, Bronx, NY',
      scheduledTime: '4:15 PM',
      status: 'assigned',
      estimatedDuration: '35 min',
      distance: '4.8 km',
    },
  ];

  const recentDeliveries = [
    {
      id: 'delivery_003',
      customerName: 'Lisa Wilson',
      pickupAddress: '123 Main St, New York, NY',
      dropoffAddress: '456 Oak Ave, Brooklyn, NY',
      completedAt: '2024-01-15',
      earnings: 12.50,
      rating: 5,
    },
    {
      id: 'delivery_004',
      customerName: 'David Brown',
      pickupAddress: '789 Pine St, Queens, NY',
      dropoffAddress: '321 Elm St, Bronx, NY',
      completedAt: '2024-01-14',
      earnings: 15.75,
      rating: 4,
    },
  ];

  const renderCurrentDelivery = ({ item }: { item: any }) => (
    <View style={styles.deliveryCard}>
      <TouchableOpacity
        style={styles.deliveryContent}
        onPress={() => navigation.navigate('OrderDetail', { deliveryId: item.id })}
      >
        <View style={styles.deliveryHeader}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'in_progress' ? COLORS.primary + '20' : COLORS.info + '20' }
          ]}>
            <Text style={[
              styles.deliveryStatusText,
              { color: item.status === 'in_progress' ? COLORS.primary : COLORS.info }
            ]}>
              {item.status === 'in_progress' ? 'In Progress' : 'Assigned'}
            </Text>
          </View>
        </View>
        
        <View style={styles.addressContainer}>
          <View style={styles.addressItem}>
            <Ionicons name="location-outline" size={16} color={COLORS.success} />
            <Text style={styles.addressText}>Pickup: {item.pickupAddress}</Text>
          </View>
          <View style={styles.addressItem}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.addressText}>Dropoff: {item.dropoffAddress}</Text>
          </View>
        </View>
        
        <View style={styles.deliveryFooter}>
          <View style={styles.deliveryInfo}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.deliveryInfoText}>{item.scheduledTime}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Ionicons name="timer-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.deliveryInfoText}>{item.estimatedDuration}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Ionicons name="navigate-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.deliveryInfoText}>{item.distance}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Accept/Reject Buttons for Assigned Orders */}
      {item.status === 'assigned' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => {
              Alert.alert(
                'Accept Order',
                `Accept delivery for ${item.customerName}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Accept', onPress: () => {
                    // Handle accept logic here
                    Alert.alert('Order Accepted', 'Order has been accepted successfully!');
                  }},
                ]
              );
            }}
          >
            <Ionicons name="checkmark" size={16} color={COLORS.background} />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => {
              Alert.alert(
                'Reject Order',
                `Reject delivery for ${item.customerName}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reject', style: 'destructive', onPress: () => {
                    // Handle reject logic here
                    Alert.alert('Order Rejected', 'Order has been rejected.');
                  }},
                ]
              );
            }}
          >
            <Ionicons name="close" size={16} color={COLORS.background} />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderRecentDelivery = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.recentDeliveryCard}>
      <View style={styles.recentDeliveryHeader}>
        <Text style={styles.recentCustomerName}>{item.customerName}</Text>
        <Text style={styles.recentEarnings}>${item.earnings}</Text>
      </View>
      
      <View style={styles.addressContainer}>
        <View style={styles.addressItem}>
          <Ionicons name="location-outline" size={14} color={COLORS.success} />
          <Text style={styles.recentAddressText}>Pickup: {item.pickupAddress}</Text>
        </View>
        <View style={styles.addressItem}>
          <Ionicons name="location" size={14} color={COLORS.primary} />
          <Text style={styles.recentAddressText}>Dropoff: {item.dropoffAddress}</Text>
        </View>
      </View>
      
      <View style={styles.recentDeliveryFooter}>
        <Text style={styles.recentDate}>{item.completedAt}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={COLORS.warning} />
          <Text style={styles.ratingText}>{item.rating}/5</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good afternoon!</Text>
            <Text style={styles.deliveryPersonName}>{deliveryPerson.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{deliveryPerson.name.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.onlineStatus}>
          <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>${deliveryPerson.thisWeekEarnings}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{deliveryPerson.completedDeliveries}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>{deliveryPerson.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Current Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Deliveries</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {currentDeliveries.length > 0 ? (
            <FlatList
              data={currentDeliveries}
              renderItem={renderCurrentDelivery}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bicycle-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateText}>No active deliveries</Text>
              <Text style={styles.emptyStateSubtext}>You'll see assigned deliveries here</Text>
            </View>
          )}
        </View>

        {/* Recent Deliveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Deliveries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DeliveryOrderHistory')}>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={recentDeliveries}
            renderItem={renderRecentDelivery}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('MapView')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="map-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Map View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('OrderStatus')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="list-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Order Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="person-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                Alert.alert('Accept Orders', 'Navigate to accept pending orders?');
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.quickActionText}>Accept Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                Alert.alert('Reject Orders', 'Navigate to reject pending orders?');
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="close-circle-outline" size={24} color={COLORS.error} />
              </View>
              <Text style={styles.quickActionText}>Reject Orders</Text>
            </TouchableOpacity>
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
    backgroundColor: COLORS.background,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  deliveryPersonName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  profileButton: {
    padding: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
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
  deliveryStatusText: {
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
  recentDeliveryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  recentDeliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recentCustomerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  recentEarnings: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  recentAddressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  recentDeliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  deliveryContent: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.background,
  },
});

export default DeliveryDashboardScreen;

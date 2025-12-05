import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const { width } = Dimensions.get('window');

interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  productImage: string;
  quantity: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  deliveryDate?: Date;
  totalAmount: number;
  customerAddress: string;
  customerPhone: string;
}

const VendorOrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Demo orders data
  const demoOrders: VendorOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customerName: 'Ahmed Al Mansouri',
      productName: 'Premium Leather Sneakers',
      productImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      quantity: 1,
      status: 'confirmed',
      orderDate: new Date('2024-01-20'),
      deliveryDate: new Date('2024-01-22'),
      totalAmount: 0, // Free product
      customerAddress: 'Dubai Marina, Dubai, UAE',
      customerPhone: '+971 50 123 4567',
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customerName: 'Fatima Hassan',
      productName: 'Casual Canvas Shoes',
      productImage: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400',
      quantity: 1,
      status: 'shipped',
      orderDate: new Date('2024-01-19'),
      deliveryDate: new Date('2024-01-21'),
      totalAmount: 0,
      customerAddress: 'Abu Dhabi Corniche, Abu Dhabi, UAE',
      customerPhone: '+971 50 987 6543',
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customerName: 'Omar Khalil',
      productName: 'Leather Wallet',
      productImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      quantity: 1,
      status: 'delivered',
      orderDate: new Date('2024-01-18'),
      deliveryDate: new Date('2024-01-20'),
      totalAmount: 0,
      customerAddress: 'Sharjah City Center, Sharjah, UAE',
      customerPhone: '+971 50 555 1234',
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      customerName: 'Aisha Rahman',
      productName: 'Sports Socks Pack',
      productImage: 'https://images.unsplash.com/photo-1586350977771-b4b8501d4c0d?w=400',
      quantity: 2,
      status: 'pending',
      orderDate: new Date('2024-01-21'),
      totalAmount: 0,
      customerAddress: 'Ajman Corniche, Ajman, UAE',
      customerPhone: '+971 50 777 8888',
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      customerName: 'Khalid Al Zaabi',
      productName: 'Premium Leather Sneakers',
      productImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      quantity: 1,
      status: 'cancelled',
      orderDate: new Date('2024-01-17'),
      totalAmount: 0,
      customerAddress: 'Ras Al Khaimah, UAE',
      customerPhone: '+971 50 999 0000',
    },
  ];

  const statusFilters = [
    { id: 'all', name: 'All Orders', icon: 'list-outline' },
    { id: 'pending', name: 'Pending', icon: 'time-outline', color: COLORS.warning },
    { id: 'confirmed', name: 'Confirmed', icon: 'checkmark-circle-outline', color: COLORS.info },
    { id: 'shipped', name: 'Shipped', icon: 'car-outline', color: COLORS.primary },
    { id: 'delivered', name: 'Delivered', icon: 'checkmark-done-circle-outline', color: COLORS.success },
    { id: 'cancelled', name: 'Cancelled', icon: 'close-circle-outline', color: COLORS.error },
  ];

  const filteredOrders = selectedStatus === 'all' 
    ? demoOrders 
    : demoOrders.filter(order => order.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'confirmed': return COLORS.info;
      case 'shipped': return COLORS.primary;
      case 'delivered': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'shipped': return 'car-outline';
      case 'delivered': return 'checkmark-done-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-outline';
    }
  };

  const handleOrderAction = (order: VendorOrder, action: string) => {
    switch (action) {
      case 'confirm':
        Alert.alert(
          'Confirm Order',
          `Confirm order ${order.orderNumber}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Confirm', onPress: () => {
              Alert.alert('Success', 'Order confirmed successfully!');
            }},
          ]
        );
        break;
      case 'ship':
        Alert.alert(
          'Ship Order',
          `Mark order ${order.orderNumber} as shipped?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Ship', onPress: () => {
              Alert.alert('Success', 'Order marked as shipped!');
            }},
          ]
        );
        break;
      case 'view':
        navigation.navigate('OrderDetail', { orderId: order.id });
        break;
    }
  };

  const renderOrderCard = ({ item }: { item: VendorOrder }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {item.orderDate.toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons name={getStatusIcon(item.status) as any} size={16} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderContent}>
        <View style={styles.productInfo}>
          <View style={styles.productImageContainer}>
            <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.productName}
            </Text>
            <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
            <Text style={styles.freeProduct}>FREE PRODUCT</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.customerHeader}>
            <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.customerName}>{item.customerName}</Text>
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerAddress} numberOfLines={1}>
              📍 {item.customerAddress}
            </Text>
            <Text style={styles.customerPhone}>
              📞 {item.customerPhone}
            </Text>
          </View>
        </View>

        {item.deliveryDate && (
          <View style={styles.deliveryInfo}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.success} />
            <Text style={styles.deliveryText}>
              Delivered on {item.deliveryDate.toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleOrderAction(item, 'view')}
        >
          <Ionicons name="eye-outline" size={20} color={COLORS.info} />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleOrderAction(item, 'confirm')}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
            <Text style={styles.actionText}>Confirm</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'confirmed' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleOrderAction(item, 'ship')}
          >
            <Ionicons name="car-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Ship</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Product Orders</Text>
        <Text style={styles.subtitle}>Manage your product distribution orders</Text>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedStatus === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setSelectedStatus(filter.id)}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={20} 
                color={selectedStatus === filter.id ? COLORS.background : filter.color || COLORS.primary} 
              />
              <Text style={[
                styles.filterText,
                selectedStatus === filter.id && styles.filterTextActive
              ]}>
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{filteredOrders.length}</Text>
            <Text style={styles.summaryLabel}>Total Orders</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {filteredOrders.filter(order => order.status === 'delivered').length}
            </Text>
            <Text style={styles.summaryLabel}>Delivered</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {filteredOrders.filter(order => order.status === 'pending').length}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Orders List */}
      <View style={styles.ordersContainer}>
        <View style={styles.ordersHeader}>
          <Text style={styles.ordersTitle}>
            {selectedStatus === 'all' ? 'All Orders' : `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Orders`}
          </Text>
          <Text style={styles.ordersCount}>{filteredOrders.length} orders</Text>
        </View>

        {filteredOrders.length > 0 ? (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ordersList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Orders Found</Text>
            <Text style={styles.emptyStateText}>
              {selectedStatus === 'all' 
                ? 'You don\'t have any orders yet.' 
                : `No ${selectedStatus} orders found.`
              }
            </Text>
          </View>
        )}
      </View>
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
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  filterContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
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
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  filterTextActive: {
    color: COLORS.background,
  },
  summaryContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  ordersContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  ordersTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  ordersCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  ordersList: {
    paddingBottom: SPACING.xl,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  orderDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.xs,
  },
  orderContent: {
    padding: SPACING.md,
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  productImageContainer: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  quantity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  freeProduct: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    alignSelf: 'flex-start',
  },
  customerInfo: {
    marginBottom: SPACING.md,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  customerName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  customerDetails: {
    marginLeft: SPACING.lg,
  },
  customerAddress: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  customerPhone: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  deliveryText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.xs,
  },
  orderActions: {
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
    lineHeight: 22,
  },
});

export default VendorOrdersScreen;

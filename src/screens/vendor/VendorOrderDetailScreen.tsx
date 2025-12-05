import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const VendorOrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params || {};

  const [orderStatus, setOrderStatus] = useState('confirmed');

  // Demo order data
  const orderData = {
    id: 'ORD-2024-001',
    orderNumber: '#2024001',
    customerName: 'Sarah Al Mansouri',
    customerPhone: '+971 50 987 6543',
    customerEmail: 'sarah@email.com',
    customerAddress: 'Villa 15, Palm Jumeirah, Dubai, UAE',
    productName: 'Premium Leather Sneakers',
    productImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    quantity: 1,
    status: 'confirmed',
    orderDate: '2024-01-15 14:30',
    deliveryDate: '2024-01-18',
    totalAmount: 'AED 299',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    notes: 'Please deliver in the afternoon between 2-4 PM',
    trackingNumber: 'TRK-2024-001',
  };

  const statusSteps = [
    { id: 'pending', name: 'Pending', icon: 'time-outline', color: COLORS.warning },
    { id: 'confirmed', name: 'Confirmed', icon: 'checkmark-circle-outline', color: COLORS.info },
    { id: 'processing', name: 'Processing', icon: 'cog-outline', color: COLORS.primary },
    { id: 'shipped', name: 'Shipped', icon: 'car-outline', color: COLORS.success },
    { id: 'delivered', name: 'Delivered', icon: 'checkmark-done-circle', color: COLORS.success },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'confirmed': return COLORS.info;
      case 'processing': return COLORS.primary;
      case 'shipped': return COLORS.success;
      case 'delivered': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'processing': return 'cog-outline';
      case 'shipped': return 'car-outline';
      case 'delivered': return 'checkmark-done-circle';
      default: return 'help-outline';
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to update the order status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: () => {
          setOrderStatus(newStatus);
          Alert.alert('Success', `Order status updated to ${newStatus}`);
        }},
      ]
    );
  };

  const handleContactCustomer = () => {
    Alert.alert(
      'Contact Customer',
      'Choose contact method:',
      [
        { text: 'Call', onPress: () => Alert.alert('Call', `Calling ${orderData.customerPhone}`) },
        { text: 'Email', onPress: () => Alert.alert('Email', `Opening email to ${orderData.customerEmail}`) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderStatusStep = (step: any, index: number) => {
    const isActive = orderStatus === step.id;
    const isCompleted = statusSteps.findIndex(s => s.id === orderStatus) >= index;
    
    return (
      <View key={step.id} style={styles.statusStep}>
        <View style={[
          styles.statusIcon,
          isActive && { backgroundColor: step.color + '20' },
          isCompleted && { backgroundColor: step.color + '20' }
        ]}>
          <Ionicons 
            name={step.icon as any} 
            size={20} 
            color={isActive || isCompleted ? step.color : COLORS.textSecondary} 
          />
        </View>
        <View style={styles.statusInfo}>
          <Text style={[
            styles.statusName,
            isActive && { color: step.color },
            isCompleted && { color: step.color }
          ]}>
            {step.name}
          </Text>
          {isActive && (
            <Text style={[styles.statusActive, { color: step.color }]}>
              Current Status
            </Text>
          )}
        </View>
        {index < statusSteps.length - 1 && (
          <View style={[
            styles.statusLine,
            isCompleted && { backgroundColor: step.color }
          ]} />
        )}
      </View>
    );
  };

  const renderInfoRow = (label: string, value: string, icon?: string) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        {icon && <Ionicons name={icon as any} size={16} color={COLORS.textSecondary} />}
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => Alert.alert('More Options', 'Additional order actions coming soon!')}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Order Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.statusContainer}>
            {statusSteps.map(renderStatusStep)}
          </View>
        </View>

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.orderInfoContainer}>
            {renderInfoRow('Order ID', orderData.orderNumber, 'receipt-outline')}
            {renderInfoRow('Order Date', orderData.orderDate, 'calendar-outline')}
            {renderInfoRow('Delivery Date', orderData.deliveryDate, 'calendar-outline')}
            {renderInfoRow('Payment Method', orderData.paymentMethod, 'card-outline')}
            {renderInfoRow('Payment Status', orderData.paymentStatus, 'checkmark-circle-outline')}
            {renderInfoRow('Tracking Number', orderData.trackingNumber, 'location-outline')}
          </View>
        </View>

        {/* Product Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>
          <View style={styles.productCard}>
            <Image source={{ uri: orderData.productImage }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{orderData.productName}</Text>
              <Text style={styles.productQuantity}>Quantity: {orderData.quantity}</Text>
              <Text style={styles.productPrice}>{orderData.totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerInfoContainer}>
            {renderInfoRow('Name', orderData.customerName, 'person-outline')}
            {renderInfoRow('Phone', orderData.customerPhone, 'call-outline')}
            {renderInfoRow('Email', orderData.customerEmail, 'mail-outline')}
            {renderInfoRow('Address', orderData.customerAddress, 'location-outline')}
          </View>
        </View>

        {/* Order Notes */}
        {orderData.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{orderData.notes}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleContactCustomer}
          >
            <Ionicons name="call-outline" size={24} color={COLORS.background} />
            <Text style={styles.primaryButtonText}>Contact Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => Alert.alert('Print Invoice', 'Invoice printing feature coming soon!')}
          >
            <Ionicons name="print-outline" size={24} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Print Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => Alert.alert('Download', 'Download feature coming soon!')}
          >
            <Ionicons name="download-outline" size={24} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Download Order</Text>
          </TouchableOpacity>
        </View>

        {/* Status Update Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Order Status</Text>
          <View style={styles.statusUpdateGrid}>
            {statusSteps.map((step) => (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.statusUpdateButton,
                  orderStatus === step.id && { backgroundColor: step.color + '20', borderColor: step.color }
                ]}
                onPress={() => handleStatusUpdate(step.id)}
              >
                <Ionicons 
                  name={step.icon as any} 
                  size={20} 
                  color={orderStatus === step.id ? step.color : COLORS.textSecondary} 
                />
                <Text style={[
                  styles.statusUpdateText,
                  orderStatus === step.id && { color: step.color }
                ]}>
                  {step.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  statusContainer: {
    position: 'relative',
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statusActive: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statusLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 40,
    backgroundColor: COLORS.border,
  },
  orderInfoContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoLabelText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productQuantity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  customerInfoContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionsSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.background,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.primary,
  },
  statusUpdateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statusUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
  },
  statusUpdateText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
});

export default VendorOrderDetailScreen;

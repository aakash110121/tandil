import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderStatus } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, ORDER_STATUS_LABELS } from '../../constants';
import { useTranslation } from 'react-i18next';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return COLORS.warning;
    case 'confirmed':
      return COLORS.info;
    case 'assigned':
      return COLORS.primary;
    case 'in_progress':
      return COLORS.primary;
    case 'completed':
      return COLORS.success;
    case 'delivered':
      return COLORS.success;
    case 'cancelled':
      return COLORS.error;
    default:
      return COLORS.textSecondary;
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'time-outline';
    case 'confirmed':
      return 'checkmark-circle-outline';
    case 'assigned':
      return 'person-outline';
    case 'in_progress':
      return 'construct-outline';
    case 'completed':
      return 'checkmark-done-circle-outline';
    case 'delivered':
      return 'checkmark-done-circle';
    case 'cancelled':
      return 'close-circle-outline';
    default:
      return 'help-circle-outline';
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';
  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);
  const { t, i18n } = useTranslation();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, isCompact && styles.compactContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>{t('orders.orderNumber', { id: order.id, defaultValue: `#${order.id}` })}</Text>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Ionicons name={statusIcon as any} size={16} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {t(`orders.status.${order.status}`, { defaultValue: ORDER_STATUS_LABELS[order.status] })}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.amount}>{t('orders.currency', { defaultValue: 'AED' })} {order.totalAmount}</Text>
          <Text style={styles.address} numberOfLines={1}>
            {t('addresses.sheikhZayedDubai', { defaultValue: `${order.address.street}, ${order.address.city}` })}
          </Text>
        
        {!isCompact && (
          <View style={styles.details}>
            <View style={styles.detail}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>
                {formatDate(order.scheduledDate)}
              </Text>
            </View>
            <View style={styles.detail}>
              <Ionicons name="card-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>
                {order.paymentMethod ? t(`booking.paymentMethods.${order.paymentMethod}`, { defaultValue: order.paymentMethod }) : 'N/A'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {order.specialInstructions && !isCompact && (
        <View style={styles.instructions}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.warning} />
          <Text style={styles.instructionsText} numberOfLines={2}>
            {t(`orders.special.${order.id}`, { defaultValue: order.specialInstructions })}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  compactContainer: {
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  content: {
    marginBottom: SPACING.sm,
  },
  amount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  address: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  details: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  instructionsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
}); 
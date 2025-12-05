import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus, OrderTracking } from '../../types';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, ORDER_STATUS_LABELS } from '../../constants';
import { useTranslation } from 'react-i18next';

interface StatusStepperProps {
  tracking: OrderTracking[];
  currentStatus: OrderStatus;
}

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'assigned',
  'in_progress',
  'completed',
  'delivered',
];

const getStatusIcon = (status: OrderStatus, isCompleted: boolean, isCurrent: boolean) => {
  if (isCompleted) {
    return 'checkmark-circle';
  }
  
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
    default:
      return 'help-circle-outline';
  }
};

const getStatusColor = (status: OrderStatus, isCompleted: boolean, isCurrent: boolean) => {
  if (isCompleted) {
    return COLORS.success;
  }
  if (isCurrent) {
    return COLORS.primary;
  }
  return COLORS.textSecondary;
};

export const StatusStepper: React.FC<StatusStepperProps> = ({
  tracking,
  currentStatus,
}) => {
  const { t, i18n } = useTranslation();
  const currentStatusIndex = ORDER_STATUSES.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {ORDER_STATUSES.map((status, index) => {
        const isCompleted = index <= currentStatusIndex;
        const isCurrent = status === currentStatus;
        const isLast = index === ORDER_STATUSES.length - 1;
        
        const statusColor = getStatusColor(status, isCompleted, isCurrent);
        const statusIcon = getStatusIcon(status, isCompleted, isCurrent);
        
        const trackingItem = tracking.find(item => item.status === status);
        const timestamp = trackingItem?.timestamp;
        const message = trackingItem?.message;

        return (
          <View key={status} style={styles.stepContainer}>
            <View style={styles.stepContent}>
              <View style={[styles.iconContainer, { backgroundColor: statusColor + '20' }]}>
                <Ionicons name={statusIcon as any} size={20} color={statusColor} />
              </View>
              
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, { color: statusColor }]}> 
                  {t(`orders.status.${status}`, { defaultValue: ORDER_STATUS_LABELS[status] })}
                </Text>
                {(message || t(`orders.messages.${status}`, { defaultValue: '' })) && (
                  <Text style={styles.stepMessage} numberOfLines={2}>
                    {t(`orders.messages.${status}`, { defaultValue: message })}
                  </Text>
                )}
                {timestamp && (
                  <Text style={styles.stepTime}>
                    {new Date(timestamp).toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'ur' ? 'ur-PK' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </View>
            </View>
            
            {!isLast && (
              <View style={[
                styles.connector,
                { backgroundColor: isCompleted ? COLORS.success : COLORS.border }
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  stepContainer: {
    position: 'relative',
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginBottom: SPACING.xs,
  },
  stepMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 16,
  },
  stepTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  connector: {
    position: 'absolute',
    left: 19,
    top: 60,
    width: 2,
    height: 30,
    zIndex: -1,
  },
}); 
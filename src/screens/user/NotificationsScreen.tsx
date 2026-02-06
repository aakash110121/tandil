import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const { notifications, markNotificationAsRead, clearNotifications } = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.isRead;
    return notification.type === selectedFilter;
  });

  const renderNotification = ({ item }: { item: any }) => (
    <View style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}>
      <TouchableOpacity
        style={styles.notificationMain}
        onPress={() => markNotificationAsRead(item.id)}
      >
        <View style={styles.notificationIcon}>
          <Ionicons 
            name={
              item.type === 'supervisor_report' ? 'document-text-outline' :
              item.type === 'order' ? 'bag-outline' : 
              item.type === 'promotion' ? 'pricetag-outline' :
              item.type === 'tip' ? 'bulb-outline' :
              'notifications-outline'
            } 
            size={24} 
            color={COLORS.primary} 
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
      
      {/* Buy Products Button for Supervisor Reports */}
      {item.type === 'supervisor_report' && item.recommendations && (
        <TouchableOpacity
          style={styles.buyProductsButton}
          onPress={() => navigation.navigate('Main' as never, { screen: 'Store' } as never)}
        >
          <Ionicons name="cart-outline" size={18} color={COLORS.background} />
          <Text style={styles.buyProductsButtonText}>{t('notifications.buyRecommendedProducts')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const mockNotifications = [
    {
      id: '1',
      title: 'Supervisor Report Received',
      message: 'Your palm tree requires organic fertilizer and additional watering. View recommended products.',
      type: 'supervisor_report',
      recommendations: ['fertilizer', 'watering'],
      isRead: false,
      createdAt: new Date('2024-01-15T10:30:00'),
    },
    {
      id: '2',
      title: 'Agricultural Tip',
      message: 'Best season for pollinating palm trees. End of the month is ideal for fertilizing date palms.',
      type: 'tip',
      isRead: false,
      createdAt: new Date('2024-01-15T08:00:00'),
    },
    {
      id: '3',
      title: 'Visit Scheduled',
      message: 'Your tree watering service is scheduled for tomorrow at 8:00 AM.',
      type: 'order',
      isRead: true,
      createdAt: new Date('2024-01-14T15:20:00'),
    },
    {
      id: '4',
      title: 'Special Offer',
      message: 'Get 20% off on organic fertilizer this week!',
      type: 'promotion',
      isRead: false,
      createdAt: new Date('2024-01-13T14:45:00'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header 
        title={t('notifications.title')} 
        showBack={true}
        rightComponent={
          <TouchableOpacity style={styles.clearButton} onPress={clearNotifications}>
            <Text style={styles.clearButtonText}>{t('notifications.clearAll')}</Text>
          </TouchableOpacity>
        }
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'all', label: t('notifications.filters.all') },
            { id: 'unread', label: t('notifications.filters.unread') },
            { id: 'order', label: t('notifications.filters.order') },
            { id: 'promotion', label: t('notifications.filters.promotion') },
          ].map((filter) => (
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
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={mockNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsList}
      />
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
  clearButton: {
    padding: SPACING.sm,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: FONT_WEIGHTS.medium,
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
  notificationsList: {
    paddingHorizontal: SPACING.lg,
  },
  notificationItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  unreadNotification: {
    backgroundColor: COLORS.primary + '10',
  },
  notificationMain: {
    flexDirection: 'row',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  buyProductsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  buyProductsButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.background,
  },
});

export default NotificationsScreen;


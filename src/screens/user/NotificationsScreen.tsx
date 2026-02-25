import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import { getNotifications, type UserNotification } from '../../services/userService';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [list, setList] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotifications(page);
      setList(result.list);
    } catch (e) {
      setError(t('notifications.errorLoad', 'Failed to load notifications.'));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications(1);
    }, [loadNotifications])
  );

  const filteredList = list.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return true; // API has no read status; show all
    return item.type === selectedFilter;
  });

  const formatDate = (createdAt: string) => dayjs(createdAt).format('D/M/YYYY');

  const renderNotification = ({ item }: { item: UserNotification }) => (
    <View style={styles.notificationItem}>
      <TouchableOpacity style={styles.notificationMain} activeOpacity={0.7}>
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
          <Text style={styles.notificationTime}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>

      {item.type === 'supervisor_report' && (
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

  const handleClearAll = () => {
    setList([]);
    loadNotifications(1);
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('notifications.title')}
        showBack={true}
        rightComponent={
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Text style={styles.clearButtonText}>{t('notifications.clearAll')}</Text>
          </TouchableOpacity>
        }
      />

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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredList.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('notifications.empty', 'No notifications.')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          renderItem={renderNotification}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.notificationsList}
        />
      )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default NotificationsScreen;


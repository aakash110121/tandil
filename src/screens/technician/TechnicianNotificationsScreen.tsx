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
import { getTechnicianNotifications, clearTechnicianNotifications, markTechnicianNotificationRead, markTechnicianNotificationsReadAll, type TechnicianNotification } from '../../services/technicianService';

const TechnicianNotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [list, setList] = useState<TechnicianNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const loadNotifications = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTechnicianNotifications({ per_page: 20, page });
      setList(result.list);
    } catch (e) {
      setError(t('notifications.errorLoad'));
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
    if (selectedFilter === 'unread') return true;
    return item.type === selectedFilter;
  });

  const formatDate = (createdAt: string) => dayjs(createdAt).format('D/M/YYYY');

  const getIconForType = (type: string) => {
    switch (type) {
      case 'supervisor_report': return 'document-text-outline';
      case 'order': return 'bag-outline';
      case 'promotion': return 'pricetag-outline';
      case 'tip': return 'bulb-outline';
      default: return 'notifications-outline';
    }
  };

  const handleMarkAsRead = useCallback(async (notificationId: number) => {
    try {
      const res = await markTechnicianNotificationRead(notificationId);
      if (res.success) {
        loadNotifications(1);
      }
    } catch (_) {
      // ignore; list unchanged
    }
  }, [loadNotifications]);

  const renderNotification = ({ item }: { item: TechnicianNotification }) => (
    <View style={styles.notificationItem}>
      <TouchableOpacity
        style={styles.notificationMain}
        activeOpacity={0.7}
        onPress={() => handleMarkAsRead(item.id)}
      >
        <View style={styles.notificationIcon}>
          <Ionicons
            name={getIconForType(item.type) as any}
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
    </View>
  );

  const handleClearAll = useCallback(async () => {
    if (clearing || list.length === 0) return;
    setClearing(true);
    setError(null);
    try {
      const res = await clearTechnicianNotifications();
      if (res.success) {
        setList([]);
        loadNotifications(1);
      } else {
        setError(res.message ?? t('notifications.errorClear'));
      }
    } catch (e) {
      setError(t('notifications.errorClear'));
    } finally {
      setClearing(false);
    }
  }, [loadNotifications, t, clearing, list.length]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (markingAllRead || list.length === 0) return;
    setMarkingAllRead(true);
    setError(null);
    try {
      const res = await markTechnicianNotificationsReadAll();
      if (res.success) {
        loadNotifications(1);
      } else {
        setError(res.message ?? t('notifications.errorMarkAllRead'));
      }
    } catch (e) {
      setError(t('notifications.errorMarkAllRead'));
    } finally {
      setMarkingAllRead(false);
    }
  }, [loadNotifications, t, markingAllRead, list.length]);

  return (
    <View style={styles.container}>
      <Header
        title={t('notifications.title')}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={handleMarkAllAsRead}
              disabled={markingAllRead || list.length === 0}
            >
              {markingAllRead ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={[styles.markAllReadText, (markingAllRead || list.length === 0) && styles.headerActionDisabled]}>
                  {t('notifications.markAllRead')}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
              disabled={clearing || list.length === 0}
            >
              {clearing ? (
                <ActivityIndicator size="small" color={COLORS.error} />
              ) : (
                <Text style={[styles.clearButtonText, (clearing || list.length === 0) && styles.clearButtonDisabled]}>
                  {t('notifications.clearAll')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
          <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerActionButton: {
    padding: SPACING.sm,
  },
  markAllReadText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  headerActionDisabled: {
    opacity: 0.5,
  },
  clearButton: {
    padding: SPACING.sm,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: FONT_WEIGHTS.medium,
  },
  clearButtonDisabled: {
    opacity: 0.5,
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

export default TechnicianNotificationsScreen;

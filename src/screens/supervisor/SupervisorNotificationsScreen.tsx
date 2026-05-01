import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import {
  getSupervisorNotifications,
  type SupervisorNotificationItem,
} from '../../services/supervisorService';

const SupervisorNotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [list, setList] = useState<SupervisorNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSupervisorNotifications({ per_page: 20, page: 1 });
      setList(result.list);
    } catch {
      setError(t('notifications.errorLoad'));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Main');
  }, [navigation]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'report_generated':
        return 'document-text-outline';
      case 'tip_published':
        return 'bulb-outline';
      case 'admin_notification':
        return 'chatbubble-ellipses-outline';
      default:
        return 'notifications-outline';
    }
  };

  const renderNotification = ({ item }: { item: SupervisorNotificationItem }) => {
    const notificationType = item.data?.type ?? item.type ?? '';
    const title = item.data?.title || t('notifications.title');
    const message =
      item.data?.message ||
      t('notifications.defaultMessage', { defaultValue: 'You have a new notification.' });
    const isUnread = !item.read_at;
    return (
      <View style={[styles.notificationItem, isUnread && styles.notificationUnread]}>
        <View style={styles.notificationIcon}>
          <Ionicons name={getIconForType(notificationType) as any} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.notificationMessage}>{message}</Text>
          <Text style={styles.notificationTime}>{dayjs(item.created_at).format('DD MMM YYYY, hh:mm A')}</Text>
        </View>
        {isUnread ? <View style={styles.unreadDot} /> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={t('notifications.title')} showBack={true} onBackPress={handleBackPress} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : list.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
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
  notificationsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  notificationItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notificationUnread: {
    borderColor: COLORS.primary + '35',
  },
  notificationIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary + '14',
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
    marginTop: 4,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
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

export default SupervisorNotificationsScreen;

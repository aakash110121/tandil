import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants';
import {
  acceptSupervisorZoneOrderJob,
  getSupervisorZoneOrderJobs,
  rejectSupervisorZoneOrderJob,
  SupervisorZoneOrderJob,
} from '../../services/supervisorService';

const SupervisorZoneOrdersScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [jobs, setJobs] = useState<SupervisorZoneOrderJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const list = await getSupervisorZoneOrderJobs();
      setJobs(list ?? []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJobs(false);
    }, [fetchJobs])
  );

  const handleZoneJobAction = async (jobId: number, action: 'accept' | 'reject') => {
    try {
      setActionLoadingId(jobId);
      const result = action === 'accept'
        ? await acceptSupervisorZoneOrderJob(jobId)
        : await rejectSupervisorZoneOrderJob(jobId);
      if (!result.success) {
        Alert.alert(t('common.error', { defaultValue: 'Error' }), result.message || t('common.somethingWentWrong', { defaultValue: 'Something went wrong.' }));
        return;
      }
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      Alert.alert(
        action === 'accept'
          ? t('supervisorDashboard.jobAccepted', { defaultValue: 'Job accepted' })
          : t('supervisorDashboard.jobRejected', { defaultValue: 'Job rejected' }),
        result.message || (
          action === 'accept'
            ? t('supervisorDashboard.jobAcceptedMessage', { defaultValue: 'This order has been accepted successfully.' })
            : t('supervisorDashboard.jobRejectedMessage', { defaultValue: 'This order has been rejected successfully.' })
        )
      );
    } catch {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('common.somethingWentWrong', { defaultValue: 'Something went wrong.' }));
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderItem = ({ item }: { item: SupervisorZoneOrderJob }) => {
    const duration = item.duration_display || (item.duration_minutes != null ? `${Math.max(1, Math.round(item.duration_minutes / 60))} hrs` : '—');
    const city = item.city || item.location || '—';
    const address = item.address || '—';
    const clientName = item.client_name || '—';
    const taskPrice = item.price_display || item.price || '—';
    const loadingThis = actionLoadingId === item.id;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title || item.service_name || t('supervisorDashboard.orderJob', { defaultValue: 'Order Job' })}</Text>
        <Text style={styles.description}>{item.description || '—'}</Text>

        <View style={styles.detailRow}>
          <Ionicons name="timer-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{t('supervisorDashboard.durationLabel', { defaultValue: 'Duration: ' })}{duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="navigate-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{t('supervisorDashboard.locationLabel', { defaultValue: 'Location: ' })}{city}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{t('supervisorDashboard.addressLabel', { defaultValue: 'Address: ' })}{address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{t('supervisorDashboard.clientLabel', { defaultValue: 'Client: ' })}{clientName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.client_email || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.client_phone || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{t('supervisorDashboard.priceLabel', { defaultValue: 'Task Price: ' })}{taskPrice}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            disabled={loadingThis}
            onPress={() => handleZoneJobAction(item.id, 'reject')}
          >
            <Text style={styles.actionText}>{t('supervisorDashboard.reject', { defaultValue: 'Reject' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            disabled={loadingThis}
            onPress={() => handleZoneJobAction(item.id, 'accept')}
          >
            {loadingThis ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <Text style={styles.actionText}>{t('supervisorDashboard.accept', { defaultValue: 'Accept' })}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('supervisorDashboard.zoneIncomingOrders', { defaultValue: 'Zone Incoming Orders' })}</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchJobs(true)}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('supervisorDashboard.noZoneOrders', { defaultValue: 'No new zone orders right now.' })}</Text>
            </View>
          }
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  detailText: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  actionText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  emptyState: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});

export default SupervisorZoneOrdersScreen;

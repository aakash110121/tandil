import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import {
  getTechnicianRejectedJobs,
  TechnicianTodayTask,
  type TechnicianJobsPeriod,
  type GetTechnicianAcceptedJobsResult,
} from '../../services/technicianService';

function mapTaskToJob(task: TechnicianTodayTask) {
  const durationStr =
    task.duration_minutes != null
      ? `${task.duration_minutes} min`
      : (task.estimated_duration ?? task.estimatedDuration ?? '—');
  return {
    id: String(task.id),
    customerName: task.farm_name ?? task.customer_name ?? task.customerName ?? '—',
    service: task.service_name ?? task.service ?? '—',
    address: task.location ?? task.address ?? '—',
    scheduledTime: task.scheduled_time ?? task.scheduledTime ?? '—',
    estimatedDuration: durationStr,
  };
}

const PER_PAGE = 15;

const PERIOD_TABS: { id: TechnicianJobsPeriod; label: string }[] = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

const TechnicianRejectedJobsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TechnicianJobsPeriod>('month');
  const [result, setResult] = useState<GetTechnicianAcceptedJobsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadJobs = useCallback(
    async (page: number = 1, append: boolean = false, periodOverride?: TechnicianJobsPeriod) => {
      const p = periodOverride ?? period;
      if (page === 1 && !append) setLoading(true);
      else if (append) setLoadingMore(true);
      else setRefreshing(true);
      try {
        const data = await getTechnicianRejectedJobs(p, PER_PAGE, page);
        setResult(prev => {
          if (append && prev && page > 1) {
            return {
              ...data,
              list: [...prev.list, ...data.list],
            };
          }
          return data;
        });
      } catch {
        if (!append) setResult(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [period]
  );

  useFocusEffect(
    useCallback(() => {
      loadJobs(1);
    }, [loadJobs])
  );

  const onPeriodChange = (newPeriod: TechnicianJobsPeriod) => {
    setPeriod(newPeriod);
    loadJobs(1, false, newPeriod);
  };

  const handleLoadMore = () => {
    if (!result?.nextPageUrl || loadingMore || result.currentPage >= result.lastPage) return;
    loadJobs(result.currentPage + 1, true);
  };

  const jobs = (result?.list ?? []).map(mapTaskToJob);

  const renderJob = ({ item }: { item: any }) => (
    <View style={styles.jobCard}>
      <TouchableOpacity
        style={styles.jobContent}
        onPress={() => navigation.navigate('JobDetail', { orderId: item.id })}
      >
        <View style={styles.jobHeader}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.error + '20' }]}>
            <Text style={[styles.jobStatusText, { color: COLORS.error }]}>{t('technician.status.rejected')}</Text>
          </View>
        </View>

        <Text style={styles.serviceName}>{item.service}</Text>
        <Text style={styles.jobAddress}>{item.address}</Text>

        <View style={styles.jobFooter}>
          <View style={styles.jobInfo}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.jobInfoText}>{item.scheduledTime}</Text>
          </View>
          <View style={styles.jobInfo}>
            <Ionicons name="timer-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.jobInfoText}>{item.estimatedDuration.replace(/ min$/, ' ' + t('technician.min'))}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading && !result) {
    return (
      <View style={styles.container}>
        <Header title={t('technician.rejectedJobs')} showBack={true} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('technician.loadingJobs')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t('technician.rejectedJobs')} showBack={true} />

      <View style={styles.periodSection}>
        <Text style={styles.periodLabel}>{t('technician.timePeriod')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
          {PERIOD_TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.periodTab, period === tab.id && styles.periodTabActive]}
              onPress={() => onPeriodChange(tab.id)}
            >
              <Text style={[styles.periodTabText, period === tab.id && styles.periodTabTextActive]}>
                {tab.id === 'week' ? t('technician.thisWeek') : tab.id === 'month' ? t('technician.thisMonth') : t('technician.thisYear')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {jobs.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyState}>
            <Ionicons name="close-circle-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>{t('technician.noRejectedJobs')}</Text>
            <Text style={styles.emptyStateSubtext}>
              {t('technician.noRejectedJobsSubtext')}
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadJobs(1)}
              colors={[COLORS.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  periodSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  periodLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  periodScroll: {
    flexGrow: 0,
  },
  periodTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  periodTabActive: {
    backgroundColor: COLORS.primary,
  },
  periodTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  periodTabTextActive: {
    color: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  jobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  jobContent: {
    flex: 1,
  },
  jobHeader: {
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
  jobStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  serviceName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  jobAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  jobFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobInfoText: {
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
  footerLoader: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
});

export default TechnicianRejectedJobsScreen;

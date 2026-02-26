import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { getTechnicianJobs, type TechnicianJob, type TechnicianJobsPeriod, type TechnicianJobsSummary } from '../../services/technicianService';
import dayjs from 'dayjs';

function normalizeStatus(status: string | undefined): 'completed' | 'cancelled' | 'in_progress' | string {
  const s = (status ?? '').toLowerCase();
  if (s === 'completed' || s === 'done') return 'completed';
  if (s === 'cancelled' || s === 'rejected' || s === 'canceled') return 'cancelled';
  if (s === 'in_progress' || s === 'in progress') return 'in_progress';
  return s || 'completed';
}

const TechnicianOrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<TechnicianJobsPeriod>('week');
  const [jobs, setJobs] = useState<TechnicianJob[]>([]);
  const [summary, setSummary] = useState<TechnicianJobsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { list, summary: apiSummary } = await getTechnicianJobs(selectedPeriod, 15, 1);
      setJobs(list);
      setSummary(apiSummary ?? null);
    } catch {
      setJobs([]);
      setSummary(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod]);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

  useEffect(() => {
    loadJobs();
  }, [selectedPeriod]);

  const onPeriodChange = (period: TechnicianJobsPeriod) => {
    setSelectedPeriod(period);
  };

  const onFilterChange = (filter: 'all' | 'in_progress' | 'completed' | 'cancelled') => {
    setSelectedFilter(filter);
  };

  const filteredJobs = jobs.filter(job => {
    if (selectedFilter === 'all') return true;
    return normalizeStatus(job.status) === selectedFilter;
  });

  const displayJobs = filteredJobs.map(job => ({
    id: String(job.id),
    customerName: job.farm_name ?? job.client_name ?? '—',
    service: job.service_name ?? '—',
    completedAt: job.date ?? job.scheduled_date ?? job.completed_at ?? '—',
    dateFormatted: job.date ? dayjs(job.date).format('YYYY-MM-DD') : (job.scheduled_date ? dayjs(job.scheduled_date).format('YYYY-MM-DD') : '—'),
    earnings: job.price ?? 0,
    earningsDisplay: job.price_display ?? (job.price != null ? `AED ${Number(job.price).toFixed(2)}` : '—'),
    rating: job.rating ?? 0,
    status: normalizeStatus(job.status),
  }));

  const totalEarnings = summary?.total_earnings ?? displayJobs.reduce((sum, j) => sum + j.earnings, 0);
  const completedCount = summary?.jobs_completed ?? displayJobs.filter(j => j.status === 'completed').length;
  const avgRating = summary?.avg_rating ?? (displayJobs.length > 0
    ? displayJobs.reduce((sum, j) => sum + j.rating, 0) / displayJobs.length
    : 0);

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { orderId: item.id })}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.earnings}>{item.earningsDisplay}</Text>
      </View>

      <Text style={styles.serviceName}>{item.service}</Text>
      <Text style={styles.completedDate}>{item.dateFormatted}</Text>

      <View style={styles.jobFooter}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={COLORS.warning} />
          <Text style={styles.ratingText}>{item.rating}/5</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, {
            backgroundColor: item.status === 'cancelled' ? COLORS.error : item.status === 'in_progress' ? COLORS.primary : COLORS.success,
          }]} />
          <Text style={[styles.statusText, {
            color: item.status === 'cancelled' ? COLORS.error : item.status === 'in_progress' ? COLORS.primary : COLORS.success,
          }]}>
            {item.status === 'cancelled' ? 'Cancelled' : item.status === 'in_progress' ? 'In Progress' : 'Completed'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterTab = (filter: { id: 'all' | 'in_progress' | 'completed' | 'cancelled'; label: string }) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterTab,
        selectedFilter === filter.id && styles.filterTabActive
      ]}
      onPress={() => onFilterChange(filter.id)}
    >
      <Text style={[
        styles.filterTabText,
        selectedFilter === filter.id && styles.filterTabTextActive
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const renderPeriodTab = (period: { id: TechnicianJobsPeriod; label: string }) => (
    <TouchableOpacity
      key={period.id}
      style={[
        styles.periodTab,
        selectedPeriod === period.id && styles.periodTabActive
      ]}
      onPress={() => onPeriodChange(period.id)}
    >
      <Text style={[
        styles.periodTabText,
        selectedPeriod === period.id && styles.periodTabTextActive
      ]}>
        {period.label}
      </Text>
    </TouchableOpacity>
  );

  const filterTabs = [
    { id: 'all', label: 'All Jobs' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const periodTabs = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job History</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadJobs(true)} colors={[COLORS.primary]} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
            <Text style={styles.summaryValue}>AED {totalEarnings.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
          </View>

          <View style={styles.summaryCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            <Text style={styles.summaryValue}>{completedCount}</Text>
            <Text style={styles.summaryLabel}>Jobs Completed</Text>
          </View>

          <View style={styles.summaryCard}>
            <Ionicons name="star-outline" size={24} color={COLORS.warning} />
            <Text style={styles.summaryValue}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Period Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {periodTabs.map(renderPeriodTab)}
          </ScrollView>
        </View>

        {/* Status Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterTabs.map(renderFilterTab)}
          </ScrollView>
        </View>

        {/* Jobs List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            <Text style={styles.jobCount}>{displayJobs.length} jobs</Text>
          </View>

          {loading && jobs.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.emptyStateDescription}>Loading jobs...</Text>
            </View>
          ) : displayJobs.length > 0 ? (
            <FlatList
              data={displayJobs}
              renderItem={renderJobItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Jobs Found</Text>
              <Text style={styles.emptyStateDescription}>
                No jobs match your current filters.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  filterButton: {
    padding: SPACING.sm,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  jobCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  jobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
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
  earnings: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  serviceName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  completedDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default TechnicianOrderHistoryScreen;

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

const TechnicianOrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const jobHistory = [
    {
      id: 'job_001',
      customerName: 'Sarah Johnson',
      service: 'Premium Shoe Cleaning',
      completedAt: '2024-01-15',
      earnings: 89.99,
      rating: 5,
      status: 'completed',
    },
    {
      id: 'job_002',
      customerName: 'Mike Davis',
      service: 'Basic Cleaning',
      completedAt: '2024-01-14',
      earnings: 45.50,
      rating: 4,
      status: 'completed',
    },
    {
      id: 'job_003',
      customerName: 'Lisa Wilson',
      service: 'Deep Cleaning',
      completedAt: '2024-01-13',
      earnings: 75.00,
      rating: 5,
      status: 'completed',
    },
    {
      id: 'job_004',
      customerName: 'David Brown',
      service: 'Express Service',
      completedAt: '2024-01-12',
      earnings: 35.00,
      rating: 4,
      status: 'completed',
    },
    {
      id: 'job_005',
      customerName: 'Emma Thompson',
      service: 'Premium Polish',
      completedAt: '2024-01-11',
      earnings: 65.00,
      rating: 5,
      status: 'completed',
    },
  ];

  const filteredJobs = jobHistory.filter(job => {
    if (selectedFilter === 'all') return true;
    return job.status === selectedFilter;
  });

  const totalEarnings = jobHistory.reduce((sum, job) => sum + job.earnings, 0);
  const averageRating = jobHistory.reduce((sum, job) => sum + job.rating, 0) / jobHistory.length;

  const renderJobItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.earnings}>${item.earnings}</Text>
      </View>
      
      <Text style={styles.serviceName}>{item.service}</Text>
      <Text style={styles.completedDate}>{item.completedAt}</Text>
      
      <View style={styles.jobFooter}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={COLORS.warning} />
          <Text style={styles.ratingText}>{item.rating}/5</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.statusText}>Completed</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterTab = (filter: any) => (
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
  );

  const renderPeriodTab = (period: any) => (
    <TouchableOpacity
      key={period.id}
      style={[
        styles.periodTab,
        selectedPeriod === period.id && styles.periodTabActive
      ]}
      onPress={() => setSelectedPeriod(period.id)}
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
            <Text style={styles.summaryValue}>${totalEarnings.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            <Text style={styles.summaryValue}>{jobHistory.length}</Text>
            <Text style={styles.summaryLabel}>Jobs Completed</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Ionicons name="star-outline" size={24} color={COLORS.warning} />
            <Text style={styles.summaryValue}>{averageRating.toFixed(1)}</Text>
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
            <Text style={styles.jobCount}>{filteredJobs.length} jobs</Text>
          </View>
          
          {filteredJobs.length > 0 ? (
            <FlatList
              data={filteredJobs}
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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { useTranslation } from 'react-i18next';
import { getTechnicianDashboard, TechnicianDashboardData, TechnicianTodayTask } from '../../services/technicianService';

/** Map API task to dashboard job shape */
function mapTaskToJob(task: TechnicianTodayTask) {
  return {
    id: String(task.id),
    customerName: task.customer_name ?? task.customerName ?? '—',
    service: task.service ?? '—',
    address: task.address ?? '—',
    scheduledTime: task.scheduled_time ?? task.scheduledTime ?? '—',
    status: (task.status ?? 'assigned').toLowerCase().replace(/\s+/g, '_'),
    estimatedDuration: task.estimated_duration ?? task.estimatedDuration ?? '—',
    taskType: task.task_type ?? task.taskType ?? 'care',
  };
}

const TechnicianDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const [dashboard, setDashboard] = useState<TechnicianDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getTechnicianDashboard();
      setDashboard(data ?? null);
    } catch (_) {
      setDashboard(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const technician = dashboard
    ? {
        name: dashboard.name || '—',
        employeeId: dashboard.employee_id || '—',
        email: dashboard.email || '',
        isOnline: dashboard.is_online ?? true,
        thisWeekEarnings: dashboard.weekly_kpis?.earnings ?? 0,
        completedVisits: dashboard.weekly_kpis?.visits_done ?? 0,
        rating: dashboard.weekly_kpis?.rating ?? 0,
      }
    : {
        name: '—',
        employeeId: '—',
        email: '',
        isOnline: false,
        thisWeekEarnings: 0,
        completedVisits: 0,
        rating: 0,
      };

  const currentJobs = (dashboard?.today_tasks ?? []).map(mapTaskToJob);

  const recentJobs = [
    { id: 'visit_003', customerName: 'Green Valley Farm', service: 'Planting & Fertilizing', completedAt: '2024-01-15', earnings: 289.99, rating: 5 },
    { id: 'visit_004', customerName: 'Desert Palm Resort', service: 'Garden Cleaning', completedAt: '2024-01-14', earnings: 145.50, rating: 4 },
  ];

  const renderCurrentJob = ({ item }: { item: any }) => (
    <View style={styles.jobCard}>
      <TouchableOpacity
        style={styles.jobContent}
        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
      >
        <View style={styles.jobHeader}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'in_progress' ? COLORS.primary + '20' : COLORS.info + '20' }
          ]}>
            <Text style={[
              styles.jobStatusText,
              { color: item.status === 'in_progress' ? COLORS.primary : COLORS.info }
            ]}>
              {item.status === 'in_progress' ? 'In Progress' : 'Assigned'}
            </Text>
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
            <Text style={styles.jobInfoText}>{item.estimatedDuration}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Accept/Reject Buttons for Assigned Jobs */}
      {item.status === 'assigned' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => {
              Alert.alert(
                'Accept Job',
                `Accept job for ${item.customerName}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Accept', onPress: () => {
                    // Handle accept logic here
                    Alert.alert('Job Accepted', 'Job has been accepted successfully!');
                  }},
                ]
              );
            }}
          >
            <Ionicons name="checkmark" size={16} color={COLORS.background} />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => {
              Alert.alert(
                'Reject Job',
                `Reject job for ${item.customerName}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reject', style: 'destructive', onPress: () => {
                    // Handle reject logic here
                    Alert.alert('Job Rejected', 'Job has been rejected.');
                  }},
                ]
              );
            }}
          >
            <Ionicons name="close" size={16} color={COLORS.background} />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderRecentJob = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.recentJobCard}>
      <View style={styles.recentJobHeader}>
        <Text style={styles.recentCustomerName}>{item.customerName}</Text>
        <Text style={styles.recentEarnings}>AED {item.earnings}</Text>
      </View>
      
      <Text style={styles.recentServiceName}>{item.service}</Text>
      <Text style={styles.recentDate}>{item.completedAt}</Text>
      
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color={COLORS.warning} />
        <Text style={styles.ratingText}>{item.rating}/5</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !dashboard) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, styles.centeredContent]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('home.loading', 'Loading...')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good afternoon!</Text>
            <Text style={styles.technicianName}>{technician.name}</Text>
            <Text style={styles.employeeId}>ID: {technician.employeeId}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => {
              navigation.navigate('Main' as never, { screen: 'ProfileTab' } as never);
            }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(technician.name || 'T').charAt(0).toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.onlineStatus}>
          <View style={[styles.statusDot, { backgroundColor: technician.isOnline ? COLORS.success : COLORS.textSecondary }]} />
          <Text style={styles.statusText}>
            {technician.isOnline ? t('technician.online', 'Online') : t('technician.offline', 'Offline')} - {t('technician.fieldWorker', 'Field Worker')}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchDashboard(true)} colors={[COLORS.primary]} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>AED {Number(technician.thisWeekEarnings).toFixed(2)}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{technician.completedVisits}</Text>
            <Text style={styles.statLabel}>Visits Done</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>{Number(technician.rating) ? Number(technician.rating).toFixed(1) : '0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {currentJobs.length > 0 ? (
            <FlatList
              data={currentJobs}
              renderItem={renderCurrentJob}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateText}>No active tasks</Text>
              <Text style={styles.emptyStateSubtext}>You'll see assigned farm visits here</Text>
            </View>
          )}
        </View>

        {/* Recent Visits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Visits</Text>
            <TouchableOpacity onPress={() => {
              // Navigate to Tasks tab through parent Stack 'Main'
              navigation.navigate('Main' as never, { screen: 'TasksTab' } as never);
            }}>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={recentJobs}
            renderItem={renderRecentJob}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                // Navigate to Schedule tab through parent Stack 'Main'
                navigation.navigate('Main' as never, { screen: 'ScheduleTab' } as never);
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Availability</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('PayoutSummary')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Payouts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                // Navigate to Tasks tab through parent Stack 'Main'
                navigation.navigate('Main' as never, { screen: 'TasksTab' } as never);
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="list-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                // Navigate to Profile tab through parent Stack 'Main'
                navigation.navigate('Main' as never, { screen: 'ProfileTab' } as never);
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="person-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                Alert.alert('Accept Jobs', 'Navigate to accept pending jobs?');
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.quickActionText}>Accept Jobs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => {
                Alert.alert('Reject Jobs', 'Navigate to reject pending jobs?');
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="close-circle-outline" size={24} color={COLORS.error} />
              </View>
              <Text style={styles.quickActionText}>Reject Jobs</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: COLORS.background,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  technicianName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  employeeId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 2,
  },
  profileButton: {
    padding: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
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
  recentJobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  recentJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  recentCustomerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  recentEarnings: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  recentServiceName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  recentDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  jobContent: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.background,
  },
});

export default TechnicianDashboardScreen;

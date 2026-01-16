import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { adminService } from '../../services/adminService';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const admin = {
    id: 'admin_001',
    employeeId: 'ADMIN-5001',
    name: 'Abdullah Al Mazrouei',
    email: 'abdullah.mazrouei@tandil.com',
    role: 'Executive Management',
  };

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStatistics({ period: timeRange });
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard statistics:', error);
      // Set default/fallback data if API fails
        const fallbackData = {
          total: 0,
          daily: 0,
          weekly: 0,
          monthly: 0,
          yearly: 0,
          growth: { daily: '+0', weekly: '+0', monthly: '+0', yearly: '+0' }
        };
        setStatistics({
          customers: fallbackData,
          technicians: fallbackData,
          employees: fallbackData,
          total_users: fallbackData,
          active_subscriptions: fallbackData,
          monthly_revenue: fallbackData,
        });
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  useFocusEffect(
    useCallback(() => {
      fetchStatistics();
    }, [fetchStatistics])
  );


  const recentActivities = [
    {
      id: 'activity_001',
      type: 'subscription',
      message: 'New 12-month subscription by Palm Grove Estate',
      timestamp: '5 min ago',
      icon: 'checkmark-circle',
      color: COLORS.success,
    },
    {
      id: 'activity_002',
      type: 'user',
      message: 'New customer registered - Mohammed Ali Farm',
      timestamp: '1 hour ago',
      icon: 'person-add',
      color: COLORS.primary,
    },
    {
      id: 'activity_003',
      type: 'alert',
      message: 'Low inventory alert: Organic Fertilizer',
      timestamp: '2 hours ago',
      icon: 'warning',
      color: COLORS.warning,
    },
  ];

  const quickStats = [
    { label: 'Pending Reports', value: '12', action: 'View', color: COLORS.warning },
    { label: 'New Orders', value: '34', action: 'Manage', color: COLORS.success },
    { label: 'Support Tickets', value: '8', action: 'Respond', color: COLORS.error },
  ];

  const topProducts = [
    { id: 1, name: 'Organic Fertilizer 5kg', sales: 245, revenue: 'AED 22K' },
    { id: 2, name: 'Drip Irrigation Kit', sales: 189, revenue: 'AED 15K' },
    { id: 3, name: 'Premium Potting Soil', sales: 167, revenue: 'AED 10K' },
  ];

  const renderActivity = ({ item }: { item: any }) => (
    <View style={styles.activityCard}>
      <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{item.message}</Text>
        <Text style={styles.activityTime}>{item.timestamp}</Text>
      </View>
    </View>
  );

  const renderQuickStat = ({ item }: { item: any }) => (
    <View style={styles.quickStatCard}>
      <View style={styles.quickStatHeader}>
        <Text style={styles.quickStatValue}>{item.value}</Text>
        <View style={[styles.quickStatBadge, { backgroundColor: item.color + '20' }]}>
          <Text style={[styles.quickStatBadgeText, { color: item.color }]}>New</Text>
        </View>
      </View>
      <Text style={styles.quickStatLabel}>{item.label}</Text>
      <TouchableOpacity style={styles.quickStatAction}>
        <Text style={[styles.quickStatActionText, { color: item.color }]}>{item.action} →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productSales}>{item.sales} sales</Text>
      </View>
      <Text style={styles.productRevenue}>{item.revenue}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good afternoon!</Text>
            <Text style={styles.adminName}>{admin.name}</Text>
            <Text style={styles.adminRole}>{admin.role}</Text>
            <Text style={styles.adminId}>ID: {admin.employeeId}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Main' as never, { screen: 'SettingsTab' } as never)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{admin.name.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Statistics Section */}
        <View style={styles.userStatsSection}>
          <View style={styles.userStatsHeader}>
            <View style={styles.userStatsTitleContainer}>
              <Text style={styles.userStatsTitle}>User Statistics</Text>
              <Text style={styles.userStatsSubtitle}>Track growth of customers, technicians, and employees</Text>
            </View>
            <TouchableOpacity
              style={styles.timeRangeButton}
              onPress={() => setShowTimeRangeModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.timeRangeText}>
                {timeRange === 'daily' ? 'Daily' : timeRange === 'weekly' ? 'Weekly' : timeRange === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : statistics ? (
            <View style={[styles.userStatsGrid, { paddingHorizontal: 0 }]}>
              {/* Customers Card */}
              <View style={styles.userStatCard}>
                <View style={[styles.userStatIcon, { backgroundColor: '#4A90E2' + '20' }]}>
                  <Ionicons name="people" size={24} color="#4A90E2" />
                </View>
                <Text style={styles.userStatValue}>
                  {timeRange === 'daily' ? statistics.customers.daily :
                   timeRange === 'weekly' ? statistics.customers.weekly :
                   timeRange === 'monthly' ? statistics.customers.monthly :
                   statistics.customers.yearly}
                </Text>
                <Text style={styles.userStatLabel}>Customers</Text>
                <Text style={styles.userStatPeriod}>
                  {timeRange === 'daily' ? 'Today' :
                   timeRange === 'weekly' ? 'This Week' :
                   timeRange === 'monthly' ? 'This Month' :
                   'This Year'}
                </Text>
                <View style={styles.userStatGrowth}>
                  {(() => {
                    const growthValue = timeRange === 'daily' ? statistics.customers.growth.daily :
                                      timeRange === 'weekly' ? statistics.customers.growth.weekly :
                                      timeRange === 'monthly' ? statistics.customers.growth.monthly :
                                      statistics.customers.growth.yearly;
                    const isPositive = growthValue.startsWith('+') && growthValue !== '+0';
                    const isNegative = growthValue.startsWith('-');
                    const isNeutral = growthValue === '+0' || growthValue === '0';
                    const growthColor = isPositive ? COLORS.success : isNegative ? COLORS.error : COLORS.textSecondary;
                    
                    return (
                      <Text style={[styles.userStatGrowthText, { color: growthColor }]}>
                        {isPositive && '↑ '}
                        {isNegative && '↓ '}
                        {isNeutral && '— '}
                        {growthValue.includes('%') ? growthValue : `${growthValue}%`} vs previous period
                      </Text>
                    );
                  })()}
                </View>
              </View>

              {/* Technicians Card */}
              <View style={styles.userStatCard}>
                <View style={[styles.userStatIcon, { backgroundColor: '#4CAF50' + '20' }]}>
                  <Ionicons name="briefcase" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.userStatValue}>
                  {timeRange === 'daily' ? statistics.technicians.daily :
                   timeRange === 'weekly' ? statistics.technicians.weekly :
                   timeRange === 'monthly' ? statistics.technicians.monthly :
                   statistics.technicians.yearly}
                </Text>
                <Text style={styles.userStatLabel}>Technicians</Text>
                <Text style={styles.userStatPeriod}>
                  {timeRange === 'daily' ? 'Today' :
                   timeRange === 'weekly' ? 'This Week' :
                   timeRange === 'monthly' ? 'This Month' :
                   'This Year'}
                </Text>
                <View style={styles.userStatGrowth}>
                  {(() => {
                    const growthValue = timeRange === 'daily' ? statistics.technicians.growth.daily :
                                      timeRange === 'weekly' ? statistics.technicians.growth.weekly :
                                      timeRange === 'monthly' ? statistics.technicians.growth.monthly :
                                      statistics.technicians.growth.yearly;
                    const isPositive = growthValue.startsWith('+') && growthValue !== '+0';
                    const isNegative = growthValue.startsWith('-');
                    const isNeutral = growthValue === '+0' || growthValue === '0';
                    const growthColor = isPositive ? COLORS.success : isNegative ? COLORS.error : COLORS.textSecondary;
                    
                    return (
                      <Text style={[styles.userStatGrowthText, { color: growthColor }]}>
                        {isPositive && '↑ '}
                        {isNegative && '↓ '}
                        {isNeutral && '— '}
                        {growthValue.includes('%') ? growthValue : `${growthValue}%`} vs previous period
                      </Text>
                    );
                  })()}
                </View>
              </View>

              {/* Employees/Staff Card */}
              <View style={styles.userStatCard}>
                <View style={[styles.userStatIcon, { backgroundColor: '#9C27B0' + '20' }]}>
                  <Ionicons name="people-outline" size={24} color="#9C27B0" />
                </View>
                <Text style={styles.userStatValue}>
                  {statistics.employees ? (
                    timeRange === 'daily' ? statistics.employees.daily :
                    timeRange === 'weekly' ? statistics.employees.weekly :
                    timeRange === 'monthly' ? statistics.employees.monthly :
                    statistics.employees.yearly
                  ) : (
                    timeRange === 'daily' ? statistics.technicians.daily :
                    timeRange === 'weekly' ? statistics.technicians.weekly :
                    timeRange === 'monthly' ? statistics.technicians.monthly :
                    statistics.technicians.yearly
                  )}
                </Text>
                <Text style={styles.userStatLabel}>Employees/Staff</Text>
                <Text style={styles.userStatPeriod}>
                  {timeRange === 'daily' ? 'Today' :
                   timeRange === 'weekly' ? 'This Week' :
                   timeRange === 'monthly' ? 'This Month' :
                   'This Year'}
                </Text>
                <View style={styles.userStatGrowth}>
                  {(() => {
                    const employeesData = statistics.employees || statistics.technicians;
                    const growthValue = timeRange === 'daily' ? employeesData.growth.daily :
                                      timeRange === 'weekly' ? employeesData.growth.weekly :
                                      timeRange === 'monthly' ? employeesData.growth.monthly :
                                      employeesData.growth.yearly;
                    const isPositive = growthValue.startsWith('+') && growthValue !== '+0';
                    const isNegative = growthValue.startsWith('-');
                    const isNeutral = growthValue === '+0' || growthValue === '0';
                    const growthColor = isPositive ? COLORS.success : isNegative ? COLORS.error : COLORS.textSecondary;
                    
                    return (
                      <Text style={[styles.userStatGrowthText, { color: growthColor }]}>
                        {isPositive && '↑ '}
                        {isNegative && '↓ '}
                        {isNeutral && '— '}
                        {growthValue.includes('%') ? growthValue : `${growthValue}%`} vs previous period
                      </Text>
                    );
                  })()}
                </View>
              </View>

              {/* Total Users Card */}
              {statistics.total_users && (
                <View style={styles.userStatCard}>
                  <View style={[styles.userStatIcon, { backgroundColor: COLORS.primary + '20' }]}>
                    <Ionicons name="people-outline" size={24} color={COLORS.primary} />
                  </View>
                  <Text style={styles.userStatValue}>
                    {(() => {
                      const value = timeRange === 'daily' ? statistics.total_users.daily :
                                   timeRange === 'weekly' ? statistics.total_users.weekly :
                                   timeRange === 'monthly' ? statistics.total_users.monthly :
                                   statistics.total_users.yearly;
                      return value.toLocaleString('en-US');
                    })()}
                  </Text>
                  <Text style={styles.userStatLabel}>Total Users</Text>
                  <Text style={styles.userStatPeriod}>
                    {timeRange === 'daily' ? 'Today' :
                     timeRange === 'weekly' ? 'This Week' :
                     timeRange === 'monthly' ? 'This Month' :
                     'This Year'}
                  </Text>
                  <View style={styles.userStatGrowth}>
                    {(() => {
                      const growthValue = timeRange === 'daily' ? statistics.total_users.growth.daily :
                                        timeRange === 'weekly' ? statistics.total_users.growth.weekly :
                                        timeRange === 'monthly' ? statistics.total_users.growth.monthly :
                                        statistics.total_users.growth.yearly;
                      const isPositive = growthValue.startsWith('+') && growthValue !== '+0';
                      const isNegative = growthValue.startsWith('-');
                      const isNeutral = growthValue === '+0' || growthValue === '0';
                      const growthColor = isPositive ? COLORS.success : isNegative ? COLORS.error : COLORS.textSecondary;
                      
                      return (
                        <Text style={[styles.userStatGrowthText, { color: growthColor }]}>
                          {isPositive && '↑ '}
                          {isNegative && '↓ '}
                          {isNeutral && '— '}
                          {growthValue.includes('%') ? growthValue : `${growthValue}%`} vs previous period
                        </Text>
                      );
                    })()}
                  </View>
                </View>
              )}

              {/* Active Subscriptions Card */}
              {statistics.active_subscriptions && (
                <View style={styles.userStatCard}>
                  <View style={[styles.userStatIcon, { backgroundColor: COLORS.success + '20' }]}>
                    <Ionicons name="calendar-outline" size={24} color={COLORS.success} />
                  </View>
                  <Text style={styles.userStatValue}>
                    {(() => {
                      const value = timeRange === 'daily' ? statistics.active_subscriptions.daily :
                                   timeRange === 'weekly' ? statistics.active_subscriptions.weekly :
                                   timeRange === 'monthly' ? statistics.active_subscriptions.monthly :
                                   statistics.active_subscriptions.yearly;
                      return value.toLocaleString('en-US');
                    })()}
                  </Text>
                  <Text style={styles.userStatLabel}>Active Subscriptions</Text>
                  <Text style={styles.userStatPeriod}>
                    {timeRange === 'daily' ? 'Today' :
                     timeRange === 'weekly' ? 'This Week' :
                     timeRange === 'monthly' ? 'This Month' :
                     'This Year'}
                  </Text>
                  <View style={styles.userStatGrowth}>
                    {(() => {
                      const growthValue = timeRange === 'daily' ? statistics.active_subscriptions.growth.daily :
                                        timeRange === 'weekly' ? statistics.active_subscriptions.growth.weekly :
                                        timeRange === 'monthly' ? statistics.active_subscriptions.growth.monthly :
                                        statistics.active_subscriptions.growth.yearly;
                      const isPositive = growthValue.startsWith('+') && growthValue !== '+0';
                      const isNegative = growthValue.startsWith('-');
                      const isNeutral = growthValue === '+0' || growthValue === '0';
                      const growthColor = isPositive ? COLORS.success : isNegative ? COLORS.error : COLORS.textSecondary;
                      
                      return (
                        <Text style={[styles.userStatGrowthText, { color: growthColor }]}>
                          {isPositive && '↑ '}
                          {isNegative && '↓ '}
                          {isNeutral && '— '}
                          {growthValue.includes('%') ? growthValue : `${growthValue}%`} vs previous period
                        </Text>
                      );
                    })()}
                  </View>
                </View>
              )}

              {/* Monthly Revenue Card */}
              {statistics.monthly_revenue && (
                <View style={styles.userStatCard}>
                  <View style={[styles.userStatIcon, { backgroundColor: COLORS.warning + '20' }]}>
                    <Ionicons name="trending-up-outline" size={24} color={COLORS.warning} />
                  </View>
                  <Text style={styles.userStatValue}>
                    {(() => {
                      const value = timeRange === 'daily' ? statistics.monthly_revenue.daily :
                                   timeRange === 'weekly' ? statistics.monthly_revenue.weekly :
                                   timeRange === 'monthly' ? statistics.monthly_revenue.monthly :
                                   statistics.monthly_revenue.yearly;
                      if (value >= 1000000) {
                        return `AED ${(value / 1000000).toFixed(1)}M`;
                      } else if (value >= 1000) {
                        return `AED ${(value / 1000).toFixed(0)}K`;
                      }
                      return `AED ${value.toLocaleString('en-US')}`;
                    })()}
                  </Text>
                  <Text style={styles.userStatLabel}>Monthly Revenue</Text>
                  <Text style={styles.userStatPeriod}>
                    {timeRange === 'daily' ? 'Today' :
                     timeRange === 'weekly' ? 'This Week' :
                     timeRange === 'monthly' ? 'This Month' :
                     'This Year'}
                  </Text>
                  <View style={styles.userStatGrowth}>
                    {(() => {
                      const growthValue = timeRange === 'daily' ? statistics.monthly_revenue.growth.daily :
                                        timeRange === 'weekly' ? statistics.monthly_revenue.growth.weekly :
                                        timeRange === 'monthly' ? statistics.monthly_revenue.growth.monthly :
                                        statistics.monthly_revenue.growth.yearly;
                      const isPositive = growthValue.startsWith('+') && growthValue !== '+0';
                      const isNegative = growthValue.startsWith('-');
                      const isNeutral = growthValue === '+0' || growthValue === '0';
                      const growthColor = isPositive ? COLORS.success : isNegative ? COLORS.error : COLORS.textSecondary;
                      
                      return (
                        <Text style={[styles.userStatGrowthText, { color: growthColor }]}>
                          {isPositive && '↑ '}
                          {isNegative && '↓ '}
                          {isNeutral && '— '}
                          {growthValue.includes('%') ? growthValue : `${growthValue}%`} vs previous period
                        </Text>
                      );
                    })()}
                  </View>
                </View>
              )}
            </View>
          ) : null}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          <FlatList
            data={quickStats}
            renderItem={renderQuickStat}
            keyExtractor={(item) => item.label}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickStatsList}
          />
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={recentActivities}
            renderItem={renderActivity}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          <FlatList
            data={topProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

        {/* Admin Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Controls</Text>
          <View style={styles.adminActions}>
            <TouchableOpacity style={styles.adminAction} onPress={() => navigation.navigate('UsersTab' as never)}>
              <View style={styles.adminActionIcon}>
                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.adminActionText}>Manage Users</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adminAction} onPress={() => navigation.navigate('AdminSubscriptions' as never)}>
              <View style={styles.adminActionIcon}>
                <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.adminActionText}>Subscriptions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adminAction} onPress={() => navigation.navigate('AdminTips' as never)}>
              <View style={styles.adminActionIcon}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.adminActionText}>Send Tips</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adminAction} onPress={() => navigation.navigate('AdminProducts' as never)}>
              <View style={styles.adminActionIcon}>
                <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.adminActionText}>Products</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adminAction} onPress={() => navigation.navigate('ReportsTab' as never)}>
              <View style={styles.adminActionIcon}>
                <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.adminActionText}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.adminAction} onPress={() => navigation.navigate('ReportsTab' as never)}>
              <View style={styles.adminActionIcon}>
                <Ionicons name="stats-chart-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.adminActionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Time Range Selection Modal */}
      <Modal
        transparent={true}
        visible={showTimeRangeModal}
        animationType="fade"
        onRequestClose={() => setShowTimeRangeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimeRangeModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Select Time Range</Text>
            {(['daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.modalOption,
                  timeRange === range && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setTimeRange(range);
                  setShowTimeRangeModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  timeRange === range && styles.modalOptionTextSelected
                ]}>
                  {range === 'daily' ? 'Daily' : range === 'weekly' ? 'Weekly' : range === 'monthly' ? 'Monthly' : 'Yearly'}
                </Text>
                {timeRange === range && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  adminName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  adminRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 2,
  },
  adminId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  statGridItem: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  statGridIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statGridValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statGridLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statGridChange: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
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
    marginBottom: SPACING.md,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  quickStatsList: {
    gap: SPACING.md,
  },
  quickStatCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    width: 160,
  },
  quickStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  quickStatValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  quickStatBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  quickStatBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  quickStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  quickStatAction: {
    marginTop: SPACING.xs,
  },
  quickStatActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  activityTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productSales: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  productRevenue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  adminActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  adminAction: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  adminActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  adminActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  // User Statistics Styles
  userStatsSection: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  userStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  userStatsTitleContainer: {
    flex: 1,
    marginRight: SPACING.md,
    flexShrink: 1,
  },
  userStatsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userStatsSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  timeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 90,
    height: 36,
    flexShrink: 0,
  },
  timeRangeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  userStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  userStatCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  userStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userStatLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userStatPeriod: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userStatGrowth: {
    marginTop: SPACING.xs,
  },
  userStatGrowthText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    width: '80%',
    maxWidth: 300,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  modalOptionSelected: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  modalOptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  modalOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});

export default AdminDashboardScreen;





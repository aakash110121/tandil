import React from 'react';
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

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const admin = {
    id: 'admin_001',
    employeeId: 'ADMIN-5001',
    name: 'Abdullah Al Mazrouei',
    email: 'abdullah.mazrouei@tandil.com',
    role: 'Executive Management',
  };

  const overviewStats = [
    { label: 'Total Users', value: '1,245', icon: 'people-outline', color: COLORS.primary, change: '+12%' },
    { label: 'Active Subscriptions', value: '892', icon: 'calendar-outline', color: COLORS.success, change: '+8%' },
    { label: 'Monthly Revenue', value: 'AED 245K', icon: 'trending-up-outline', color: COLORS.warning, change: '+15%' },
    { label: 'Total Employees', value: '48', icon: 'briefcase-outline', color: COLORS.info, change: '+3' },
  ];

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
        {/* Overview Stats Grid */}
        <View style={styles.statsGrid}>
          {overviewStats.map((stat, index) => (
            <View key={index} style={styles.statGridItem}>
              <View style={[styles.statGridIcon, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statGridValue}>{stat.value}</Text>
              <Text style={styles.statGridLabel}>{stat.label}</Text>
              <Text style={[styles.statGridChange, { color: stat.color }]}>{stat.change}</Text>
            </View>
          ))}
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
});

export default AdminDashboardScreen;





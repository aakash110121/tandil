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

const AreaManagerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const areaManager = {
    id: 'area_001',
    employeeId: 'AM-3001',
    name: 'Fatima Al Zaabi',
    email: 'fatima.zaabi@tandil.com',
    phone: '+971 50 111 2222',
    role: 'Area Manager',
    region: 'Abu Dhabi Central',
    totalSupervisors: 5,
    totalWorkers: 35,
    activeVisits: 48,
  };

  const regionStats = [
    { label: 'Total Farms', value: '124', icon: 'home-outline', color: COLORS.primary },
    { label: 'Active Subscriptions', value: '89', icon: 'calendar-outline', color: COLORS.success },
    { label: 'Monthly Revenue', value: 'AED 45K', icon: 'trending-up-outline', color: COLORS.warning },
  ];

  const supervisors = [
    {
      id: 'sup_001',
      employeeId: 'SUP-2001',
      name: 'Hassan Ahmed',
      teamSize: 8,
      activeVisits: 12,
      completedToday: 5,
      performance: 92,
    },
    {
      id: 'sup_002',
      employeeId: 'SUP-2002',
      name: 'Mohammed Khalil',
      teamSize: 7,
      activeVisits: 10,
      completedToday: 6,
      performance: 88,
    },
    {
      id: 'sup_003',
      employeeId: 'SUP-2003',
      name: 'Ali Rashid',
      teamSize: 6,
      activeVisits: 8,
      completedToday: 4,
      performance: 85,
    },
  ];

  const regionAlerts = [
    {
      id: 'alert_001',
      type: 'warning',
      message: 'Low team capacity in Al Ain area - 3 workers on leave',
      timestamp: '2 hours ago',
    },
    {
      id: 'alert_002',
      type: 'success',
      message: 'Monthly targets achieved in Liwa region',
      timestamp: '5 hours ago',
    },
  ];

  const renderSupervisor = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.supervisorCard}>
      <View style={styles.supervisorHeader}>
        <View style={styles.supervisorAvatar}>
          <Text style={styles.supervisorAvatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.supervisorInfo}>
          <Text style={styles.supervisorName}>{item.name}</Text>
          <Text style={styles.supervisorId}>{item.employeeId}</Text>
        </View>
        <View style={styles.performanceBadge}>
          <Text style={styles.performanceText}>{item.performance}%</Text>
        </View>
      </View>
      <View style={styles.supervisorStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Team</Text>
          <Text style={styles.statValue}>{item.teamSize}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statValue}>{item.activeVisits}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Done</Text>
          <Text style={styles.statValue}>{item.completedToday}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAlert = ({ item }: { item: any }) => (
    <View style={[
      styles.alertCard,
      { borderLeftColor: item.type === 'warning' ? COLORS.warning : COLORS.success }
    ]}>
      <Ionicons 
        name={item.type === 'warning' ? 'warning-outline' : 'checkmark-circle-outline'} 
        size={20} 
        color={item.type === 'warning' ? COLORS.warning : COLORS.success}
      />
      <View style={styles.alertContent}>
        <Text style={styles.alertMessage}>{item.message}</Text>
        <Text style={styles.alertTime}>{item.timestamp}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good afternoon!</Text>
            <Text style={styles.managerName}>{areaManager.name}</Text>
            <Text style={styles.managerRole}>{areaManager.role} • {areaManager.region}</Text>
            <Text style={styles.managerId}>ID: {areaManager.employeeId}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Main' as never, { screen: 'ProfileTab' } as never)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{areaManager.name.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Region Stats */}
        <View style={styles.statsContainer}>
          {regionStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statCardValue}>{stat.value}</Text>
              <Text style={styles.statCardLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Region Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Region Alerts</Text>
            <View style={styles.alertCount}>
              <Text style={styles.alertCountText}>{regionAlerts.length}</Text>
            </View>
          </View>
          
          <FlatList
            data={regionAlerts}
            renderItem={renderAlert}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Supervisors Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Team Leaders</Text>
            <Text style={styles.sectionCount}>{supervisors.length} Active</Text>
          </View>
          
          <FlatList
            data={supervisors}
            renderItem={renderSupervisor}
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
              onPress={() => navigation.navigate('RegionMap' as never)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="map-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Region Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Analytics' as never)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="stats-chart-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('TeamsTab' as never)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>All Teams</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('RegionReports' as never)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Reports</Text>
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
  managerName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  managerRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
    marginTop: 2,
  },
  managerId: {
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statCardValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statCardLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
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
  },
  sectionCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  alertCount: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  alertCountText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.background,
    fontWeight: FONT_WEIGHTS.bold,
  },
  alertCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
  },
  alertContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  alertMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  alertTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  supervisorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  supervisorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  supervisorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  supervisorAvatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  supervisorInfo: {
    flex: 1,
  },
  supervisorName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  supervisorId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  performanceBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  performanceText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  supervisorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
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
});

export default AreaManagerDashboardScreen;





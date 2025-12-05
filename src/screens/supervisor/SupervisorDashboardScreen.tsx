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

const SupervisorDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const supervisor = {
    id: 'sup_001',
    employeeId: 'SUP-2001',
    name: 'Hassan Ahmed',
    email: 'hassan.ahmed@tandil.com',
    phone: '+971 50 987 6543',
    role: 'Team Leader',
    teamSize: 8,
    activeVisits: 12,
    completedToday: 5,
  };

  const teamMembers = [
    {
      id: 'tech_001',
      employeeId: 'EMP-1001',
      name: 'Ahmed Hassan',
      status: 'active',
      currentTask: 'Mohammed Ali Farm - Watering',
      tasksToday: 3,
      completedToday: 2,
    },
    {
      id: 'tech_002',
      employeeId: 'EMP-1002',
      name: 'Khalid Ibrahim',
      status: 'active',
      currentTask: 'Green Valley - Planting',
      tasksToday: 2,
      completedToday: 1,
    },
    {
      id: 'tech_003',
      employeeId: 'EMP-1003',
      name: 'Omar Saeed',
      status: 'break',
      currentTask: 'On Break',
      tasksToday: 4,
      completedToday: 3,
    },
  ];

  const pendingReports = [
    {
      id: 'report_001',
      technicianName: 'Ahmed Hassan',
      employeeId: 'EMP-1001',
      customerName: 'Mohammed Ali Farm',
      service: 'Tree Watering',
      submittedAt: '2 hours ago',
      hasPhotos: true,
    },
    {
      id: 'report_002',
      technicianName: 'Khalid Ibrahim',
      employeeId: 'EMP-1002',
      customerName: 'Palm Grove Estate',
      service: 'Garden Cleaning',
      submittedAt: '4 hours ago',
      hasPhotos: true,
    },
  ];

  const renderTeamMember = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberEmployeeId}>{item.employeeId}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'active' ? COLORS.success + '20' : COLORS.warning + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'active' ? COLORS.success : COLORS.warning }
          ]}>
            {item.status === 'active' ? 'Active' : 'Break'}
          </Text>
        </View>
      </View>
      <Text style={styles.memberTask}>{item.currentTask}</Text>
      <View style={styles.memberStats}>
        <Text style={styles.memberStatText}>
          Tasks: {item.completedToday}/{item.tasksToday}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPendingReport = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => navigation.navigate('Main' as never, { screen: 'ReportsTab', params: { visitId: item.id } } as never)}
    >
      <View style={styles.reportHeader}>
        <View>
          <Text style={styles.reportTechName}>{item.technicianName}</Text>
          <Text style={styles.reportEmployeeId}>{item.employeeId}</Text>
        </View>
        {item.hasPhotos && (
          <Ionicons name="image" size={20} color={COLORS.primary} />
        )}
      </View>
      <Text style={styles.reportCustomer}>{item.customerName}</Text>
      <Text style={styles.reportService}>{item.service}</Text>
      <Text style={styles.reportTime}>{item.submittedAt}</Text>
      <View style={styles.reportAction}>
        <Text style={styles.reviewButtonText}>Review Report →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good afternoon!</Text>
            <Text style={styles.supervisorName}>{supervisor.name}</Text>
            <Text style={styles.supervisorRole}>{supervisor.role} • ID: {supervisor.employeeId}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Main' as never, { screen: 'ProfileTab' } as never)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{supervisor.name.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{supervisor.teamSize}</Text>
            <Text style={styles.statLabel}>Team Members</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="clipboard-outline" size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>{supervisor.activeVisits}</Text>
            <Text style={styles.statLabel}>Active Visits</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{supervisor.completedToday}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Pending Reports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Field Reports</Text>
            <Text style={styles.sectionCount}>{pendingReports.length}</Text>
          </View>
          
          <FlatList
            data={pendingReports}
            renderItem={renderPendingReport}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Team Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Team</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={teamMembers}
            renderItem={renderTeamMember}
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
              onPress={() => navigation.navigate('Main' as never, { screen: 'ReportsTab' } as never)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Review Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('AssignTasks' as never)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Assign Tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('TeamStats' as never)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="stats-chart-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Team Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Main' as never, { screen: 'ProfileTab' } as never)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="person-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Profile</Text>
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
  supervisorName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  supervisorRole: {
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
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.primary,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reportTechName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  reportEmployeeId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: 2,
  },
  reportCustomer: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reportService: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  reportTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  reportAction: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reviewButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  memberCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  memberAvatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  memberEmployeeId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  memberTask: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  memberStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  memberStatText: {
    fontSize: FONT_SIZES.sm,
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

export default SupervisorDashboardScreen;


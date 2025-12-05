import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const HRManagerDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const hrManager = {
    id: 'hr_001',
    employeeId: 'HR-4001',
    name: 'Mariam Al Hashimi',
    email: 'mariam.hashimi@tandil.com',
    phone: '+971 50 333 4444',
    role: 'HR Manager',
    totalEmployees: 48,
    newHires: 5,
    pendingLeaves: 8,
  };

  const employees = [
    {
      id: 'emp_001',
      employeeId: 'EMP-1001',
      name: 'Ahmed Hassan',
      position: 'Field Worker',
      joiningDate: '2023-05-15',
      status: 'active',
      leaveBalance: 12,
    },
    {
      id: 'emp_002',
      employeeId: 'SUP-2001',
      name: 'Hassan Ahmed',
      position: 'Team Leader',
      joiningDate: '2022-08-10',
      status: 'active',
      leaveBalance: 8,
    },
    {
      id: 'emp_003',
      employeeId: 'EMP-1003',
      name: 'Omar Saeed',
      position: 'Field Worker',
      joiningDate: '2023-11-20',
      status: 'on_leave',
      leaveBalance: 15,
    },
  ];

  const leaveRequests = [
    {
      id: 'leave_001',
      employeeId: 'EMP-1005',
      employeeName: 'Mohammed Ali',
      leaveType: 'Sick Leave',
      duration: '2 days',
      startDate: '2024-01-20',
      status: 'pending',
    },
    {
      id: 'leave_002',
      employeeId: 'SUP-2003',
      employeeName: 'Ali Rashid',
      leaveType: 'Annual Leave',
      duration: '5 days',
      startDate: '2024-01-25',
      status: 'pending',
    },
  ];

  const scheduleAssignments = [
    {
      id: 'schedule_001',
      date: 'Today',
      totalVisits: 24,
      assigned: 20,
      unassigned: 4,
    },
    {
      id: 'schedule_002',
      date: 'Tomorrow',
      totalVisits: 28,
      assigned: 15,
      unassigned: 13,
    },
  ];

  const renderEmployee = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.employeeAvatar}>
          <Text style={styles.employeeAvatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeId}>{item.employeeId}</Text>
          <Text style={styles.employeePosition}>{item.position}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'active' ? COLORS.success + '20' : COLORS.warning + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'active' ? COLORS.success : COLORS.warning }
          ]}>
            {item.status === 'active' ? 'Active' : 'On Leave'}
          </Text>
        </View>
      </View>
      <View style={styles.employeeDetails}>
        <Text style={styles.employeeDetailText}>Joined: {item.joiningDate}</Text>
        <Text style={styles.employeeDetailText}>Leave: {item.leaveBalance} days</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLeaveRequest = ({ item }: { item: any }) => (
    <View style={styles.leaveCard}>
      <View style={styles.leaveHeader}>
        <View>
          <Text style={styles.leaveName}>{item.employeeName}</Text>
          <Text style={styles.leaveEmployeeId}>{item.employeeId}</Text>
        </View>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>Pending</Text>
        </View>
      </View>
      <Text style={styles.leaveType}>{item.leaveType} • {item.duration}</Text>
      <Text style={styles.leaveDate}>From: {item.startDate}</Text>
      <View style={styles.leaveActions}>
        <TouchableOpacity 
          style={styles.approveButton}
          onPress={() => {
            Alert.alert(
              'Approve Leave',
              `Approve ${item.leaveType} for ${item.employeeName} (${item.employeeId})?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Approve', 
                  onPress: () => {
                    Alert.alert('Success', `Leave approved for ${item.employeeName}`);
                  }
                },
              ]
            );
          }}
        >
          <Ionicons name="checkmark" size={16} color={COLORS.background} />
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.rejectButton}
          onPress={() => {
            Alert.alert(
              'Reject Leave',
              `Reject ${item.leaveType} for ${item.employeeName} (${item.employeeId})?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Reject', 
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Leave Rejected', `Leave request rejected for ${item.employeeName}`);
                  }
                },
              ]
            );
          }}
        >
          <Ionicons name="close" size={16} color={COLORS.background} />
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSchedule = ({ item }: { item: any }) => (
    <View style={styles.scheduleCard}>
      <Text style={styles.scheduleDate}>{item.date}</Text>
      <View style={styles.scheduleStats}>
        <View style={styles.scheduleStatItem}>
          <Text style={styles.scheduleStatValue}>{item.totalVisits}</Text>
          <Text style={styles.scheduleStatLabel}>Total Visits</Text>
        </View>
        <View style={styles.scheduleStatItem}>
          <Text style={[styles.scheduleStatValue, { color: COLORS.success }]}>{item.assigned}</Text>
          <Text style={styles.scheduleStatLabel}>Assigned</Text>
        </View>
        <View style={styles.scheduleStatItem}>
          <Text style={[styles.scheduleStatValue, { color: COLORS.error }]}>{item.unassigned}</Text>
          <Text style={styles.scheduleStatLabel}>Unassigned</Text>
        </View>
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
            <Text style={styles.managerName}>{hrManager.name}</Text>
            <Text style={styles.managerRole}>{hrManager.role}</Text>
            <Text style={styles.managerId}>ID: {hrManager.employeeId}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Main' as never, { screen: 'ProfileTab' } as never)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{hrManager.name.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{hrManager.totalEmployees}</Text>
            <Text style={styles.statLabel}>Total Staff</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="person-add-outline" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{hrManager.newHires}</Text>
            <Text style={styles.statLabel}>New Hires</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>{hrManager.pendingLeaves}</Text>
            <Text style={styles.statLabel}>Leave Requests</Text>
          </View>
        </View>

        {/* Leave Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Leave Requests</Text>
            <Text style={styles.sectionCount}>{leaveRequests.length}</Text>
          </View>
          
          <FlatList
            data={leaveRequests}
            renderItem={renderLeaveRequest}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Schedule Assignments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Assignments</Text>
          <FlatList
            data={scheduleAssignments}
            renderItem={renderSchedule}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Employees */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Employee Directory</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={employees}
            renderItem={renderEmployee}
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
              onPress={() => navigation.navigate('AddEmployee')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="person-add-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Add Employee</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('ManageLeaves')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Manage Leaves</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                Alert.alert(
                  'Assign Visits',
                  'Assign farm visits to available field workers and supervisors.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="clipboard-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Assign Visits</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                Alert.alert(
                  'Reports',
                  'View employee performance reports, attendance records, and HR analytics.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="stats-chart-outline" size={24} color={COLORS.primary} />
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
  employeeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  employeeAvatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  employeeId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  employeePosition: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
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
  employeeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  employeeDetailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  leaveCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  leaveName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  leaveEmployeeId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  pendingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    fontWeight: FONT_WEIGHTS.medium,
  },
  leaveType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  leaveDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  leaveActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  approveText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.background,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  rejectText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.background,
  },
  scheduleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  scheduleDate: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  scheduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scheduleStatItem: {
    alignItems: 'center',
  },
  scheduleStatValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  scheduleStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
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
});

export default HRManagerDashboardScreen;


import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { hrService, HRLeaveRequest } from '../../services/hrService';
import { useTranslation } from 'react-i18next';

function formatLeaveTypeLabel(leaveType: string, t: any): string {
  const map: Record<string, string> = {
    annual: t('admin.hrLeave.leaveTypes.annual', 'Annual Leave'),
    sick: t('admin.hrLeave.leaveTypes.sick', 'Sick Leave'),
    unpaid: t('admin.hrLeave.leaveTypes.unpaid', 'Unpaid Leave'),
    paternity: t('admin.hrLeave.leaveTypes.paternity', 'Paternity Leave'),
    other: t('admin.hrLeave.leaveTypes.other', 'Other'),
  };
  const key = (leaveType || '').toLowerCase().replace(/\s+/g, '_');
  return map[key] || leaveType;
}

const ManageLeavesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [list, setList] = useState<HRLeaveRequest[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchLeaves = useCallback(async (status: 'pending' | 'approved' | 'rejected', isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await hrService.getLeaveRequests({ status, per_page: 20 });
      if (res?.success && Array.isArray(res.data)) {
        setList(res.data);
      } else {
        setList([]);
      }
      if (res?.counts) {
        setCounts({
          pending: res.counts.pending ?? 0,
          approved: res.counts.approved ?? 0,
          rejected: res.counts.rejected ?? 0,
        });
      }
    } catch (err: any) {
      setList([]);
      Alert.alert(
        t('common.error', 'Error'),
        err.response?.data?.message || err.message || t('admin.hrLeave.failedToLoad', 'Failed to load leave requests')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLeaves(selectedFilter);
    }, [selectedFilter, fetchLeaves])
  );

  const onRefresh = useCallback(() => {
    fetchLeaves(selectedFilter, true);
  }, [selectedFilter, fetchLeaves]);

  const handleFilterChange = (filter: 'pending' | 'approved' | 'rejected') => {
    if (filter === selectedFilter) return;
    setSelectedFilter(filter);
    setList([]);
  };

  const handleApprove = (item: HRLeaveRequest) => {
    Alert.alert(
      t('admin.hrManagerDashboard.approveLeaveTitle', 'Approve Leave'),
      t('admin.hrManagerDashboard.approveLeaveConfirm', {
        type: formatLeaveTypeLabel(item.leave_type, t),
        name: item.applicant_name,
        id: item.applicant_id,
          defaultValue: `Approve ${formatLeaveTypeLabel(item.leave_type, t)} for ${item.applicant_name}?`,
      }),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('admin.hrManagerDashboard.approve', 'Approve'),
          onPress: async () => {
            setActionId(item.id);
            try {
              await hrService.approveLeaveRequest(item.id);
              Alert.alert(
                t('admin.hrManagerDashboard.successTitle', 'Success'),
                t('admin.hrManagerDashboard.leaveApproved', {
                  name: item.applicant_name,
                  defaultValue: `Leave approved for ${item.applicant_name}`,
                })
              );
              fetchLeaves(selectedFilter, true);
            } catch (err: any) {
              Alert.alert(
                t('common.error', 'Error'),
                err.response?.data?.message || err.message || t('admin.hrLeave.failedToApprove', 'Failed to approve')
              );
            } finally {
              setActionId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = (item: HRLeaveRequest) => {
    Alert.alert(
      t('admin.hrManagerDashboard.rejectLeaveTitle', 'Reject Leave'),
      t('admin.hrManagerDashboard.rejectLeaveConfirm', {
        type: formatLeaveTypeLabel(item.leave_type, t),
        name: item.applicant_name,
        id: item.applicant_id,
          defaultValue: `Reject ${formatLeaveTypeLabel(item.leave_type, t)} for ${item.applicant_name}?`,
      }),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('admin.hrManagerDashboard.reject', 'Reject'),
          style: 'destructive',
          onPress: async () => {
            setActionId(item.id);
            try {
              await hrService.rejectLeaveRequest(item.id);
              Alert.alert(
                t('admin.hrManagerDashboard.leaveRejectedTitle', 'Leave Rejected'),
                t('admin.hrManagerDashboard.leaveRejectedMessage', {
                  name: item.applicant_name,
                  defaultValue: `Leave request rejected for ${item.applicant_name}`,
                })
              );
              fetchLeaves(selectedFilter, true);
            } catch (err: any) {
              Alert.alert(
                t('common.error', 'Error'),
                err.response?.data?.message || err.message || t('admin.hrLeave.failedToReject', 'Failed to reject')
              );
            } finally {
              setActionId(null);
            }
          },
        },
      ]
    );
  };

  const filters: { id: 'pending' | 'approved' | 'rejected'; label: string; count: number }[] = [
    { id: 'pending', label: t('admin.hrLeave.pending', 'Pending'), count: counts.pending },
    { id: 'approved', label: t('admin.hrLeave.approved', 'Approved'), count: counts.approved },
    { id: 'rejected', label: t('admin.hrLeave.rejected', 'Rejected'), count: counts.rejected },
  ];

  const renderLeaveRequest = ({ item }: { item: HRLeaveRequest }) => {
    const leaveTypeLabel = formatLeaveTypeLabel(item.leave_type, t);
    const durationText = t('admin.hrLeave.daysCount', {
      count: item.duration_days,
      defaultValue: `${item.duration_days} ${item.duration_days === 1 ? 'day' : 'days'}`,
    });
    const isActioning = actionId === item.id;
    return (
      <View style={styles.leaveCard}>
        <View style={styles.leaveHeader}>
          <View style={styles.leaveHeaderLeft}>
            {item.profile_picture_url ? (
              <Image source={{ uri: item.profile_picture_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{(item.applicant_name || '?').charAt(0)}</Text>
              </View>
            )}
            <View>
              <Text style={styles.employeeName}>{item.applicant_name}</Text>
              <Text style={styles.employeeId}>{item.applicant_id}</Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'approved' ? COLORS.success + '20' :
                item.status === 'rejected' ? COLORS.error + '20' :
                COLORS.warning + '20',
            },
          ]}>
            <Text style={[
              styles.statusText,
              {
                color:
                  item.status === 'approved' ? COLORS.success :
                  item.status === 'rejected' ? COLORS.error :
                  COLORS.warning,
              },
            ]}>
              {item.status === 'approved'
                ? t('admin.hrLeave.approved', 'Approved')
                : item.status === 'rejected'
                ? t('admin.hrLeave.rejected', 'Rejected')
                : t('admin.hrLeave.pending', 'Pending')}
            </Text>
          </View>
        </View>

        <View style={styles.leaveDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{leaveTypeLabel}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{durationText}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="arrow-forward-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {t('admin.hrLeave.dateRange', {
                start: item.start_date,
                end: item.end_date,
                defaultValue: `${item.start_date} to ${item.end_date}`,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>{t('admin.hrLeave.reason', 'Reason')}:</Text>
          <Text style={styles.reasonText}>{item.reason || '—'}</Text>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.approveButton, isActioning && styles.actionDisabled]}
              onPress={() => handleApprove(item)}
              disabled={actionId !== null}
            >
              {isActioning ? (
                <ActivityIndicator size="small" color={COLORS.background} />
              ) : (
                <Ionicons name="checkmark" size={18} color={COLORS.background} />
              )}
              <Text style={styles.approveText}>{t('admin.hrManagerDashboard.approve', 'Approve')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectButton, isActioning && styles.actionDisabled]}
              onPress={() => handleReject(item)}
              disabled={actionId !== null}
            >
              {isActioning ? (
                <ActivityIndicator size="small" color={COLORS.background} />
              ) : (
                <Ionicons name="close" size={18} color={COLORS.background} />
              )}
              <Text style={styles.rejectText}>{t('admin.hrManagerDashboard.reject', 'Reject')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>{t('admin.hrManagerDashboard.manageLeaves', 'Manage Leaves')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filters – counts from API */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive,
            ]}
            onPress={() => handleFilterChange(filter.id)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.filterTextActive,
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterCount,
              selectedFilter === filter.id && styles.filterCountActive,
            ]}>
              <Text style={[
                styles.filterCountText,
                selectedFilter === filter.id && styles.filterCountTextActive,
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leave Requests List – from GET /hr/leave-requests */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={list}
          renderItem={renderLeaveRequest}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>
                {t('admin.hrLeave.emptyState', {
                  status: filters.find((f) => f.id === selectedFilter)?.label?.toLowerCase() ?? selectedFilter,
                  defaultValue: `No ${selectedFilter} leave requests`,
                })}
              </Text>
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
  placeholder: {
    width: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  filterTextActive: {
    color: COLORS.background,
  },
  filterCount: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: COLORS.background,
  },
  filterCountText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  filterCountTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.lg,
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
    marginBottom: SPACING.md,
  },
  leaveHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  employeeName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  employeeId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  leaveDetails: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  reasonBox: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  reasonLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reasonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  actionButtons: {
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
  actionDisabled: {
    opacity: 0.7,
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
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});

export default ManageLeavesScreen;













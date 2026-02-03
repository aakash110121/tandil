import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { adminService, AdminActivity } from '../../services/adminService';

const ACTIVITY_ICON_MAP: Record<string, { icon: string; color: string }> = {
  check: { icon: 'checkmark-circle', color: COLORS.success },
  error: { icon: 'warning', color: COLORS.error },
  warning: { icon: 'warning', color: COLORS.warning },
  person: { icon: 'person-add', color: COLORS.primary },
  user: { icon: 'person-add', color: COLORS.primary },
  customer: { icon: 'person-add', color: COLORS.primary },
  register: { icon: 'person-add', color: COLORS.primary },
  registration: { icon: 'person-add', color: COLORS.primary },
  subscription: { icon: 'checkmark-circle', color: COLORS.success },
  visit: { icon: 'checkmark-circle', color: COLORS.success },
  inventory: { icon: 'warning', color: COLORS.warning },
  stock: { icon: 'warning', color: COLORS.warning },
  alert: { icon: 'warning', color: COLORS.warning },
  default: { icon: 'document-text', color: COLORS.textSecondary },
};

function getActivityIcon(activity: AdminActivity): { icon: string; color: string } {
  const iconType = (activity.icon_type || activity.type || '').toLowerCase();
  const mapped = ACTIVITY_ICON_MAP[iconType] ?? ACTIVITY_ICON_MAP.default;
  const desc = (activity.description || '').toLowerCase();
  if (mapped !== ACTIVITY_ICON_MAP.default) return mapped;
  if (desc.includes('customer') || desc.includes('registered') || desc.includes('user')) return ACTIVITY_ICON_MAP.person;
  if (desc.includes('stock') || desc.includes('inventory') || desc.includes('out of')) return ACTIVITY_ICON_MAP.inventory;
  if (desc.includes('visit') || desc.includes('completed')) return ACTIVITY_ICON_MAP.visit;
  if (desc.includes('subscription')) return ACTIVITY_ICON_MAP.subscription;
  return mapped;
}

type ActivityItem = { id: string; message: string; timestamp: string; icon: string; color: string };

const LIMIT = 20;

const AdminRecentActivitiesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await adminService.getRecentActivities({ limit: LIMIT });
      const list = response.data ?? [];
      const now = Date.now();
      // Only show past activities: exclude future created_at and exclude "X from now" timestamp
      const pastOnly = list.filter((a: AdminActivity) => {
        const t = new Date(a.created_at || 0).getTime();
        const isPastDate = t > 0 && t <= now;
        const timestampStr = (a.timestamp || '').toLowerCase();
        const isFutureLabel = timestampStr.includes('from now');
        return isPastDate && !isFutureLabel;
      });
      // Sort by created_at descending (newest first) so activities are date-wise from current
      const sorted = [...pastOnly].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      const mapped: ActivityItem[] = sorted.map((a: AdminActivity, index: number) => {
        const { icon, color } = getActivityIcon(a);
        return {
          id: `activity-${index}-${a.related_id ?? ''}`,
          message: a.description ?? '',
          timestamp: a.timestamp ?? a.created_at ?? '',
          icon,
          color,
        };
      });
      setActivities(mapped);
    } catch (error: any) {
      console.error('Error fetching recent activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [fetchActivities])
  );

  const onRefresh = useCallback(() => {
    fetchActivities(true);
  }, [fetchActivities]);

  const renderActivity = ({ item }: { item: ActivityItem }) => (
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recent Activities</Text>
        <View style={styles.headerRight} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading activities…</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="list-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No recent activities</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
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
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});

export default AdminRecentActivitiesScreen;

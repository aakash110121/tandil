import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Header from '../../components/common/Header';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import {
  technicianSignupRequestService,
  TechnicianSignupRequest,
} from '../../services/technicianSignupRequestService';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch {
    return iso;
  }
}

const SupervisorSignupRequestsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState<TechnicianSignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadRequests = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const list = await technicianSignupRequestService.getRequests();
      setRequests(list);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRequests(false);
    }, [loadRequests])
  );

  const onApprove = (item: TechnicianSignupRequest) => {
    Alert.alert(
      t('supervisorSignupRequests.approveTitle'),
      t('supervisorSignupRequests.approveMessage', {
        name: item.name,
      }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('supervisorSignupRequests.approve'),
          onPress: async () => {
            setActioningId(item.id);
            try {
              await technicianSignupRequestService.approveRequest(item.id);
              await loadRequests(true);
              Alert.alert(
                t('common.success', { defaultValue: 'Success' }),
                t('supervisorSignupRequests.approvedSuccess', {
                })
              );
            } catch (err: any) {
              Alert.alert(
                t('common.error', { defaultValue: 'Error' }),
                err?.response?.data?.message ||
                  err?.message ||
                  t('supervisorSignupRequests.approveFailed')
              );
            } finally {
              setActioningId(null);
            }
          },
        },
      ]
    );
  };

  const onReject = (item: TechnicianSignupRequest) => {
    Alert.alert(
      t('supervisorSignupRequests.rejectTitle'),
      t('supervisorSignupRequests.rejectMessage', {
        name: item.name,
      }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('supervisorSignupRequests.reject'),
          style: 'destructive',
          onPress: async () => {
            setActioningId(item.id);
            try {
              await technicianSignupRequestService.rejectRequest(item.id);
              await loadRequests(true);
            } catch {
              Alert.alert(
                t('common.error', { defaultValue: 'Error' }),
                t('supervisorSignupRequests.rejectFailed')
              );
            } finally {
              setActioningId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: TechnicianSignupRequest }) => {
    const isActioning = actioningId === item.id;
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.email}</Text>
        <Text style={styles.meta}>{item.phone}</Text>
        <Text style={styles.date}>
          {t('supervisorSignupRequests.requestedAt')} {formatDate(item.created_at)}
        </Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.approveButton, isActioning && styles.disabledButton]}
            onPress={() => onApprove(item)}
            disabled={isActioning}
          >
            {isActioning ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color={COLORS.background} />
                <Text style={styles.approveText}>{t('supervisorSignupRequests.approve')}</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectButton, isActioning && styles.disabledButton]}
            onPress={() => onReject(item)}
            disabled={isActioning}
          >
            {isActioning ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <>
                <Ionicons name="close" size={16} color={COLORS.background} />
                <Text style={styles.rejectText}>{t('supervisorSignupRequests.reject')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('supervisorSignupRequests.title')}
        showBack
        onBackPress={() => navigation.goBack()}
      />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRequests(true)} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="mail-open-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>
                {t('supervisorSignupRequests.empty')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  name: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  meta: { marginTop: SPACING.xs, fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  date: { marginTop: SPACING.sm, fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
  },
  approveText: { color: COLORS.background, fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semiBold },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
  },
  rejectText: { color: COLORS.background, fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semiBold },
  disabledButton: { opacity: 0.7 },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { marginTop: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
});

export default SupervisorSignupRequestsScreen;


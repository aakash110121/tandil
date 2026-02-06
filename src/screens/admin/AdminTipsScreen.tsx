import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { adminService, Tip } from '../../services/adminService';

function formatTipDate(createdAt: string | undefined): string {
  if (!createdAt) return '';
  try {
    const d = new Date(createdAt);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

const AdminTipsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [tips, setTips] = useState<Tip[]>([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const fetchTips = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoadingTips(true);
    try {
      const res = await adminService.getTips();
      setTips(res.data ?? []);
    } catch (_) {
      setTips([]);
    } finally {
      setLoadingTips(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTips();
    }, [fetchTips])
  );

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert(t('admin.users.error') || 'Error', t('admin.sendTipsScreen.errorEnterBoth') || 'Please enter both title and description.');
      return;
    }
    setSending(true);
    try {
      await adminService.sendTip({
        title: title.trim(),
        description: message.trim(),
      });
      Alert.alert(t('admin.users.success') || 'Success', t('admin.sendTipsScreen.successSent') || 'Tip sent successfully.');
      setTitle('');
      setMessage('');
      fetchTips(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to send tip.';
      Alert.alert(t('admin.users.error') || 'Error', msg);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteTip = useCallback((item: Tip) => {
    Alert.alert(
      t('admin.sendTipsScreen.deleteTitle'),
      t('admin.sendTipsScreen.deleteMessage'),
      [
        { text: t('admin.settings.cancel'), style: 'cancel' },
        {
          text: t('admin.users.delete'),
          style: 'destructive',
          onPress: async () => {
            setDeletingId(item.id);
            try {
              await adminService.deleteTip(item.id);
              fetchTips(true);
            } catch (err: any) {
              const msg = err.response?.data?.message || err.message || t('admin.sendTipsScreen.deleteFailed');
              Alert.alert(t('admin.users.error'), msg);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }, [fetchTips, t]);

  const renderTip = ({ item }: { item: Tip }) => {
    const isDeleting = deletingId === item.id;
    return (
      <View style={styles.tipItem}>
        <View style={styles.tipIcon}><Ionicons name="leaf-outline" size={18} color={COLORS.primary} /></View>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.tipDate}>{formatTipDate(item.created_at)}</Text>
        </View>
        <TouchableOpacity
          style={styles.tipDeleteBtn}
          onPress={() => handleDeleteTip(item)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('admin.sendTipsScreen.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('admin.sendTipsScreen.composeTip')}</Text>
        <TextInput
          placeholder={t('admin.sendTipsScreen.titlePlaceholder')}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholderTextColor={COLORS.textSecondary}
        />
        <TextInput
          placeholder={t('admin.sendTipsScreen.messagePlaceholder')}
          value={message}
          onChangeText={setMessage}
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          multiline
          placeholderTextColor={COLORS.textSecondary}
        />
        <TouchableOpacity
          style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send-outline" size={18} color="#fff" />
          )}
          <Text style={styles.sendBtnText}>{sending ? (t('admin.sendTipsScreen.sending') || 'Sending…') : t('admin.sendTipsScreen.sendTip')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('admin.sendTipsScreen.recentTips')}</Text>
      {loadingTips && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={tips}
          renderItem={renderTip}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.sm }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchTips(true)} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>{t('admin.sendTipsScreen.noTips') || 'No tips yet. Send one above.'}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  card: { margin: SPACING.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg },
  cardTitle: { color: COLORS.text, fontWeight: FONT_WEIGHTS.bold, marginBottom: SPACING.sm },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.text, marginBottom: SPACING.sm },
  sendBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignSelf: 'flex-start' },
  sendBtnDisabled: { opacity: 0.7 },
  sendBtnText: { color: '#fff', fontWeight: FONT_WEIGHTS.medium },
  sectionTitle: { color: COLORS.textSecondary, paddingHorizontal: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.sm },
  loadingWrap: { padding: SPACING.lg, alignItems: 'center' },
  emptyWrap: { paddingVertical: SPACING.xl, alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  tipItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
  tipIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary + '15', marginRight: 10 },
  tipContent: { flex: 1, minWidth: 0 },
  tipTitle: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  tipDate: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  tipDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    marginLeft: SPACING.sm,
  },
});

export default AdminTipsScreen;













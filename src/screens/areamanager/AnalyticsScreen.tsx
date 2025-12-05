import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants';

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month'>('Week');

  const completion = 0.82; // 82%
  const barHeights = [32, 54, 28, 60, 48, 72, 39]; // mock trend bars

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Period Filters */}
      <View style={styles.filtersRow}>
        {(['Today', 'Week', 'Month'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.filterChip, period === p && styles.filterChipActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.filterText, period === p && styles.filterTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* KPI Grid */}
      <View style={styles.gridRow}>
        <View style={styles.gridItem}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.gridValue}>126</Text>
          <Text style={styles.gridLabel}>Visits</Text>
        </View>
        <View style={styles.gridItem}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.success + '20' }]}>
            <Ionicons name="checkmark-done-outline" size={18} color={COLORS.success} />
          </View>
          <Text style={styles.gridValue}>{Math.round(completion * 100)}%</Text>
          <Text style={styles.gridLabel}>Completion</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completion * 100}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.gridRow}>
        <View style={styles.gridItem}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.warning + '20' }]}>
            <Ionicons name="time-outline" size={18} color={COLORS.warning} />
          </View>
          <Text style={styles.gridValue}>34m</Text>
          <Text style={styles.gridLabel}>Avg Time</Text>
        </View>
        <View style={styles.gridItem}>
          <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="people-outline" size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.gridValue}>7</Text>
          <Text style={styles.gridLabel}>Active Teams</Text>
        </View>
      </View>

      {/* Trend (simple bars) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Trend</Text>
        <View style={styles.barsRow}>
          {barHeights.map((h, i) => (
            <View key={i} style={styles.barCol}>
              <View style={[styles.bar, { height: 10 + h }]} />
            </View>
          ))}
        </View>
      </View>

      {/* Top Teams */}
      <View style={styles.card}> 
        <Text style={styles.cardTitle}>Top Teams</Text>
        {[
          { name: 'SUP-2002', metric: '18 visits • 4.7★' },
          { name: 'SUP-2003', metric: '15 visits • 4.6★' },
          { name: 'SUP-2005', metric: '12 visits • 4.8★' },
        ].map((t) => (
          <View key={t.name} style={styles.teamRow}>
            <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '10' }] }>
              <Ionicons name="ribbon-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.teamName}>{t.name}</Text>
            <Text style={styles.teamMetric}>{t.metric}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  filtersRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary + '60' },
  filterText: { color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium },
  gridRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  gridItem: { flex: 1, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  gridValue: { fontSize: FONT_SIZES.xl, color: COLORS.text, fontWeight: FONT_WEIGHTS.bold },
  gridLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  progressTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: 6, backgroundColor: COLORS.success, borderRadius: 3 },
  card: { marginHorizontal: SPACING.lg, marginTop: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg },
  cardTitle: { color: COLORS.text, fontWeight: FONT_WEIGHTS.bold, marginBottom: SPACING.md },
  barsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 90 },
  barCol: { width: 16, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 16, borderRadius: 8, backgroundColor: COLORS.primary + '66' },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  teamName: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  teamMetric: { color: COLORS.textSecondary, marginLeft: 'auto' },
});

export default AnalyticsScreen;



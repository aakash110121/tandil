import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const STATS = [
  { id: 's-1', label: 'Visits Today', value: 18, icon: 'calendar-outline', color: COLORS.primary },
  { id: 's-2', label: 'Avg Duration', value: '36m', icon: 'time-outline', color: COLORS.warning },
  { id: 's-3', label: 'Customer Rating', value: '4.6', icon: 'star-outline', color: COLORS.success },
  { id: 's-4', label: 'Open Issues', value: 3, icon: 'alert-circle-outline', color: COLORS.error },
];

const MEMBERS = [
  { id: 'emp-1001', name: 'Khalid Ibrahim', completed: 8, rating: 4.7 },
  { id: 'emp-1002', name: 'Omar Saeed', completed: 6, rating: 4.5 },
  { id: 'emp-1003', name: 'Sara Ali', completed: 4, rating: 4.8 },
];

const TeamStatsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const renderStat = ({ item }: { item: typeof STATS[number] }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: item.color + '20' }] }>
        <Ionicons name={item.icon as any} size={20} color={item.color} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );

  const renderMember = ({ item }: { item: typeof MEMBERS[number] }) => (
    <View style={styles.memberRow}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberMeta}>Completed: {item.completed} • Rating: {item.rating}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Stats</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.statsGrid}>
              {STATS.map((s) => (
                <View key={s.id} style={styles.gridItem}>
                  {renderStat({ item: s })}
                </View>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Members</Text>
          </>
        }
        data={MEMBERS}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.md, gap: SPACING.sm }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  gridItem: { width: '48%' },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statValue: { fontSize: FONT_SIZES.xl, color: COLORS.text, fontWeight: FONT_WEIGHTS.bold },
  statLabel: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  sectionTitle: { color: COLORS.textSecondary, marginVertical: SPACING.sm },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  memberAvatarText: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },
  memberInfo: { flex: 1 },
  memberName: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  memberMeta: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
});

export default TeamStatsScreen;













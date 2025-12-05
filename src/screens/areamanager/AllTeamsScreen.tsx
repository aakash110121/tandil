import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const TEAMS = [
  { id: 'SUP-2002', name: 'Mohammed Khalil', region: 'Abu Dhabi Central', teamSize: 7, active: 6, done: 6 },
  { id: 'SUP-2003', name: 'Ali Rashid', region: 'Abu Dhabi Central', teamSize: 6, active: 8, done: 4 },
  { id: 'SUP-2005', name: 'Huda Noor', region: 'Abu Dhabi East', teamSize: 5, active: 3, done: 5 },
];

const AllTeamsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const renderTeam = ({ item }: { item: typeof TEAMS[number] }) => (
    <TouchableOpacity style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.teamLead}>{item.name}</Text>
          <Text style={styles.teamMeta}>{item.id} • {item.region}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </View>
      <View style={styles.metricsRow}>
        <View style={styles.metricChip}>
          <Ionicons name="people-outline" size={16} color={COLORS.primary} />
          <Text style={styles.metricText}>Team {item.teamSize}</Text>
        </View>
        <View style={styles.metricChip}>
          <Ionicons name="flash-outline" size={16} color={COLORS.warning} />
          <Text style={styles.metricText}>Active {item.active}</Text>
        </View>
        <View style={styles.metricChip}>
          <Ionicons name="checkmark-done-outline" size={16} color={COLORS.success} />
          <Text style={styles.metricText}>Done {item.done}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Teams</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={TEAMS}
        renderItem={renderTeam}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.sm }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  teamCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md },
  teamHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary + '10', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  avatarText: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },
  teamLead: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  teamMeta: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metricChip: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.border },
  metricText: { color: COLORS.text },
});

export default AllTeamsScreen;













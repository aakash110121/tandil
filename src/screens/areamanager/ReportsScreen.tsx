import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants';

const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const REPORTS = [
    { id: 'r-001', title: 'Weekly Summary', period: 'Oct 1 - Oct 7', size: '1.2MB' },
    { id: 'r-002', title: 'Team Performance', period: 'September', size: '860KB' },
    { id: 'r-003', title: 'Customer Satisfaction', period: 'Q3', size: '2.1MB' },
  ];

  const renderReport = ({ item }: { item: typeof REPORTS[number] }) => (
    <View style={styles.reportRow}>
      <View style={styles.reportLeft}>
        <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }] }>
          <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.reportTitle}>{item.title}</Text>
          <Text style={styles.reportMeta}>{item.period} • {item.size}</Text>
        </View>
      </View>
      <View style={styles.reportActions}>
        <TouchableOpacity style={styles.smallBtn}>
          <Ionicons name="download-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallBtn}>
          <Ionicons name="share-social-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Region Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Generate PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Reports</Text>
      <FlatList
        data={REPORTS}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.sm }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  actions: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.lg },
  actionBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  actionText: { color: COLORS.text },
  sectionTitle: { color: COLORS.textSecondary, paddingHorizontal: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.sm },
  reportRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
  reportLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  reportTitle: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  reportMeta: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  reportActions: { flexDirection: 'row', gap: 8 },
  smallBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
});

export default ReportsScreen;



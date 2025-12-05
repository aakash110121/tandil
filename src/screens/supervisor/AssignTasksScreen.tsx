import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const MOCK_TEAM = [
  { id: 'emp-1001', name: 'Khalid Ibrahim', activeTasks: 1 },
  { id: 'emp-1002', name: 'Omar Saeed', activeTasks: 0 },
  { id: 'emp-1003', name: 'Sara Ali', activeTasks: 2 },
];

const MOCK_TASKS = [
  { id: 'task-001', title: 'Tree Watering', duration: '30m' },
  { id: 'task-002', title: 'Palm Pruning', duration: '45m' },
  { id: 'task-003', title: 'Soil Fertilizing', duration: '25m' },
];

const AssignTasksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(MOCK_TEAM[0]?.id ?? null);

  const renderEmployee = ({ item }: { item: typeof MOCK_TEAM[number] }) => (
    <TouchableOpacity
      style={[styles.employeeItem, selectedEmployeeId === item.id && styles.employeeItemSelected]}
      onPress={() => setSelectedEmployeeId(item.id)}
    >
      <View style={styles.employeeAvatar}>
        <Text style={styles.employeeAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeMeta}>ID: {item.id} • Active: {item.activeTasks}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTask = ({ item }: { item: typeof MOCK_TASKS[number] }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskIcon}>
        <Ionicons name="leaf-outline" size={18} color={COLORS.primary} />
      </View>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskMeta}>Duration: {item.duration}</Text>
      </View>
      <TouchableOpacity
        style={styles.assignBtn}
        onPress={() => {
          // Simulate assignment
          if (!selectedEmployeeId) return;
          alert(`Assigned '${item.title}' to ${MOCK_TEAM.find((e) => e.id === selectedEmployeeId)?.name}`);
        }}
      >
        <Text style={styles.assignBtnText}>Assign</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Tasks</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Members</Text>
        <FlatList
          data={MOCK_TEAM}
          renderItem={renderEmployee}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: SPACING.sm }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Tasks</Text>
        <FlatList
          data={MOCK_TASKS}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        />
      </View>
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
  section: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  employeeItem: {
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
  },
  employeeItemSelected: { borderColor: COLORS.primary + '90' },
  employeeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  employeeAvatarText: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },
  employeeInfo: { flex: 1 },
  employeeName: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  employeeMeta: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  taskInfo: { flex: 1 },
  taskTitle: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  taskMeta: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  assignBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  assignBtnText: { color: '#fff', fontWeight: FONT_WEIGHTS.medium },
});

export default AssignTasksScreen;













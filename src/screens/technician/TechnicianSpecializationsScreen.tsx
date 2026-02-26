import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { getTechnicianSpecializations, updateTechnicianSpecializations } from '../../services/technicianService';

const TechnicianSpecializationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTechnicianSpecializations()
      .then(list => setSpecializations(list))
      .finally(() => setLoading(false));
  }, []);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (specializations.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Already added', `"${trimmed}" is already in your list.`);
      return;
    }
    setSpecializations(prev => [...prev, trimmed]);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    setSpecializations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateTechnicianSpecializations(specializations);
      setSaving(false);
      if (result.success) {
        Alert.alert('Saved', result.message ?? 'Specializations updated.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', result.message ?? 'Failed to save.');
      }
    } catch {
      setSaving(false);
      Alert.alert('Error', 'Failed to save specializations. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skills & Specializations</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>Add skills or specializations (e.g. AC, Plumbing, Electrical). Tap Save to update.</Text>

        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={newSkill}
            onChangeText={setNewSkill}
            placeholder="e.g. AC, Plumbing"
            placeholderTextColor={COLORS.textSecondary}
            onSubmitEditing={addSkill}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addSkill}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your specializations ({specializations.length})</Text>
          {specializations.length === 0 ? (
            <Text style={styles.emptyText}>No specializations yet. Add one above.</Text>
          ) : (
            <View style={styles.tagsRow}>
              {specializations.map((spec, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{spec}</Text>
                  <TouchableOpacity onPress={() => removeSkill(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.sm, minWidth: 40 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  hint: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  addRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingVertical: SPACING.xs,
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.xs,
    gap: 4,
  },
  tagText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: '#fff' },
});

export default TechnicianSpecializationsScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

export type VacationItem = { start_date: string; end_date: string; reason?: string };

function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type RouteParams = { initialVacations?: VacationItem[] };

const TechnicianVacationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const initialVacations = (route.params as RouteParams)?.initialVacations ?? [];

  const [vacations, setVacations] = useState<VacationItem[]>(initialVacations);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [pickerOpen, setPickerOpen] = useState<'start' | 'end' | null>(null);

  const addVacation = () => {
    if (!startDate.trim()) {
      Alert.alert('Error', 'Please select start date.');
      return;
    }
    if (!endDate.trim()) {
      Alert.alert('Error', 'Please select end date.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      Alert.alert('Error', 'End date must be on or after start date.');
      return;
    }
    setVacations(prev => [...prev, { start_date: startDate, end_date: endDate, reason: reason.trim() || undefined }]);
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const removeVacation = (index: number) => {
    setVacations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    navigation.navigate('Main', { screen: 'ScheduleTab', params: { vacations } });
  };

  const getPickerValue = (): Date => {
    if (pickerOpen === 'start') return startDate ? new Date(startDate + 'T12:00:00') : new Date();
    return endDate ? new Date(endDate + 'T12:00:00') : new Date();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Vacation</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add vacation</Text>
          <TouchableOpacity style={styles.dateRow} onPress={() => setPickerOpen('start')}>
            <Text style={styles.dateRowLabel}>Start date</Text>
            <Text style={styles.dateRowValue}>{startDate || 'Select date'}</Text>
            <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateRow} onPress={() => setPickerOpen('end')}>
            <Text style={styles.dateRowLabel}>End date</Text>
            <Text style={styles.dateRowValue}>{endDate || 'Select date'}</Text>
            <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Reason (optional)"
            placeholderTextColor={COLORS.textSecondary}
            value={reason}
            onChangeText={setReason}
          />
          <TouchableOpacity style={styles.addButton} onPress={addVacation}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add vacation</Text>
          </TouchableOpacity>
        </View>

        {pickerOpen !== null && (
          <DateTimePicker
            value={getPickerValue()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') setPickerOpen(null);
              if (event.type === 'dismissed') return;
              if (selectedDate) {
                const formatted = formatDateToYYYYMMDD(selectedDate);
                if (pickerOpen === 'start') setStartDate(formatted);
                else setEndDate(formatted);
              }
            }}
          />
        )}
        {Platform.OS === 'ios' && pickerOpen !== null && (
          <TouchableOpacity style={styles.donePicker} onPress={() => setPickerOpen(null)}>
            <Text style={styles.donePickerText}>Done</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your vacations ({vacations.length})</Text>
          {vacations.length === 0 ? (
            <Text style={styles.emptyText}>No vacations added. Add one above.</Text>
          ) : (
            vacations.map((v, index) => (
              <View key={index} style={styles.vacationCard}>
                <View style={styles.vacationCardContent}>
                  <Text style={styles.vacationDates}>{v.start_date} – {v.end_date}</Text>
                  {v.reason ? <Text style={styles.vacationReason}>{v.reason}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => removeVacation(index)} style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={22} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  saveButton: { padding: SPACING.sm },
  saveButtonText: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium },
  scroll: { flex: 1 },
  section: { marginBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SPACING.md },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dateRowLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, flex: 1 },
  dateRowValue: { fontSize: FONT_SIZES.md, color: COLORS.text, marginRight: SPACING.sm },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  addButtonText: { fontSize: FONT_SIZES.md, color: '#fff', fontWeight: FONT_WEIGHTS.medium },
  donePicker: { padding: SPACING.md, alignItems: 'flex-end' },
  donePickerText: { fontSize: FONT_SIZES.md, color: COLORS.primary },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  vacationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  vacationCardContent: { flex: 1 },
  vacationDates: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  vacationReason: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  removeBtn: { padding: SPACING.sm },
});

export default TechnicianVacationScreen;

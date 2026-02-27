import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

export type BreakItem = { date: string; start_time: string; end_time: string; reason?: string };

function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

type RouteParams = { initialBreaks?: BreakItem[] };

const TechnicianBreakTimeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const initialBreaks = (route.params as RouteParams)?.initialBreaks ?? [];

  const [breaks, setBreaks] = useState<BreakItem[]>(initialBreaks);
  const [date, setDate] = useState(formatDateToYYYYMMDD(new Date()));
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('13:00');
  const [reason, setReason] = useState('');
  const [pickerMode, setPickerMode] = useState<'date' | 'start' | 'end' | null>(null);

  const addBreak = () => {
    if (!date.trim()) {
      Alert.alert(t('technician.error'), t('technician.breakTime.pleaseSelectDate'));
      return;
    }
    setBreaks(prev => [...prev, { date, start_time: startTime, end_time: endTime, reason: reason.trim() || undefined }]);
    setReason('');
  };

  const removeBreak = (index: number) => {
    setBreaks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    navigation.navigate('Main', { screen: 'ScheduleTab', params: { breaks } });
  };

  const getPickerValue = (): Date => {
    if (pickerMode === 'date') return date ? new Date(date + 'T12:00:00') : new Date();
    if (pickerMode === 'start') {
      const [h, m] = startTime.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }
    const [h, m] = endTime.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('technician.setBreakTime')}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('technician.done')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('technician.breakTime.addBreak')}</Text>
          <TouchableOpacity
            style={styles.dateRow}
            onPress={() => setPickerMode('date')}
          >
            <Text style={styles.dateRowLabel}>{t('technician.breakTime.date')}</Text>
            <Text style={styles.dateRowValue}>{date || t('technician.selectDate')}</Text>
            <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateRow}
            onPress={() => setPickerMode('start')}
          >
            <Text style={styles.dateRowLabel}>{t('technician.breakTime.startTime')}</Text>
            <Text style={styles.dateRowValue}>{startTime}</Text>
            <Ionicons name="time-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateRow}
            onPress={() => setPickerMode('end')}
          >
            <Text style={styles.dateRowLabel}>{t('technician.breakTime.endTime')}</Text>
            <Text style={styles.dateRowValue}>{endTime}</Text>
            <Ionicons name="time-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={addBreak}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>{t('technician.breakTime.addBreak')}</Text>
          </TouchableOpacity>
        </View>

        {pickerMode !== null && (
          <DateTimePicker
            value={getPickerValue()}
            mode={pickerMode === 'date' ? 'date' : 'time'}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') setPickerMode(null);
              if (event.type === 'dismissed') return;
              if (selectedDate) {
                if (pickerMode === 'date') setDate(formatDateToYYYYMMDD(selectedDate));
                else if (pickerMode === 'start') setStartTime(formatTime(selectedDate));
                else setEndTime(formatTime(selectedDate));
              }
            }}
          />
        )}
        {Platform.OS === 'ios' && pickerMode !== null && (
          <TouchableOpacity style={styles.donePicker} onPress={() => setPickerMode(null)}>
            <Text style={styles.donePickerText}>{t('technician.done')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('technician.breakTime.yourBreaks', { count: breaks.length })}</Text>
          {breaks.length === 0 ? (
            <Text style={styles.emptyText}>{t('technician.breakTime.noBreaksAdded')}</Text>
          ) : (
            breaks.map((b, index) => (
              <View key={index} style={styles.breakCard}>
                <View style={styles.breakCardContent}>
                  <Text style={styles.breakDate}>{b.date}</Text>
                  <Text style={styles.breakTime}>{b.start_time} – {b.end_time}</Text>
                  {b.reason ? <Text style={styles.breakReason}>{b.reason === 'Lunch' ? t('technician.breakTime.lunch') : b.reason}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => removeBreak(index)} style={styles.removeBtn}>
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
  breakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  breakCardContent: { flex: 1 },
  breakDate: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  breakTime: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  breakReason: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  removeBtn: { padding: SPACING.sm },
});

export default TechnicianBreakTimeScreen;

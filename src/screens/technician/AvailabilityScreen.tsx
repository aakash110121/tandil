import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { updateTechnicianAvailability, getTechnicianDashboard, getTechnicianAvailability } from '../../services/technicianService';

const DAY_TO_API: Record<string, string> = {
  monday: 'mon',
  tuesday: 'tue',
  wednesday: 'wed',
  thursday: 'thu',
  friday: 'fri',
  saturday: 'sat',
  sunday: 'sun',
};

const API_TO_DAY: Record<string, string> = {
  mon: 'monday',
  tue: 'tuesday',
  wed: 'wednesday',
  thu: 'thursday',
  fri: 'friday',
  sat: 'saturday',
  sun: 'sunday',
};

/** Normalize "12:00:00" -> "12:00" for break times */
function toHHmm(s: string): string {
  if (!s) return s;
  const part = s.split(':').slice(0, 2).join(':');
  return part.length >= 5 ? part : s;
}

const SLOT_DEFINITIONS = [
  { id: 'morning', label: 'Morning', time: '9:00 AM - 12:00 PM', start: '09:00', end: '12:00' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 5:00 PM', start: '12:00', end: '17:00' },
  { id: 'evening', label: 'Evening', time: '5:00 PM - 9:00 PM', start: '17:00', end: '21:00' },
];

type AvailabilityParams = {
  breaks?: Array<{ date: string; start_time: string; end_time: string; reason?: string }>;
  vacations?: Array<{ start_date: string; end_date: string; reason?: string }>;
  service_areas?: string[];
};

const SLOT_HOURS: Record<string, number> = { morning: 3, afternoon: 5, evening: 4 };

const AvailabilityScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const [isOnline, setIsOnline] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [selectedDays, setSelectedDays] = useState(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
  const [slotEnabled, setSlotEnabled] = useState<Record<string, boolean>>({
    morning: true,
    afternoon: true,
    evening: false,
  });
  const [breaks, setBreaks] = useState<Array<{ date: string; start_time: string; end_time: string; reason?: string }>>([]);
  const [vacations, setVacations] = useState<Array<{ start_date: string; end_date: string; reason?: string }>>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [weekStats, setWeekStats] = useState<{ availableDays: number; totalHours: number; completedJobs: number }>({
    availableDays: 0,
    totalHours: 0,
    completedJobs: 0,
  });

  const params = (route.params ?? {}) as AvailabilityParams;
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    if (params.breaks != null) setBreaks(params.breaks);
    if (params.vacations != null) setVacations(params.vacations);
    if (params.service_areas != null) setServiceAreas(params.service_areas);
  }, [params.breaks, params.vacations, params.service_areas]);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      setLoadingSchedule(true);
      getTechnicianAvailability()
        .then(data => {
          if (cancelled) return;
          const fromParams = paramsRef.current;
          if (data) {
            setIsOnline(data.is_online);
            setAutoAccept(data.auto_accept_jobs);
            const days = (data.working_days ?? [])
              .map(d => API_TO_DAY[d?.toLowerCase?.()] ?? d)
              .filter(Boolean);
            if (days.length > 0) setSelectedDays(days);
            const slots = (data.working_hours_slots ?? []).map(s => s.slot);
            setSlotEnabled(prev => {
              const next = { ...prev };
              SLOT_DEFINITIONS.forEach(s => {
                next[s.id] = slots.includes(s.id);
              });
              return next;
            });
            const areas = data.service_areas?.length
              ? data.service_areas
              : data.service_area
                ? [data.service_area]
                : [];
            if (fromParams.service_areas == null) setServiceAreas(areas);
            if (fromParams.breaks == null) {
              setBreaks((data.breaks ?? []).map(b => ({
                date: b.date,
                start_time: toHHmm(b.start_time),
                end_time: toHHmm(b.end_time),
                reason: b.reason,
              })));
            }
            if (fromParams.vacations == null) {
              setVacations((data.vacations ?? []).map(v => ({
                start_date: v.start_date,
                end_date: v.end_date,
                reason: v.reason,
              })));
            }
          }
        })
        .finally(() => {
          if (!cancelled) setLoadingSchedule(false);
        });
      getTechnicianDashboard().then(dashboard => {
        if (cancelled) return;
        const completedJobs = dashboard?.weekly_kpis?.visits_done ?? 0;
        setWeekStats(prev => ({ ...prev, completedJobs }));
      });
      return () => { cancelled = true; };
    }, [])
  );

  useEffect(() => {
    const days = selectedDays.length;
    const hoursPerDay = SLOT_DEFINITIONS.reduce((sum, s) => sum + (slotEnabled[s.id] ? (SLOT_HOURS[s.id] ?? 0) : 0), 0);
    setWeekStats(prev => ({ ...prev, availableDays: days, totalHours: days * hoursPerDay }));
  }, [selectedDays.length, slotEnabled]);

  const weekDays = [
    { id: 'monday', label: 'Monday', short: 'Mon' },
    { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { id: 'thursday', label: 'Thursday', short: 'Thu' },
    { id: 'friday', label: 'Friday', short: 'Fri' },
    { id: 'saturday', label: 'Saturday', short: 'Sat' },
    { id: 'sunday', label: 'Sunday', short: 'Sun' },
  ];

  const handleDayToggle = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(day => day !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleTimeSlotToggle = (slotId: string) => {
    setSlotEnabled(prev => ({ ...prev, [slotId]: !prev[slotId] }));
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const working_days = selectedDays.map(d => DAY_TO_API[d] ?? d).filter(Boolean);
      const working_hours_slots = SLOT_DEFINITIONS.filter(s => slotEnabled[s.id]).map(s => ({
        slot: s.id,
        start: s.start,
        end: s.end,
      }));
      const result = await updateTechnicianAvailability({
        is_online: isOnline,
        auto_accept_jobs: autoAccept,
        working_days,
        working_hours_slots,
        ...(breaks.length > 0 && { breaks }),
        ...(vacations.length > 0 && { vacations }),
        service_areas: serviceAreas,
        ...(serviceAreas.length === 1 && { service_area: serviceAreas[0] }),
      });
      setSaving(false);
      if (result.success) {
        Alert.alert('Saved', result.message ?? 'Your availability has been saved.');
      } else {
        Alert.alert('Error', result.message ?? 'Failed to save availability.');
      }
    } catch {
      setSaving(false);
      Alert.alert('Error', 'Failed to save availability. Please try again.');
    }
  };

  const renderDayItem = (day: any) => (
    <TouchableOpacity
      key={day.id}
      style={[
        styles.dayItem,
        selectedDays.includes(day.id) && styles.dayItemActive
      ]}
      onPress={() => handleDayToggle(day.id)}
    >
      <Text style={[
        styles.dayLabel,
        selectedDays.includes(day.id) && styles.dayLabelActive
      ]}>
        {day.short}
      </Text>
    </TouchableOpacity>
  );

  const renderTimeSlot = (slot: (typeof SLOT_DEFINITIONS)[0]) => (
    <View key={slot.id} style={styles.timeSlotCard}>
      <View style={styles.timeSlotHeader}>
        <View>
          <Text style={styles.timeSlotLabel}>{slot.label}</Text>
          <Text style={styles.timeSlotTime}>{slot.time}</Text>
        </View>
        <Switch
          value={slotEnabled[slot.id] ?? false}
          onValueChange={() => handleTimeSlotToggle(slot.id)}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={COLORS.background}
        />
      </View>
    </View>
  );

  if (loadingSchedule) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading schedule…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSchedule}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Online Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Online Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusInfo}>
                <Ionicons name="wifi" size={24} color={COLORS.primary} />
                <View style={styles.statusText}>
                  <Text style={styles.statusTitle}>Go Online</Text>
                  <Text style={styles.statusSubtitle}>Accept new job requests</Text>
                </View>
              </View>
              <Switch
                value={isOnline}
                onValueChange={setIsOnline}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            </View>
          </View>
        </View>

        {/* Auto Accept */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Acceptance</Text>
          <View style={styles.autoAcceptCard}>
            <View style={styles.autoAcceptHeader}>
              <View style={styles.autoAcceptInfo}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                <View style={styles.autoAcceptText}>
                  <Text style={styles.autoAcceptTitle}>Auto Accept Jobs</Text>
                  <Text style={styles.autoAcceptSubtitle}>Automatically accept job requests</Text>
                </View>
              </View>
              <Switch
                value={autoAccept}
                onValueChange={setAutoAccept}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            </View>
          </View>
        </View>

        {/* Working Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Days</Text>
          <View style={styles.daysContainer}>
            {weekDays.map(renderDayItem)}
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Hours</Text>
          <View style={styles.timeSlotsContainer}>
            {SLOT_DEFINITIONS.map(renderTimeSlot)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('SetBreakTime', { initialBreaks: breaks })}
            >
              <Ionicons name="time-outline" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Set Break Time</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('SetVacation', { initialVacations: vacations })}
            >
              <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Set Vacation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('ServiceAreas', { initialServiceAreas: serviceAreas })}
            >
              <Ionicons name="location-outline" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Service Areas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
              <Text style={styles.quickActionText}>Advanced Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics - from dashboard API and local availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.success} />
              <Text style={styles.statValue}>{weekStats.availableDays} days</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{weekStats.totalHours} hours</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="construct-outline" size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>{weekStats.completedJobs} jobs</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  saveButton: {
    padding: SPACING.sm,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: SPACING.md,
  },
  statusTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  statusSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  autoAcceptCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  autoAcceptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoAcceptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoAcceptText: {
    marginLeft: SPACING.md,
  },
  autoAcceptTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  autoAcceptSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  dayLabelActive: {
    color: COLORS.background,
  },
  timeSlotsContainer: {
    gap: SPACING.md,
  },
  timeSlotCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSlotLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  timeSlotTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default AvailabilityScreen;

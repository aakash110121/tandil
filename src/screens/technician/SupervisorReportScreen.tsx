import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Button } from '../../components/common/Button';

interface ReportOption {
  id: string;
  label: string;
  icon: string;
  selected: boolean;
}

const SupervisorReportScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { visitId } = route.params || { visitId: 'visit_001' };
  
  const [reportOptions, setReportOptions] = useState<ReportOption[]>([
    { id: 'fertilizer', label: 'Needs Fertilizer', icon: 'nutrition-outline', selected: false },
    { id: 'vitamins', label: 'Needs Vitamins', icon: 'medical-outline', selected: false },
    { id: 'watering', label: 'Needs Watering', icon: 'water-outline', selected: false },
    { id: 'soil', label: 'Needs New Soil', icon: 'cube-outline', selected: false },
    { id: 'pruning', label: 'Needs Pruning', icon: 'cut-outline', selected: false },
  ]);

  const fieldReport = {
    id: visitId,
    technicianName: 'Ahmed Hassan',
    employeeId: 'EMP-1001',
    customerName: 'Mohammed Ali Farm',
    service: 'Tree Watering & Irrigation Check',
    visitDate: '2024-01-15',
    visitTime: '8:00 AM',
    fieldNotes: 'Completed watering of all palm trees. Noticed some trees have dry soil. Drip irrigation system checked - found minor leak in section B. Date palms looking healthy overall.',
    photos: [
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
      'https://images.unsplash.com/photo-1615486363561-9be0d9e74075?w=400',
    ],
  };

  const toggleOption = (id: string) => {
    setReportOptions(reportOptions.map(option => 
      option.id === id ? { ...option, selected: !option.selected } : option
    ));
  };

  const handleSubmitReport = () => {
    const selectedOptions = reportOptions.filter(opt => opt.selected);
    if (selectedOptions.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one recommendation');
      return;
    }

    const recommendations = selectedOptions.map(opt => opt.label).join(', ');
    Alert.alert(
      'Submit Supervisor Report',
      `Send report to ${fieldReport.customerName} with recommendations: ${recommendations}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Report', 
          onPress: () => {
            Alert.alert('Success', 'Supervisor report sent to client successfully!');
            navigation.goBack();
          }
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>{t('technician.supervisorReport')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Technician Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Field Worker</Text>
          <View style={styles.techCard}>
            <View style={styles.techInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{fieldReport.technicianName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.techName}>{fieldReport.technicianName}</Text>
                <Text style={styles.techId}>ID: {fieldReport.employeeId}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Visit Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Information</Text>
          <View style={styles.visitCard}>
            <Text style={styles.customerName}>{fieldReport.customerName}</Text>
            <Text style={styles.serviceName}>{fieldReport.service}</Text>
            <View style={styles.visitDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{fieldReport.visitDate}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{fieldReport.visitTime}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Field Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Field Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>{fieldReport.fieldNotes}</Text>
          </View>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Field Photos</Text>
          <View style={styles.photosContainer}>
            {fieldReport.photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.photo} />
            ))}
          </View>
        </View>

        {/* Supervisor Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Recommendations</Text>
          <Text style={styles.sectionSubtitle}>
            Choose what the farm needs based on the field report
          </Text>
          <View style={styles.optionsContainer}>
            {reportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  option.selected && styles.optionCardSelected
                ]}
                onPress={() => toggleOption(option.id)}
              >
                <View style={[
                  styles.optionIcon,
                  option.selected && styles.optionIconSelected
                ]}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={option.selected ? COLORS.background : COLORS.primary} 
                  />
                </View>
                <Text style={[
                  styles.optionLabel,
                  option.selected && styles.optionLabelSelected
                ]}>
                  {option.label}
                </Text>
                {option.selected && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.section}>
          <Button
            title="Submit Report to Client"
            onPress={handleSubmitReport}
            style={styles.submitButton}
          />
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
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  techCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  techInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  techName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  techId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  visitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  customerName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  serviceName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  visitDetails: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  notesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  notesText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: BORDER_RADIUS.md,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionIconSelected: {
    backgroundColor: COLORS.primary,
  },
  optionLabel: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  optionLabelSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  submitButton: {
    width: '100%',
  },
});

export default SupervisorReportScreen;











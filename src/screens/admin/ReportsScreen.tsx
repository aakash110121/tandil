import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const { width } = Dimensions.get('window');

const ReportsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const stats = useMemo(
    () => [
      { id: 'revenue', titleKey: 'admin.reports.totalRevenue', value: 'AED 45,280', change: '+12.5%', trend: 'up', icon: 'cash', color: COLORS.success },
      { id: 'visits', titleKey: 'admin.reports.totalVisits', value: '1,245', change: '+8.2%', trend: 'up', icon: 'calendar', color: COLORS.primary },
      { id: 'customers', titleKey: 'admin.reports.activeCustomers', value: '342', change: '+15.3%', trend: 'up', icon: 'people', color: COLORS.info },
      { id: 'workers', titleKey: 'admin.reports.activeWorkers', value: '28', change: '-2.1%', trend: 'down', icon: 'person', color: COLORS.warning },
    ],
    []
  );

  const reportTypes = useMemo(
    () => [
      { id: 'financial', titleKey: 'admin.reports.financialReport', descKey: 'admin.reports.financialDescription', icon: 'bar-chart', color: COLORS.success },
      { id: 'performance', titleKey: 'admin.reports.performanceReport', descKey: 'admin.reports.performanceDescription', icon: 'trending-up', color: COLORS.primary },
      { id: 'customer', titleKey: 'admin.reports.customerReport', descKey: 'admin.reports.customerDescription', icon: 'happy', color: COLORS.info },
      { id: 'operational', titleKey: 'admin.reports.operationalReport', descKey: 'admin.reports.operationalDescription', icon: 'analytics', color: COLORS.warning },
    ],
    []
  );

  const periods = useMemo(
    () => [
      { id: 'day', labelKey: 'admin.reports.today' },
      { id: 'week', labelKey: 'admin.reports.week' },
      { id: 'month', labelKey: 'admin.reports.month' },
      { id: 'year', labelKey: 'admin.reports.year' },
    ],
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('admin.reports.title')}</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodChip,
                selectedPeriod === period.id && styles.periodChipActive
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period.id && styles.periodTextActive
              ]}>
                {t(period.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statTitle}>{t(stat.titleKey)}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <View style={styles.statChange}>
                <Ionicons 
                  name={stat.trend === 'up' ? 'trending-up' : 'trending-down'} 
                  size={14} 
                  color={stat.trend === 'up' ? COLORS.success : COLORS.error} 
                />
                <Text style={[
                  styles.statChangeText,
                  { color: stat.trend === 'up' ? COLORS.success : COLORS.error }
                ]}>
                  {stat.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.reports.reportTypesSection')}</Text>
          {reportTypes.map((report) => (
            <TouchableOpacity key={report.id} style={styles.reportCard}>
              <View style={[styles.reportIcon, { backgroundColor: report.color + '20' }]}>
                <Ionicons name={report.icon as any} size={28} color={report.color} />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{t(report.titleKey)}</Text>
                <Text style={styles.reportDescription}>{t(report.descKey)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.reports.quickActionsSection')}</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>{t('admin.reports.generateReport')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="share-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>{t('admin.reports.shareReport')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="calendar-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>{t('admin.reports.scheduleReport')}</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  exportButton: {
    padding: SPACING.sm,
  },
  periodContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  periodChip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  periodChipActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  periodTextActive: {
    color: COLORS.background,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statChangeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reportIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default ReportsScreen;
















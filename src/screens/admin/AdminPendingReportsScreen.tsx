import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Button } from '../../components/common/Button';

// This will be created in services
// import { reportService } from '../../services/reportService';

interface Report {
  id: number;
  title: string;
  type: string;
  status: 'pending' | 'generated' | 'scheduled';
  created_at: string;
  scheduled_at?: string;
  generated_at?: string;
  file_url?: string;
}

const AdminPendingReportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const reportTypes = [
    { value: 'financial', label: 'Financial Report', description: 'Revenue, expenses, and profit analysis' },
    { value: 'performance', label: 'Performance Report', description: 'Worker productivity and ratings' },
    { value: 'customer', label: 'Customer Report', description: 'Customer satisfaction and retention' },
    { value: 'operational', label: 'Operational Report', description: 'Service efficiency and completion rates' },
    { value: 'user', label: 'User Report', description: 'User statistics and activity' },
    { value: 'subscription', label: 'Subscription Report', description: 'Subscription analytics and trends' },
  ];

  // TODO: Replace with actual API call
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      // const response = await reportService.getReports();
      // setReports(response.data);
      
      // Mock data for now
      setReports([
        {
          id: 1,
          title: 'Monthly Financial Report',
          type: 'financial',
          status: 'pending',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          title: 'Weekly Performance Report',
          type: 'performance',
          status: 'generated',
          created_at: '2024-01-14T09:00:00Z',
          generated_at: '2024-01-14T10:30:00Z',
          file_url: 'https://example.com/reports/report-2.pdf',
        },
        {
          id: 3,
          title: 'Customer Satisfaction Report',
          type: 'customer',
          status: 'scheduled',
          created_at: '2024-01-13T08:00:00Z',
          scheduled_at: '2024-01-20T09:00:00Z',
        },
      ]);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleMenuPress = (report: Report) => {
    setSelectedReport(report);
    setShowActionMenu(true);
  };

  const handleGenerateReport = async () => {
    if (!reportType) {
      Alert.alert('Error', 'Please select a report type');
      return;
    }

    try {
      // TODO: Call API to generate report
      // await reportService.generateReport({ type: reportType });
      Alert.alert('Success', 'Report generation started. You will be notified when it\'s ready.');
      setShowGenerateModal(false);
      setReportType('');
      fetchReports();
    } catch (error: any) {
      console.error('Error generating report:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate report');
    }
  };

  const handleShareReport = async (report: Report) => {
    if (!report.file_url) {
      Alert.alert('Error', 'Report file not available');
      return;
    }

    try {
      await Share.share({
        message: `Check out this ${report.title}: ${report.file_url}`,
        url: report.file_url,
        title: report.title,
      });
      setShowActionMenu(false);
    } catch (error: any) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const handleScheduleReport = async () => {
    if (!reportType || !scheduleDate || !scheduleTime) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      // TODO: Call API to schedule report
      // await reportService.scheduleReport({
      //   type: reportType,
      //   scheduled_at: `${scheduleDate} ${scheduleTime}`,
      // });
      Alert.alert('Success', 'Report scheduled successfully');
      setShowScheduleModal(false);
      setReportType('');
      setScheduleDate('');
      setScheduleTime('');
      fetchReports();
    } catch (error: any) {
      console.error('Error scheduling report:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to schedule report');
    }
  };

  const handleDownloadReport = async (report: Report) => {
    if (!report.file_url) {
      Alert.alert('Error', 'Report file not available');
      return;
    }

    try {
      // TODO: Implement download functionality
      Alert.alert('Success', 'Report download started');
      setShowActionMenu(false);
    } catch (error: any) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Failed to download report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'generated':
        return COLORS.success;
      case 'scheduled':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'generated':
        return 'Generated';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const renderReport = ({ item }: { item: Report }) => {
    const typeLabel = reportTypes.find(t => t.value === item.type)?.label || item.type;
    
    return (
      <TouchableOpacity style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportType}>{typeLabel}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.reportMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>Created: {formatDate(item.created_at)}</Text>
          </View>
          {item.scheduled_at && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>Scheduled: {formatDate(item.scheduled_at)}</Text>
            </View>
          )}
          {item.generated_at && (
            <View style={styles.metaItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.success} />
              <Text style={styles.metaText}>Generated: {formatDate(item.generated_at)}</Text>
            </View>
          )}
        </View>

        <View style={styles.reportActions}>
          {item.status === 'generated' && item.file_url && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDownloadReport(item)}
              >
                <Ionicons name="download-outline" size={18} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleShareReport(item)}
              >
                <Ionicons name="share-outline" size={18} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => handleMenuPress(item)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowGenerateModal(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionBarButton}
          onPress={() => setShowGenerateModal(true)}
        >
          <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionBarButtonText}>Generate Report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBarButton}
          onPress={() => setShowScheduleModal(true)}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionBarButtonText}>Schedule Report</Text>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No reports found</Text>
              <Button
                title="Generate New Report"
                onPress={() => setShowGenerateModal(true)}
                style={styles.emptyButton}
              />
            </View>
          }
        />
      )}

      {/* Generate Report Modal */}
      <Modal
        transparent
        visible={showGenerateModal}
        animationType="slide"
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Report</Text>
              <TouchableOpacity onPress={() => setShowGenerateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalLabel}>Select Report Type *</Text>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.reportTypeOption,
                    reportType === type.value && styles.reportTypeOptionActive
                  ]}
                  onPress={() => setReportType(type.value)}
                >
                  <View style={styles.reportTypeInfo}>
                    <Text style={[
                      styles.reportTypeOptionTitle,
                      reportType === type.value && styles.reportTypeOptionTitleActive
                    ]}>
                      {type.label}
                    </Text>
                    <Text style={styles.reportTypeOptionDesc}>{type.description}</Text>
                  </View>
                  {reportType === type.value && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowGenerateModal(false);
                  setReportType('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Generate"
                onPress={handleGenerateReport}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Schedule Report Modal */}
      <Modal
        transparent
        visible={showScheduleModal}
        animationType="slide"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Report</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalLabel}>Select Report Type *</Text>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.reportTypeOption,
                    reportType === type.value && styles.reportTypeOptionActive
                  ]}
                  onPress={() => setReportType(type.value)}
                >
                  <View style={styles.reportTypeInfo}>
                    <Text style={[
                      styles.reportTypeOptionTitle,
                      reportType === type.value && styles.reportTypeOptionTitleActive
                    ]}>
                      {type.label}
                    </Text>
                    <Text style={styles.reportTypeOptionDesc}>{type.description}</Text>
                  </View>
                  {reportType === type.value && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}

              <Text style={styles.modalLabel}>Schedule Date *</Text>
              <TouchableOpacity style={styles.dateTimeInput}>
                <Text style={styles.dateTimeText}>
                  {scheduleDate || 'Select date (YYYY-MM-DD)'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>

              <Text style={styles.modalLabel}>Schedule Time *</Text>
              <TouchableOpacity style={styles.dateTimeInput}>
                <Text style={styles.dateTimeText}>
                  {scheduleTime || 'Select time (HH:MM)'}
                </Text>
                <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowScheduleModal(false);
                  setReportType('');
                  setScheduleDate('');
                  setScheduleTime('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Schedule"
                onPress={handleScheduleReport}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Action Menu Modal */}
      <Modal
        transparent
        visible={showActionMenu}
        animationType="fade"
        onRequestClose={() => setShowActionMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowActionMenu(false)}
        >
          <View style={styles.menuContainer} onStartShouldSetResponder={() => true}>
            {selectedReport?.status === 'generated' && selectedReport?.file_url && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowActionMenu(false);
                    handleDownloadReport(selectedReport);
                  }}
                >
                  <Ionicons name="download-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.menuItemText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowActionMenu(false);
                    handleShareReport(selectedReport);
                  }}
                >
                  <Ionicons name="share-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.menuItemText}>Share</Text>
                </TouchableOpacity>
              </>
            )}
            {selectedReport?.status === 'scheduled' && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowActionMenu(false);
                  Alert.alert('Cancel Schedule', 'Are you sure you want to cancel this scheduled report?', [
                    { text: 'No', style: 'cancel' },
                    {
                      text: 'Yes',
                      style: 'destructive',
                      onPress: async () => {
                        // TODO: Call API to cancel scheduled report
                        Alert.alert('Success', 'Scheduled report cancelled');
                        fetchReports();
                      },
                    },
                  ]);
                }}
              >
                <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
                <Text style={[styles.menuItemText, { color: COLORS.error }]}>Cancel Schedule</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  addButton: {
    padding: SPACING.xs,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionBarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  actionBarButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.lg,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reportInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  reportTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reportType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semiBold,
    textTransform: 'capitalize',
  },
  reportMeta: {
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
    paddingBottom: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  modalScroll: {
    maxHeight: 400,
    paddingHorizontal: SPACING.lg,
  },
  modalLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reportTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportTypeOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  reportTypeInfo: {
    flex: 1,
  },
  reportTypeOptionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  reportTypeOptionTitleActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  reportTypeOptionDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  dateTimeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

export default AdminPendingReportsScreen;


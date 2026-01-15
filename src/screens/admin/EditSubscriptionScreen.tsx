import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { subscriptionService, Subscription } from '../../services/subscriptionService';

// Map plan value to display name
const getPlanDisplayName = (plan: string): string => {
  const planMap: { [key: string]: string } = {
    '1_month': '1 Month',
    '3_months': '3 Months',
    '6_months': '6 Months',
    '12_months': '12 Months',
  };
  return planMap[plan] || plan;
};

// Get plan value from display name
const getPlanValue = (displayName: string): string => {
  const planMap: { [key: string]: string } = {
    '1 Month': '1_month',
    '3 Months': '3_months',
    '6 Months': '6_months',
    '12 Months': '12_months',
  };
  return planMap[displayName] || displayName;
};

const EditSubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const subscription: Subscription = route.params?.subscription;
  
  const [plan, setPlan] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string>('paid');
  const [paymentReference, setPaymentReference] = useState('');
  const [totalVisits, setTotalVisits] = useState('');
  const [completedVisits, setCompletedVisits] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Dropdown state
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const plans = [
    { value: '1 Month', label: '1 Month' },
    { value: '3 Months', label: '3 Months' },
    { value: '6 Months', label: '6 Months' },
    { value: '12 Months', label: '12 Months' },
  ];

  const paymentStatuses = [
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  // Initialize form with subscription data
  useEffect(() => {
    if (subscription) {
      setPlan(getPlanDisplayName(subscription.plan));
      setStartDate(subscription.start_date.split('T')[0]); // Extract date part
      setEndDate(subscription.end_date.split('T')[0]); // Extract date part
      setAmount(subscription.amount);
      setPaymentStatus(subscription.payment_status);
      setPaymentReference(subscription.payment_reference || '');
      setTotalVisits(subscription.total_visits.toString());
      setCompletedVisits(subscription.completed_visits.toString());
    }
  }, [subscription]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!startDate.trim()) {
      newErrors.startDate = 'Start Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate.trim())) {
      newErrors.startDate = 'Please enter date in YYYY-MM-DD format';
    }

    if (!endDate.trim()) {
      newErrors.endDate = 'End Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
      newErrors.endDate = 'Please enter date in YYYY-MM-DD format';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    }

    if (!paymentStatus) {
      newErrors.paymentStatus = 'Payment Status is required';
    }

    if (!totalVisits.trim()) {
      newErrors.totalVisits = 'Total Visits is required';
    } else if (isNaN(Number(totalVisits)) || Number(totalVisits) < 0) {
      newErrors.totalVisits = 'Please enter a valid number';
    }

    if (!completedVisits.trim()) {
      newErrors.completedVisits = 'Completed Visits is required';
    } else if (isNaN(Number(completedVisits)) || Number(completedVisits) < 0) {
      newErrors.completedVisits = 'Please enter a valid number';
    } else if (Number(completedVisits) > Number(totalVisits)) {
      newErrors.completedVisits = 'Completed visits cannot exceed total visits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateSubscription = async () => {
    if (!validateForm()) {
      return;
    }

    if (!subscription) {
      Alert.alert('Error', 'Subscription data not found');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        start_date: startDate.trim(),
        end_date: endDate.trim(),
        payment_status: paymentStatus,
        amount: parseFloat(amount.trim()), // Convert to number as API expects
        total_visits: Number(totalVisits),
        completed_visits: Number(completedVisits),
        payment_reference: paymentReference.trim() || null,
      };
      
      console.log('Updating subscription with data:', updateData);
      console.log('Subscription ID:', subscription.id);
      
      await subscriptionService.updateSubscription(subscription.id, updateData);

      Alert.alert(
        'Success',
        'Subscription updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Error updating subscription:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error config:', err.config);
      
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to update subscription. Please try again.';
      
      // Handle validation errors from API
      if (err.response?.data?.errors) {
        const apiErrors: { [key: string]: string } = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          apiErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(apiErrors);
        Alert.alert('Validation Error', 'Please check the form fields and try again.');
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: Array<{ value: string; label: string }>,
    showDropdown: boolean,
    onToggle: () => void,
    onSelect: (value: string) => void,
    error?: string,
    hint?: string
  ) => {
    const selectedLabel = options.find(opt => opt.value === value)?.label || label;
    
    return (
      <View style={styles.dropdownWrapper}>
        <Text style={styles.label}>
          {label} {label.includes('*') ? '' : '*'}
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdown,
            showDropdown && styles.dropdownOpen,
            error && styles.dropdownError,
          ]}
          onPress={onToggle}
        >
          <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
            {value ? selectedLabel : `Select ${label.toLowerCase().replace('*', '').trim()}`}
          </Text>
          <Ionicons
            name={showDropdown ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
        {hint && <Text style={styles.hint}>{hint}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        {showDropdown && (
          <Modal
            transparent
            visible={showDropdown}
            animationType="fade"
            onRequestClose={onToggle}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={onToggle}
            >
              <View style={styles.dropdownList}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.dropdownItem,
                      value === option.value && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      onSelect(option.value);
                      onToggle();
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        value === option.value && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    );
  };

  if (!subscription) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Subscription data not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Edit Subscription</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Client Info (Read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.clientInfoCard}>
            <Text style={styles.clientName}>{subscription.client.name}</Text>
            <Text style={styles.clientEmail}>{subscription.client.email}</Text>
            <Text style={styles.clientPhone}>{subscription.client.phone}</Text>
          </View>
        </View>

        {/* Subscription Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          
          {/* Plan (Read-only) */}
          <View style={styles.readOnlyField}>
            <Text style={styles.label}>Plan</Text>
            <View style={styles.readOnlyValue}>
              <Text style={styles.readOnlyText}>{plan}</Text>
            </View>
          </View>

          <Input
            label="Start Date *"
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={(text) => {
              setStartDate(text);
              if (errors.startDate) setErrors({ ...errors, startDate: '' });
            }}
            leftIcon="calendar-outline"
            error={errors.startDate}
          />

          <Input
            label="End Date *"
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={(text) => {
              setEndDate(text);
              if (errors.endDate) setErrors({ ...errors, endDate: '' });
            }}
            leftIcon="calendar-outline"
            error={errors.endDate}
          />

          <Input
            label="Amount *"
            placeholder="e.g., 500.00"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              if (errors.amount) setErrors({ ...errors, amount: '' });
            }}
            keyboardType="decimal-pad"
            leftIcon="cash-outline"
            error={errors.amount}
          />
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          
          {renderDropdown(
            'Payment Status *',
            paymentStatus,
            paymentStatuses,
            showStatusDropdown,
            () => {
              setShowStatusDropdown(!showStatusDropdown);
            },
            (value) => {
              setPaymentStatus(value);
              if (errors.paymentStatus) setErrors({ ...errors, paymentStatus: '' });
            },
            errors.paymentStatus
          )}

          <Input
            label="Payment Reference"
            placeholder="Enter payment reference (optional)"
            value={paymentReference}
            onChangeText={(text) => {
              setPaymentReference(text);
              if (errors.paymentReference) setErrors({ ...errors, paymentReference: '' });
            }}
            leftIcon="receipt-outline"
            error={errors.paymentReference}
          />
        </View>

        {/* Visit Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Information</Text>
          
          <Input
            label="Total Visits *"
            placeholder="e.g., 4"
            value={totalVisits}
            onChangeText={(text) => {
              setTotalVisits(text);
              if (errors.totalVisits) setErrors({ ...errors, totalVisits: '' });
            }}
            keyboardType="numeric"
            leftIcon="calendar-number-outline"
            error={errors.totalVisits}
          />

          <Input
            label="Completed Visits *"
            placeholder="e.g., 2"
            value={completedVisits}
            onChangeText={(text) => {
              setCompletedVisits(text);
              if (errors.completedVisits) setErrors({ ...errors, completedVisits: '' });
            }}
            keyboardType="numeric"
            leftIcon="checkmark-circle-outline"
            error={errors.completedVisits}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.cancelButton}
            icon={<Ionicons name="close" size={20} color={COLORS.primary} style={styles.buttonIcon} />}
          />
          <Button
            title="Update Subscription"
            onPress={handleUpdateSubscription}
            loading={loading}
            style={styles.updateButton}
            icon={<Ionicons name="checkmark" size={20} color={COLORS.background} style={styles.buttonIcon} />}
          />
        </View>
      </ScrollView>
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
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  clientInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clientName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dropdownWrapper: {
    marginBottom: SPACING.md,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  dropdownOpen: {
    borderColor: COLORS.primary,
  },
  dropdownError: {
    borderColor: COLORS.error,
  },
  dropdownText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  dropdownPlaceholder: {
    color: COLORS.textSecondary,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownList: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 200,
    maxWidth: '80%',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.surface,
  },
  dropdownItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  dropdownItemTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  cancelButton: {
    flex: 1,
  },
  updateButton: {
    flex: 1,
  },
  buttonIcon: {
    marginRight: SPACING.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  readOnlyField: {
    marginBottom: SPACING.md,
  },
  readOnlyValue: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});

export default EditSubscriptionScreen;


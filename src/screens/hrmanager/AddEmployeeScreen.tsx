import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { hrService } from '../../services/hrService';
import { useTranslation } from 'react-i18next';

const AddEmployeeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [region, setRegion] = useState('');
  const [position, setPosition] = useState<string>('');
  const [joiningDate, setJoiningDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const positions = [
    { value: 'Field Worker', label: t('admin.hrEmployees.fieldWorker', 'Field Worker'), designation: 'Technician' },
    { value: 'Team Leader', label: t('admin.hrEmployees.teamLeader', 'Team Leader'), designation: 'Supervisor' },
    { value: 'Area Manager', label: t('admin.hrEmployees.areaManager', 'Area Manager'), designation: 'Area Manager' },
    { value: 'HR Staff', label: t('admin.hrEmployees.hrStaff', 'HR Staff'), designation: 'HR' },
  ];

  // Generate employee ID based on position (if not provided)
  const generateEmployeeId = (designation: string): string => {
    if (employeeId.trim()) {
      return employeeId.trim();
    }
    const prefixMap: { [key: string]: string } = {
      'Technician': 'EMP',
      'Supervisor': 'SUP',
      'Area Manager': 'AM',
      'HR': 'HR',
    };
    const prefix = prefixMap[designation] || 'EMP';
    const timestamp = Date.now();
    return `${prefix}-${timestamp.toString().slice(-4)}`;
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = t('admin.hrEmployees.validation.nameRequired', 'Name is required');
    }

    if (!email.trim()) {
      newErrors.email = t('admin.hrEmployees.validation.emailRequired', 'Email Address is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = t('admin.hrEmployees.validation.emailInvalid', 'Please enter a valid email address');
    }

    if (!phone.trim()) {
      newErrors.phone = t('admin.hrEmployees.validation.phoneRequired', 'Phone Number is required');
    }

    if (!position) {
      newErrors.position = t('admin.hrEmployees.validation.positionRequired', 'Position is required');
    }

    if (!employeeId.trim()) {
      newErrors.employeeId = t('admin.hrEmployees.validation.employeeIdRequired', 'Employee ID is required');
    }

    if (!region.trim()) {
      newErrors.region = t('admin.hrEmployees.validation.regionRequired', 'Region is required');
    }

    if (!joiningDate.trim()) {
      newErrors.joiningDate = t('admin.hrEmployees.validation.joiningDateRequired', 'Joining Date is required');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(joiningDate.trim())) {
      newErrors.joiningDate = t('admin.hrEmployees.validation.joiningDateFormat', 'Please enter date in YYYY-MM-DD format');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const selectedPosition = positions.find(p => p.value === position);
      if (!selectedPosition) {
        Alert.alert(t('common.error', 'Error'), t('admin.hrEmployees.validation.invalidPosition', 'Invalid position selected'));
        setLoading(false);
        return;
      }

      const employeeId = generateEmployeeId(selectedPosition.designation);

      await hrService.createEmployee({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        user_id: null,
        employee_id: employeeId.trim(),
        designation: selectedPosition.designation,
        region: region.trim(),
        joining_date: joiningDate.trim(),
      });

      Alert.alert(
        t('admin.hrManagerDashboard.successTitle', 'Success'),
        t('admin.hrEmployees.addSuccess', 'Employee added successfully!'),
        [
          { 
            text: t('common.ok', 'OK'), 
            onPress: () => {
              // Reset form
              setName('');
              setEmail('');
              setPhone('');
              setEmployeeId('');
              setRegion('');
              setPosition('');
              setJoiningDate('');
              setErrors({});
              navigation.goBack();
            }
          }
        ]
      );
    } catch (err: any) {
      console.error('Error creating employee:', err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        t('admin.hrEmployees.addFailed', 'Failed to add employee. Please try again.');
      
      // Handle validation errors from API
      if (err.response?.data?.errors) {
        const apiErrors: { [key: string]: string } = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          apiErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(apiErrors);
      } else {
        Alert.alert(t('common.error', 'Error'), errorMessage);
      }
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>{t('admin.hrEmployees.addNewEmployee', 'Add New Employee')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Name */}
          <View style={styles.formGroup}>
            <Input
              label={t('admin.hrEmployees.nameLabel', 'Name *')}
              placeholder={t('admin.hrEmployees.namePlaceholder', 'Enter full name')}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              leftIcon="person-outline"
              error={errors.name}
            />
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <Input
              label={t('admin.hrEmployees.emailLabel', 'Email Address *')}
              placeholder={t('admin.hrEmployees.emailPlaceholder', 'email@example.com')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />
          </View>

          {/* Phone */}
          <View style={styles.formGroup}>
            <Input
              label={t('admin.hrEmployees.phoneLabel', 'Phone Number *')}
              placeholder={t('admin.hrEmployees.phonePlaceholder', '+971 50 XXX XXXX')}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              keyboardType="phone-pad"
              leftIcon="call-outline"
              error={errors.phone}
            />
          </View>

          {/* Employee ID */}
          <View style={styles.formGroup}>
            <Input
              label={t('admin.hrEmployees.employeeIdLabel', 'Employee ID *')}
              placeholder={t('admin.hrEmployees.employeeIdPlaceholder', 'e.g., EMP-1001')}
              value={employeeId}
              onChangeText={(text) => {
                setEmployeeId(text);
                if (errors.employeeId) setErrors({ ...errors, employeeId: '' });
              }}
              leftIcon="id-card-outline"
              error={errors.employeeId}
            />
          </View>

          {/* Region */}
          <View style={styles.formGroup}>
            <Input
              label={t('admin.hrEmployees.regionLabel', 'Region *')}
              placeholder={t('admin.hrEmployees.regionPlaceholder', 'e.g., Dubai')}
              value={region}
              onChangeText={(text) => {
                setRegion(text);
                if (errors.region) setErrors({ ...errors, region: '' });
              }}
              leftIcon="location-outline"
              error={errors.region}
            />
          </View>

          {/* Position */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('admin.hrEmployees.positionLabel', 'Position *')}</Text>
            <View style={styles.positionGrid}>
              {positions.map((pos) => (
                <TouchableOpacity
                  key={pos.value}
                  style={[
                    styles.positionCard,
                    position === pos.value && styles.positionCardActive
                  ]}
                  onPress={() => {
                    setPosition(pos.value);
                    if (errors.position) setErrors({ ...errors, position: '' });
                  }}
                >
                  <Text style={[
                    styles.positionText,
                    position === pos.value && styles.positionTextActive
                  ]}>
                    {pos.label}
                  </Text>
                  {position === pos.value && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {errors.position && (
              <Text style={styles.errorText}>{errors.position}</Text>
            )}
          </View>

          {/* Joining Date */}
          <View style={styles.formGroup}>
            <Input
              label={t('admin.hrEmployees.joiningDateLabel', 'Joining Date')}
              placeholder={t('admin.hrEmployees.joiningDatePlaceholder', 'YYYY-MM-DD')}
              value={joiningDate}
              onChangeText={(text) => {
                setJoiningDate(text);
                if (errors.joiningDate) setErrors({ ...errors, joiningDate: '' });
              }}
              leftIcon="calendar-outline"
              error={errors.joiningDate}
            />
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.info} />
            <Text style={styles.infoText}>
              {t(
                'admin.hrEmployees.infoText',
                'The new employee will receive login credentials via email'
              )}
            </Text>
          </View>

          {/* Submit Button */}
          <Button
            title={t('admin.hrManagerDashboard.addEmployee', 'Add Employee')}
            onPress={handleSubmit}
            loading={loading}
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
  content: {
    padding: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  positionGrid: {
    gap: SPACING.sm,
  },
  positionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  positionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  positionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  positionTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
});

export default AddEmployeeScreen;













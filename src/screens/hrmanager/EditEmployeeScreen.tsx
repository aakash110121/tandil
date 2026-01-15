import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { hrService, Employee } from '../../services/hrService';

// Map designation to position display name
const getPositionFromDesignation = (designation: string): string => {
  const designationMap: { [key: string]: string } = {
    'Technician': 'Field Worker',
    'Supervisor': 'Team Leader',
    'Area Manager': 'Area Manager',
    'HR': 'HR Staff',
  };
  return designationMap[designation] || designation;
};

const EditEmployeeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const employee: Employee = route.params?.employee;
  
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
    { value: 'Field Worker', label: 'Field Worker', designation: 'Technician' },
    { value: 'Team Leader', label: 'Team Leader', designation: 'Supervisor' },
    { value: 'Area Manager', label: 'Area Manager', designation: 'Area Manager' },
    { value: 'HR Staff', label: 'HR Staff', designation: 'HR' },
  ];

  // Initialize form with employee data
  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setEmail(employee.email || '');
      setPhone(employee.phone || '');
      setEmployeeId(employee.employee_id || '');
      setRegion(employee.region || '');
      setPosition(getPositionFromDesignation(employee.designation) || '');
      setJoiningDate(employee.joining_date || '');
    }
  }, [employee]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    }

    if (!employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!region.trim()) {
      newErrors.region = 'Region is required';
    }

    if (!position) {
      newErrors.position = 'Position is required';
    }

    if (!joiningDate.trim()) {
      newErrors.joiningDate = 'Joining Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(joiningDate.trim())) {
      newErrors.joiningDate = 'Please enter date in YYYY-MM-DD format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateEmployee = async () => {
    if (!validateForm()) {
      return;
    }

    if (!employee) {
      Alert.alert('Error', 'Employee data not found');
      return;
    }

    setLoading(true);
    try {
      const selectedPosition = positions.find(p => p.value === position);
      if (!selectedPosition) {
        Alert.alert('Error', 'Invalid position selected');
        setLoading(false);
        return;
      }

      await hrService.updateEmployee(employee.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employee_id: employeeId.trim(),
        designation: selectedPosition.designation,
        region: region.trim(),
        joining_date: joiningDate.trim(),
      });

      Alert.alert(
        'Success',
        'Employee updated successfully!',
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
      console.error('Error updating employee:', err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to update employee. Please try again.';
      
      // Handle validation errors from API
      if (err.response?.data?.errors) {
        const apiErrors: { [key: string]: string } = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          apiErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(apiErrors);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!employee) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Employee data not found</Text>
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
        <Text style={styles.headerTitle}>Edit Employee</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <View style={styles.formGroup}>
          <Input
            label="Name *"
            placeholder="Enter full name"
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
            label="Email Address *"
            placeholder="email@example.com"
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
            label="Phone Number *"
            placeholder="+971 50 XXX XXXX"
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
            label="Employee ID *"
            placeholder="e.g., EMP-1001"
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
            label="Region *"
            placeholder="e.g., Dubai"
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
          <Text style={styles.label}>Position *</Text>
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
            label="Joining Date *"
            placeholder="YYYY-MM-DD"
            value={joiningDate}
            onChangeText={(text) => {
              setJoiningDate(text);
              if (errors.joiningDate) setErrors({ ...errors, joiningDate: '' });
            }}
            leftIcon="calendar-outline"
            error={errors.joiningDate}
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
            title="Update Employee"
            onPress={handleUpdateEmployee}
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
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
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
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
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
});

export default EditEmployeeScreen;


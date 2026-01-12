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
import { adminService, AdminUser } from '../../services/adminService';

const EditUserScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user: AdminUser = route.params?.user;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<string>('');
  const [status, setStatus] = useState<string>('active');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Dropdown states
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || '');
      setStatus(user.status || 'active');
    }
  }, [user]);

  const roles = [
    { value: 'client', label: 'Client' },
    { value: 'technician', label: 'Technician' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'area_manager', label: 'Area manager' },
    { value: 'hr', label: 'Hr' },
    { value: 'admin', label: 'Admin' },
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const getRoleLabel = (value: string) => {
    return roles.find(r => r.value === value)?.label || 'Select a role';
  };

  const getStatusLabel = (value: string) => {
    return statuses.find(s => s.value === value)?.label || 'Active';
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password is optional for update, but if provided, must be valid
    if (password.trim()) {
      if (password.length < 8) {
        newErrors.password = 'Must be at least 8 characters long';
      }
      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm the password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (confirmPassword.trim()) {
      // If confirm password is provided but password is not
      newErrors.password = 'Please enter a password';
    }

    if (!role) {
      newErrors.role = 'User Role is required';
    }

    if (!status) {
      newErrors.status = 'Account Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User data not found');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        status,
      };

      // Only include password if provided
      if (password.trim()) {
        updateData.password = password;
        updateData.password_confirmation = confirmPassword;
      }

      await adminService.updateUser(user.id, updateData);

      Alert.alert(
        'Success',
        'User updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back and refresh users list
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Error updating user:', err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'Failed to update user. Please try again.';
      
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

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>User data not found</Text>
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
        <Text style={styles.headerTitle}>Edit User</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Input
            label="Full Name *"
            placeholder="Enter full name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            leftIcon="person-outline"
            error={errors.name}
          />

          <Input
            label="Email Address *"
            placeholder="Enter email address"
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

          <Input
            label="Phone Number"
            placeholder="+971 XX XXX XXXX"
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

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <Input
            label="Password"
            placeholder="Leave blank to keep current password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password}
          />
          {!errors.password && password && (
            <Text style={styles.hint}>Must be at least 8 characters long</Text>
          )}
          {!password && (
            <Text style={styles.hint}>Leave blank to keep current password</Text>
          )}

          <Input
            label="Confirm Password"
            placeholder="Re-enter password if changing"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
            }}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.confirmPassword}
          />
        </View>

        {/* Role & Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role & Status</Text>
          
          {renderDropdown(
            'User Role *',
            role,
            roles,
            showRoleDropdown,
            () => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowStatusDropdown(false);
            },
            (value) => {
              setRole(value);
              if (errors.role) setErrors({ ...errors, role: '' });
            },
            errors.role
          )}

          {renderDropdown(
            'Account Status *',
            status,
            statuses,
            showStatusDropdown,
            () => {
              setShowStatusDropdown(!showStatusDropdown);
              setShowRoleDropdown(false);
            },
            (value) => {
              setStatus(value);
              if (errors.status) setErrors({ ...errors, status: '' });
            },
            errors.status,
            'Set the initial account status'
          )}
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
            title="Update User"
            onPress={handleUpdateUser}
            loading={loading}
            style={styles.createButton}
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
  createButton: {
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

export default EditUserScreen;


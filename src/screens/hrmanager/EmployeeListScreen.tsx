import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { hrService, Employee } from '../../services/hrService';

// Map designation to display role
const getRoleDisplayName = (designation: string): string => {
  const roleMap: { [key: string]: string } = {
    'Technician': 'Field Worker',
    'Supervisor': 'Team Leader',
    'Area Manager': 'Area Manager',
    'HR': 'HR Staff',
  };
  return roleMap[designation] || designation;
};

// Format date for display
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
};

const EmployeeListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Fetch employees from API
  const fetchEmployees = useCallback(async (showLoading = true) => {
    try {
      setError(null);
      if (showLoading) {
        setLoading(true);
      }
      const response = await hrService.getEmployees();
      if (response && response.data) {
        setEmployees(Array.isArray(response.data) ? response.data : []);
      } else {
        setEmployees([]);
        setError('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load employees';
      setError(errorMessage);
      setEmployees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        fetchEmployees(false);
      }
    }, [loading, fetchEmployees])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees(false);
  };

  const handleMenuPress = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowMenu(true);
  };

  const handleEdit = () => {
    if (selectedEmployee) {
      setShowMenu(false);
      navigation.navigate('EditEmployee' as never, { employee: selectedEmployee } as never);
    }
  };

  const handleDelete = () => {
    if (!selectedEmployee) return;
    
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${selectedEmployee.name}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setShowMenu(false),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setShowMenu(false);
            try {
              await hrService.deleteEmployee(selectedEmployee.id);
              Alert.alert('Success', 'Employee deleted successfully');
              fetchEmployees(false);
            } catch (err: any) {
              console.error('Error deleting employee:', err);
              const errorMessage = 
                err.response?.data?.message || 
                err.message || 
                'Failed to delete employee. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  // Filter employees based on search query
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRoleDisplayName(employee.designation).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderEmployee = ({ item }: { item: Employee }) => {
    const avatarInitial = item.name.charAt(0).toUpperCase();
    const roleDisplayName = getRoleDisplayName(item.designation);
    const joiningDate = formatDate(item.joining_date);
    const status = item.status || 'active'; // Assuming status field exists, default to active

    return (
      <TouchableOpacity style={styles.employeeCard}>
        <View style={styles.employeeAvatar}>
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </View>
        
        <View style={styles.employeeInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.employeeName}>{item.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: status === 'active' ? COLORS.success + '20' : COLORS.warning + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: status === 'active' ? COLORS.success : COLORS.warning }
              ]}>
                {status === 'active' ? 'Active' : 'On Leave'}
              </Text>
            </View>
          </View>
          <View style={styles.employeeMeta}>
            <Text style={styles.employeeId}>{item.employee_id}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.employeeRole}>{roleDisplayName}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.joiningDate}>Joined: {joiningDate}</Text>
            <Text style={styles.leaveBalance}>Leave: {item.leave_balance || 0} days</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleMenuPress(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Employee Directory</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search employees..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Employees List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchEmployees()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
          renderItem={renderEmployee}
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
              <Ionicons name="people-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No employees found' : 'No employees yet'}
              </Text>
            </View>
          }
        />
      )}

      {/* Action Menu Modal */}
      <Modal
        transparent
        visible={showMenu}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer} onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Delete</Text>
            </TouchableOpacity>
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
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.lg,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  employeeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  employeeInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  employeeName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    flex: 1,
  },
  employeeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  employeeId: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  separator: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.xs,
  },
  employeeRole: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joiningDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semiBold,
    textTransform: 'capitalize',
  },
  leaveBalance: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  moreButton: {
    padding: SPACING.xs,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
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
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  menuItemTextDanger: {
    color: COLORS.error,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
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
  },
});

export default EmployeeListScreen;


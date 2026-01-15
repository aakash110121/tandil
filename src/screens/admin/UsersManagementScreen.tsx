import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { adminService, AdminUser } from '../../services/adminService';

// Map API role to display name
const getRoleDisplayName = (role: string): string => {
  const roleMap: { [key: string]: string } = {
    'technician': 'Field Worker',
    'supervisor': 'Supervisor',
    'area_manager': 'Area Manager',
    'hr': 'HR Manager',
    'client': 'Client',
    'admin': 'Admin',
  };
  return roleMap[role] || role;
};

// Generate employee ID based on role and user ID
const generateEmployeeId = (role: string, userId: number): string => {
  const prefixMap: { [key: string]: string } = {
    'technician': 'EMP',
    'supervisor': 'SUP',
    'area_manager': 'AM',
    'hr': 'HR',
    'client': 'CLT',
    'admin': 'ADMIN',
  };
  const prefix = prefixMap[role] || 'USR';
  return `${prefix}-${userId.toString().padStart(4, '0')}`;
};

const UsersManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const filters = [
    { id: 'all', label: 'All Users' },
    { id: 'worker', label: 'Workers' },
    { id: 'supervisor', label: 'Supervisors' },
    { id: 'manager', label: 'Managers' },
    { id: 'client', label: 'Clients' },
  ];

  // Fetch users from API
  const fetchUsers = useCallback(async (showLoading = true) => {
    try {
      setError(null);
      if (showLoading) {
        setLoading(true);
      }
      const response = await adminService.getUsers();
      if (response && response.data && response.data.data) {
        setUsers(response.data.data || []);
      } else {
        setUsers([]);
        setError('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load users';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Refresh users when screen comes into focus (e.g., after adding a user)
  useFocusEffect(
    useCallback(() => {
      // Only refresh if we've already done the initial load
      if (!isInitialLoad && !loading) {
        fetchUsers(false);
      }
    }, [isInitialLoad, loading, fetchUsers])
  );

  // Filter users based on selected filter and search query
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      generateEmployeeId(user.role, user.id).toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'worker') return matchesSearch && user.role === 'technician';
    if (selectedFilter === 'supervisor') return matchesSearch && user.role === 'supervisor';
    if (selectedFilter === 'manager') return matchesSearch && (user.role === 'area_manager' || user.role === 'hr');
    if (selectedFilter === 'client') return matchesSearch && user.role === 'client';
    return matchesSearch;
  });

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleMenuPress = (user: AdminUser) => {
    setSelectedUser(user);
    setShowMenu(true);
  };

  const handleEdit = () => {
    if (selectedUser) {
      setShowMenu(false);
      navigation.navigate('EditUser' as never, { user: selectedUser } as never);
    }
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`,
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
              await adminService.deleteUser(selectedUser.id);
              Alert.alert('Success', 'User deleted successfully');
              fetchUsers(false);
            } catch (err: any) {
              console.error('Error deleting user:', err);
              const errorMessage = 
                err.response?.data?.message || 
                err.message || 
                'Failed to delete user. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: AdminUser }) => {
    const employeeId = generateEmployeeId(item.role, item.id);
    const roleDisplayName = getRoleDisplayName(item.role);
    const avatarInitial = item.name.charAt(0).toUpperCase();

    return (
      <TouchableOpacity style={styles.userCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.employeeId}>{employeeId}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.userRole}>{roleDisplayName}</Text>
          </View>
        </View>

        <View style={styles.userActions}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'active' ? COLORS.success + '20' : COLORS.textSecondary + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: item.status === 'active' ? COLORS.success : COLORS.textSecondary }
            ]}>
              {item.status}
            </Text>
          </View>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddUser' as never)}
        >
          <Ionicons name="person-add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Users List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
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
              <Text style={styles.emptyText}>No users found</Text>
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
  addButton: {
    padding: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    maxHeight: 50,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  filterTextActive: {
    color: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  userAvatar: {
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userRole: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  userActions: {
    alignItems: 'center',
    gap: SPACING.sm,
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
  moreButton: {
    padding: SPACING.xs,
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
});

export default UsersManagementScreen;


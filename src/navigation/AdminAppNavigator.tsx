import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

// Screens
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UsersManagementScreen from '../screens/admin/UsersManagementScreen';
import AddUserScreen from '../screens/admin/AddUserScreen';
import EditUserScreen from '../screens/admin/EditUserScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminSubscriptionsScreen from '../screens/admin/AdminSubscriptionsScreen';
import EditSubscriptionScreen from '../screens/admin/EditSubscriptionScreen';
import AdminTipsScreen from '../screens/admin/AdminTipsScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminAddProductScreen from '../screens/admin/AdminAddProductScreen';
import AdminEditProductScreen from '../screens/admin/AdminEditProductScreen';
import AdminPendingReportsScreen from '../screens/admin/AdminPendingReportsScreen';
import AdminRecentActivitiesScreen from '../screens/admin/AdminRecentActivitiesScreen';
import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import AdminAddCategoryScreen from '../screens/admin/AdminAddCategoryScreen';
import AdminEditCategoryScreen from '../screens/admin/AdminEditCategoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: t('admin.tabs.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UsersTab"
        component={UsersManagementScreen}
        options={{
          tabBarLabel: t('admin.tabs.users'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          tabBarLabel: t('admin.tabs.reports'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={AdminSettingsScreen}
        options={{
          tabBarLabel: t('admin.tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AdminAppNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={AdminLoginScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="AddUser" component={AddUserScreen} />
        <Stack.Screen name="EditUser" component={EditUserScreen} />
        <Stack.Screen name="AdminSubscriptions" component={AdminSubscriptionsScreen} />
        <Stack.Screen name="EditSubscription" component={EditSubscriptionScreen} />
        <Stack.Screen name="AdminTips" component={AdminTipsScreen} />
        <Stack.Screen name="AdminProducts" component={AdminProductsScreen} />
        <Stack.Screen name="AdminAddProduct" component={AdminAddProductScreen} />
        <Stack.Screen name="AdminEditProduct" component={AdminEditProductScreen} />
        <Stack.Screen name="PendingReports" component={AdminPendingReportsScreen} />
        <Stack.Screen name="RecentActivities" component={AdminRecentActivitiesScreen} />
        <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
        <Stack.Screen name="AdminAddCategory" component={AdminAddCategoryScreen} />
        <Stack.Screen name="AdminEditCategory" component={AdminEditCategoryScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default AdminAppNavigator;


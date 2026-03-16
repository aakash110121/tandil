import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

// Screens
import HRManagerLoginScreen from '../screens/hrmanager/HRManagerLoginScreen';
import HRManagerDashboardScreen from '../screens/hrmanager/HRManagerDashboardScreen';
import AddEmployeeScreen from '../screens/hrmanager/AddEmployeeScreen';
import EmployeeListScreen from '../screens/hrmanager/EmployeeListScreen';
import EditEmployeeScreen from '../screens/hrmanager/EditEmployeeScreen';
import ManageLeavesScreen from '../screens/hrmanager/ManageLeavesScreen';
import TechnicianProfileScreen from '../screens/technician/TechnicianProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_LABELS = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  leaves: 'Leaves',
  profile: 'Profile',
};

const TabNavigator = () => {
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
        component={HRManagerDashboardScreen}
        options={{
          tabBarLabel: TAB_LABELS.dashboard,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EmployeesTab"
        component={EmployeeListScreen}
        options={{
          tabBarLabel: TAB_LABELS.employees,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LeavesTab"
        component={ManageLeavesScreen}
        options={{
          tabBarLabel: TAB_LABELS.leaves,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={TechnicianProfileScreen}
        options={{
          tabBarLabel: TAB_LABELS.profile,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const HRManagerAppNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={HRManagerLoginScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
        <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
        <Stack.Screen name="EditEmployee" component={EditEmployeeScreen} />
        <Stack.Screen name="ManageLeaves" component={ManageLeavesScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default HRManagerAppNavigator;


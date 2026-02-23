import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { TechnicianStackParamList } from '../types';

// Screens
import TechnicianLoginScreen from '../screens/technician/TechnicianLoginScreen';
import TechnicianDashboardScreen from '../screens/technician/TechnicianDashboardScreen';
import JobDetailScreen from '../screens/technician/JobDetailScreen';
import TechnicianOrderHistoryScreen from '../screens/technician/TechnicianOrderHistoryScreen';
import PayoutSummaryScreen from '../screens/technician/PayoutSummaryScreen';
import TechnicianProfileScreen from '../screens/technician/TechnicianProfileScreen';
import TechnicianProfileEditScreen from '../screens/technician/TechnicianProfileEditScreen';
import AvailabilityScreen from '../screens/technician/AvailabilityScreen';
import SupervisorReportScreen from '../screens/technician/SupervisorReportScreen';
import MembershipsScreen from '../screens/common/MembershipsScreen';
import MembershipCheckoutScreen from '../screens/common/MembershipCheckoutScreen';

const Stack = createStackNavigator<TechnicianStackParamList>();
const Tab = createBottomTabNavigator();

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
        component={TechnicianDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TasksTab"
        component={TechnicianOrderHistoryScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={AvailabilityScreen}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={TechnicianProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const TechnicianAppNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={TechnicianLoginScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
        <Stack.Screen name="SupervisorReport" component={SupervisorReportScreen} />
        <Stack.Screen name="PayoutSummary" component={PayoutSummaryScreen} />
        <Stack.Screen name="TechnicianProfileEdit" component={TechnicianProfileEditScreen} />
        <Stack.Screen name="Memberships" component={MembershipsScreen} />
        <Stack.Screen name="MembershipCheckout" component={MembershipCheckoutScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default TechnicianAppNavigator; 
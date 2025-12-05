import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VendorStackParamList } from '../types';
import { COLORS } from '../constants';
import { useTranslation } from 'react-i18next';

// Tab Screens
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import VendorProductsScreen from '../screens/vendor/VendorProductsScreen';
import VendorOrdersScreen from '../screens/vendor/VendorOrdersScreen';
import VendorPartnershipScreen from '../screens/vendor/VendorPartnershipScreen';
import VendorProfileScreen from '../screens/vendor/VendorProfileScreen';

// Stack Screens
import VendorProductDetailScreen from '../screens/vendor/VendorProductDetailScreen';
import VendorAddProductScreen from '../screens/vendor/VendorAddProductScreen';
import VendorEditProductScreen from '../screens/vendor/VendorEditProductScreen';
import VendorOrderDetailScreen from '../screens/vendor/VendorOrderDetailScreen';
import VendorAnalyticsScreen from '../screens/vendor/VendorAnalyticsScreen';
import VendorSettingsScreen from '../screens/vendor/VendorSettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<VendorStackParamList>();

// Tab Navigator
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
            case 'Orders':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Partnership':
              iconName = focused ? 'business' : 'business-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          height: 60 + insets.bottom,
        },
        headerShown: false,
        tabBarLabelStyle: { textTransform: 'none' },
      })}
    >
      <Tab.Screen name="Dashboard" component={VendorDashboardScreen} options={{ tabBarLabel: 'Suppliers' }} />
      <Tab.Screen name="Products" component={VendorProductsScreen} options={{ tabBarLabel: 'Produce' }} />
      <Tab.Screen name="Orders" component={VendorOrdersScreen} options={{ tabBarLabel: 'Orders' }} />
      <Tab.Screen name="Partnership" component={VendorPartnershipScreen} options={{ tabBarLabel: 'Companies' }} />
      <Tab.Screen name="Profile" component={VendorProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const VendorAppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      
      {/* Product Screens */}
      <Stack.Screen name="ProductDetail" component={VendorProductDetailScreen} />
      <Stack.Screen name="AddProduct" component={VendorAddProductScreen} />
      <Stack.Screen name="EditProduct" component={VendorEditProductScreen} />
      
      {/* Order Screens */}
      <Stack.Screen name="OrderDetail" component={VendorOrderDetailScreen} />
      <Stack.Screen name="Analytics" component={VendorAnalyticsScreen} />
      
      {/* Profile Screens */}
      <Stack.Screen name="Settings" component={VendorSettingsScreen} />
    </Stack.Navigator>
  );
};

export default VendorAppNavigator;



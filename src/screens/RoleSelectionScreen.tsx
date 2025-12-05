import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  console.log('RoleSelectionScreen: Rendering...');

  useEffect(() => {
    console.log('RoleSelectionScreen: Component mounted successfully');
  }, []);

  const handleRoleSelection = (role: 'user' | 'technician' | 'supervisor' | 'areaManager' | 'hrManager' | 'admin') => {
    if (isLoading) return; // Prevent multiple taps
    
    console.log('RoleSelectionScreen: Selected role:', role);
    console.log('RoleSelectionScreen: Current navigation state:', navigation.getState());
    setIsLoading(true);
    
    // Add a small delay to prevent accidental taps
    setTimeout(() => {
      switch (role) {
        case 'user':
          console.log('RoleSelectionScreen: Navigating to Auth (Client)...');
          navigation.replace('Auth');
          break;
        case 'technician':
          console.log('RoleSelectionScreen: Navigating to TechnicianApp (Field Worker)...');
          navigation.replace('TechnicianApp');
          break;
        case 'supervisor':
          console.log('RoleSelectionScreen: Navigating to Supervisor Panel...');
          navigation.replace('SupervisorApp');
          break;
        case 'areaManager':
          console.log('RoleSelectionScreen: Navigating to Area Manager Panel...');
          navigation.replace('AreaManagerApp');
          break;
        case 'hrManager':
          console.log('RoleSelectionScreen: Navigating to HR Manager Panel...');
          navigation.replace('HRManagerApp');
          break;
        case 'admin':
          console.log('RoleSelectionScreen: Navigating to Admin Panel...');
          navigation.replace('AdminApp');
          break;
      }
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
          </View>
      
          <Text style={styles.subtitle}>{t('roleSelection.chooseRole')}</Text>
          <Text style={styles.statusText}>
            {isLoading ? t('roleSelection.loading') : t('roleSelection.active')}
          </Text>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.roleContainer}>
        {/* Client/Customer Panel */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection('user')}
        >
          <View style={styles.roleIcon}>
            <Ionicons name="person-outline" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>Client (Customer)</Text>
            <Text style={styles.roleDescription}>
              Subscribe to plans, receive reports, and purchase agricultural products
            </Text>
          </View>
        </TouchableOpacity>

        {/* Worker/Field Technician Panel */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection('technician')}
        >
          <View style={styles.roleIcon}>
            <Ionicons name="leaf-outline" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>Worker (Field Technician)</Text>
            <Text style={styles.roleDescription}>
              Perform watering, planting, cleaning tasks and submit field reports
            </Text>
          </View>
        </TouchableOpacity>

        {/* Supervisor/Team Leader Panel */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection('supervisor')}
        >
          <View style={styles.roleIcon}>
            <Ionicons name="people-outline" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>Supervisor (Team Leader)</Text>
            <Text style={styles.roleDescription}>
              Manage workers, review reports, and submit final reports to clients
            </Text>
          </View>
        </TouchableOpacity>

        {/* Area Manager Panel */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection('areaManager')}
        >
          <View style={styles.roleIcon}>
            <Ionicons name="map-outline" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>Area Manager</Text>
            <Text style={styles.roleDescription}>
              Oversee supervisors and technicians within a defined region
            </Text>
          </View>
        </TouchableOpacity>

        {/* HR Manager Panel */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection('hrManager')}
        >
          <View style={styles.roleIcon}>
            <Ionicons name="briefcase-outline" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>HR Manager</Text>
            <Text style={styles.roleDescription}>
              Manage employee profiles, job IDs, schedules, and visit assignments
            </Text>
          </View>
        </TouchableOpacity>

        {/* Admin Panel */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleRoleSelection('admin')}
        >
          <View style={styles.roleIcon}>
            <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.roleContent}>
            <Text style={styles.roleTitle}>Admin (Executive Management)</Text>
            <Text style={styles.roleDescription}>
              Full control panel - manage users, subscriptions, tips, products, reports, and analytics
            </Text>
          </View>
        </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Select the panel that matches your role in Tandil
          </Text>
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  logoImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  roleContainer: {
    gap: SPACING.md,
  },
  roleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  roleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  roleDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RoleSelectionScreen; 
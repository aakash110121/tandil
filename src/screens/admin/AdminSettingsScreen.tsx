import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { useAppStore } from '../../store';

const AdminSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAppStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [autoAssignEnabled, setAutoAssignEnabled] = React.useState(false);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);

  const settingsSections = [
    {
      title: 'System Settings',
      items: [
        {
          icon: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Enable system notifications',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: 'refresh',
          title: 'Auto-Assign Tasks',
          subtitle: 'Automatically assign tasks to workers',
          type: 'toggle',
          value: autoAssignEnabled,
          onToggle: setAutoAssignEnabled,
        },
        {
          icon: 'warning',
          title: 'Maintenance Mode',
          subtitle: 'Enable maintenance mode',
          type: 'toggle',
          value: maintenanceMode,
          onToggle: setMaintenanceMode,
        },
      ],
    },
    {
      title: 'App Configuration',
      items: [
        {
          icon: 'color-palette',
          title: 'Theme Settings',
          subtitle: 'Customize app appearance',
          type: 'navigation',
          onPress: () => Alert.alert('Theme Settings', 'Theme customization coming soon'),
        },
        {
          icon: 'language',
          title: 'Language & Region',
          subtitle: 'Change app language',
          type: 'navigation',
          onPress: () => Alert.alert('Language', 'Language settings coming soon'),
        },
        {
          icon: 'card',
          title: 'Payment Settings',
          subtitle: 'Configure payment methods',
          type: 'navigation',
          onPress: () => Alert.alert('Payment Settings', 'Payment configuration coming soon'),
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          icon: 'shield-checkmark',
          title: 'Privacy Policy',
          subtitle: 'View privacy policy',
          type: 'navigation',
          onPress: () => Alert.alert('Privacy Policy', 'Privacy policy details'),
        },
        {
          icon: 'document-text',
          title: 'Terms of Service',
          subtitle: 'View terms and conditions',
          type: 'navigation',
          onPress: () => Alert.alert('Terms', 'Terms of service details'),
        },
        {
          icon: 'trash',
          title: 'Clear Cache',
          subtitle: 'Clear app cache data',
          type: 'navigation',
          onPress: () => Alert.alert('Clear Cache', 'Are you sure you want to clear cache?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared!') },
          ]),
        },
      ],
    },
    {
      title: 'Advanced',
      items: [
        {
          icon: 'code',
          title: 'Developer Options',
          subtitle: 'Advanced developer settings',
          type: 'navigation',
          onPress: () => Alert.alert('Developer Options', 'Developer settings'),
        },
        {
          icon: 'bug',
          title: 'Debug Logs',
          subtitle: 'View system logs',
          type: 'navigation',
          onPress: () => Alert.alert('Debug Logs', 'System logs viewer'),
        },
        {
          icon: 'download',
          title: 'Export Data',
          subtitle: 'Export system data',
          type: 'navigation',
          onPress: () => Alert.alert('Export Data', 'Data export options'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    if (item.type === 'toggle') {
      return (
        <View key={item.title} style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
            thumbColor={item.value ? COLORS.primary : COLORS.background}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity 
        key={item.title} 
        style={styles.settingItem}
        onPress={item.onPress}
      >
        <View style={styles.settingIcon}>
          <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Admin Info Card */}
        <View style={styles.adminCard}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminAvatarText}>A</Text>
          </View>
          <View style={styles.adminInfo}>
            <Text style={styles.adminName}>Admin User</Text>
            <Text style={styles.adminEmail}>admin@tandil.com</Text>
            <Text style={styles.adminId}>ADMIN-001</Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Logout', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await logout();
                      // Navigate to root navigator (RoleSelection)
                      let rootNavigator = navigation;
                      while (rootNavigator.getParent()) {
                        rootNavigator = rootNavigator.getParent() as any;
                      }
                      rootNavigator.reset({
                        index: 0,
                        routes: [{ name: 'RoleSelection' }],
                      });
                    } catch (error) {
                      console.error('Logout error:', error);
                      // Still navigate even if logout fails
                      let rootNavigator = navigation;
                      while (rootNavigator.getParent()) {
                        rootNavigator = rootNavigator.getParent() as any;
                      }
                      rootNavigator.reset({
                        index: 0,
                        routes: [{ name: 'RoleSelection' }],
                      });
                    }
                  }
                },
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Tandil Admin v1.0.0</Text>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  adminAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  adminAvatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  adminEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  adminId: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '10',
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default AdminSettingsScreen;









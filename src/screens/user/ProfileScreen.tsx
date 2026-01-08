import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { useAppStore } from '../../store';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user, logout } = useAppStore();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to RoleSelection screen after logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'RoleSelection' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout fails
      navigation.reset({
        index: 0,
        routes: [{ name: 'RoleSelection' }],
      });
    }
  };

  const menuItems = [
    { icon: 'trophy-outline', title: 'Memberships', onPress: () => {
      try {
        navigation.navigate('Memberships' as never);
      } catch (error) {
        console.error('ProfileScreen: Navigation error to Memberships:', error);
      }
    } },
    { icon: 'person-outline', title: t('profile.personalInformation'), onPress: () => {
      try { navigation.navigate('PersonalInfo'); } catch {}
    } },
    { icon: 'location-outline', title: t('profile.addresses'), onPress: () => {
      try { navigation.navigate('Addresses'); } catch {}
    } },
    { icon: 'card-outline', title: t('profile.paymentMethods'), onPress: () => {
      try { navigation.navigate('PaymentMethods'); } catch {}
    } },
    { icon: 'notifications-outline', title: t('profile.notifications'), onPress: () => {
      console.log('ProfileScreen: Navigating to Notifications');
      try {
        navigation.navigate('Notifications');
      } catch (error) {
        console.error('ProfileScreen: Navigation error to Notifications:', error);
      }
    } },
    { icon: 'star-outline', title: t('profile.loyaltyPoints'), onPress: () => {
      console.log('ProfileScreen: Navigating to LoyaltyPoints');
      try {
        navigation.navigate('LoyaltyPoints');
      } catch (error) {
        console.error('ProfileScreen: Navigation error to LoyaltyPoints:', error);
      }
    } },
    { icon: 'help-circle-outline', title: t('profile.helpSupport'), onPress: () => {
      console.log('ProfileScreen: Navigating to HelpCenter');
      try {
        navigation.navigate('HelpCenter');
      } catch (error) {
        console.error('ProfileScreen: Navigation error to HelpCenter:', error);
      }
    } },
    { icon: 'settings-outline', title: t('profile.settings'), onPress: () => {
      console.log('ProfileScreen: Navigating to Settings');
      try {
        navigation.navigate('Settings');
      } catch (error) {
        console.error('ProfileScreen: Navigation error to Settings:', error);
      }
    } },
    { icon: 'log-out-outline', title: t('profile.logout'), onPress: handleLogout, color: COLORS.error },
  ];

  return (
    <View style={styles.container}>
      <Header 
        title={t('tabs.profile')} 
        showBack={false}
        showCart={true}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="camera" size={16} color={COLORS.background} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons 
                  name={item.icon as any} 
                  size={24} 
                  color={item.color || COLORS.textSecondary} 
                />
                <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  menuContainer: {
    paddingHorizontal: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
});

export default ProfileScreen;

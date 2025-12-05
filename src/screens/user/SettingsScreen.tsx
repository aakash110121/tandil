import React, { useState } from 'react';
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
import Header from '../../components/common/Header';
import { useAppStore } from '../../store';
import { useTranslation } from 'react-i18next';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user, language, setLanguage } = useAppStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(true);

  const handleLogout = () => {
    console.log('SettingsScreen: Logout pressed');
    Alert.alert(
      t('settings.alerts.logoutTitle'),
      t('settings.alerts.logoutBody'),
      [
        {
          text: t('settings.alerts.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.alerts.logout'),
          style: 'destructive',
          onPress: () => {
            console.log('SettingsScreen: Logout confirmed, navigating to Auth');
            // Handle logout logic
            navigation.navigate('Auth');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.alerts.deleteTitle'),
      t('settings.alerts.deleteBody'),
      [
        {
          text: t('settings.alerts.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.alerts.delete'),
          style: 'destructive',
          onPress: () => {
            // Handle account deletion
            Alert.alert(t('settings.alerts.deletedTitle'), t('settings.alerts.deletedBody'));
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header 
        title={t('settings.title')} 
        showBack={true}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.account')}</Text>
          <View style={styles.settingsCard}>
            {renderSettingItem(
              'person-outline',
              t('settings.items.personalInformation.title'),
              t('settings.items.personalInformation.subtitle'),
              () => {}
            )}
            {renderSettingItem(
              'location-outline',
              t('settings.items.addresses.title'),
              t('settings.items.addresses.subtitle'),
              () => {}
            )}
            {renderSettingItem(
              'card-outline',
              t('settings.items.paymentMethods.title'),
              t('settings.items.paymentMethods.subtitle'),
              () => {}
            )}
            {renderSettingItem(
              'shield-outline',
              t('settings.items.privacySecurity.title'),
              t('settings.items.privacySecurity.subtitle'),
              () => {}
            )}
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.app')}</Text>
          <View style={styles.settingsCard}>
            {renderSettingItem(
              'notifications-outline',
              t('settings.items.notifications.title'),
              t('settings.items.notifications.subtitle'),
              undefined,
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            )}
            {renderSettingItem(
              'location-outline',
              t('settings.items.location.title'),
              t('settings.items.location.subtitle'),
              undefined,
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            )}
            {/* Dark Mode removed as requested */}
            {renderSettingItem(
              'language-outline',
              t('settings.items.language.title'),
              t('settings.items.language.subtitle'),
              () => setLanguage(language === 'en' ? 'ar' : 'en'),
              <View style={styles.languageIndicator}>
                <Text style={styles.languageText}>{language.toUpperCase()}</Text>
              </View>
            )}
            {renderSettingItem(
              'key-outline',
              t('settings.items.autoLogin.title'),
              t('settings.items.autoLogin.subtitle'),
              undefined,
              <Switch
                value={autoLoginEnabled}
                onValueChange={setAutoLoginEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            )}
          </View>
        </View>

        {/* Support & About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.support')}</Text>
          <View style={styles.settingsCard}>
            {renderSettingItem(
              'help-circle-outline',
              t('settings.items.helpSupport.title'),
              t('settings.items.helpSupport.subtitle'),
              () => navigation.navigate('HelpCenter')
            )}
            {renderSettingItem(
              'document-text-outline',
              t('settings.items.terms.title'),
              t('settings.items.terms.subtitle'),
              () => {}
            )}
            {renderSettingItem(
              'shield-checkmark-outline',
              t('settings.items.privacyPolicy.title'),
              t('settings.items.privacyPolicy.subtitle'),
              () => {}
            )}
            {renderSettingItem(
              'information-circle-outline',
              t('settings.items.aboutApp.title'),
              t('settings.items.aboutApp.subtitle'),
              () => {}
            )}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.actions')}</Text>
          <View style={styles.settingsCard}>
            {renderSettingItem(
              'log-out-outline',
              t('settings.items.logout.title'),
              t('settings.items.logout.subtitle'),
              handleLogout
            )}
            {renderSettingItem(
              'trash-outline',
              t('settings.items.deleteAccount.title'),
              t('settings.items.deleteAccount.subtitle'),
              handleDeleteAccount
            )}
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  themeIndicator: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  themeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  languageIndicator: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  languageText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
});

export default SettingsScreen;

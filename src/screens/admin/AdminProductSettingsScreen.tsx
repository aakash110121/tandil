import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { adminService } from '../../services/adminService';

const AdminProductSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [lowStockWarning, setLowStockWarning] = useState(true);
  const [allowBackorders, setAllowBackorders] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(true);

  const [shippingAmount, setShippingAmount] = useState('');
  const [taxPercent, setTaxPercent] = useState('');
  const [shopSettingsLoading, setShopSettingsLoading] = useState(true);
  const [shopSettingsSaving, setShopSettingsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminService
      .getShopSettings()
      .then((res) => {
        if (cancelled) return;
        const d = res.data;
        if (d) {
          setShippingAmount(String(d.shipping_amount ?? 0));
          setTaxPercent(String(d.tax_percent ?? 0));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setShippingAmount('0');
          setTaxPercent('5');
        }
      })
      .finally(() => {
        if (!cancelled) setShopSettingsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSaveShippingTax = () => {
    const shipping = parseFloat(shippingAmount);
    const tax = parseFloat(taxPercent);
    if (Number.isNaN(shipping) || shipping < 0) {
      Alert.alert(t('common.error', 'Error'), t('admin.settings.productSettings.shippingInvalid', 'Enter a valid shipping amount (≥ 0).'));
      return;
    }
    if (Number.isNaN(tax) || tax < 0 || tax > 100) {
      Alert.alert(t('common.error', 'Error'), t('admin.settings.productSettings.taxInvalid', 'Enter a valid tax percent (0–100).'));
      return;
    }
    setShopSettingsSaving(true);
    adminService
      .updateShopSettings({ shipping_amount: shipping, tax_percent: tax })
      .then(() => {
        Alert.alert(t('admin.settings.success', 'Success'), t('admin.settings.productSettings.saved', 'Shipping and tax settings saved.'));
      })
      .catch((err: any) => {
        Alert.alert(
          t('common.error', 'Error'),
          err.response?.data?.message || err.message || t('admin.settings.productSettings.saveFailed', 'Failed to save settings.')
        );
      })
      .finally(() => setShopSettingsSaving(false));
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('admin.settings.productSettings.title', 'Product Settings')}
        showBack
        showLanguage={false}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('admin.settings.productSettings.inventory', 'Inventory')}
          </Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="warning-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                  {t('admin.settings.productSettings.lowStockWarning.title', 'Low stock warning')}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {t('admin.settings.productSettings.lowStockWarning.subtitle', 'Notify when stock is low')}
                </Text>
              </View>
              <Switch
                value={lowStockWarning}
                onValueChange={setLowStockWarning}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
                thumbColor={lowStockWarning ? COLORS.primary : COLORS.background}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="layers-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                  {t('admin.settings.productSettings.allowBackorders.title', 'Allow backorders')}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {t('admin.settings.productSettings.allowBackorders.subtitle', 'Let customers order out-of-stock items')}
                </Text>
              </View>
              <Switch
                value={allowBackorders}
                onValueChange={setAllowBackorders}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
                thumbColor={allowBackorders ? COLORS.primary : COLORS.background}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="eye-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                  {t('admin.settings.productSettings.showOutOfStock.title', 'Show out of stock')}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {t('admin.settings.productSettings.showOutOfStock.subtitle', 'Display out-of-stock products in store')}
                </Text>
              </View>
              <Switch
                value={showOutOfStock}
                onValueChange={setShowOutOfStock}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
                thumbColor={showOutOfStock ? COLORS.primary : COLORS.background}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('admin.settings.productSettings.shippingTax', 'Shipping & Tax')}
          </Text>
          <View style={styles.sectionContent}>
            {shopSettingsLoading ? (
              <View style={styles.settingItem}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.settingSubtitle}>{t('common.loading', 'Loading…')}</Text>
              </View>
            ) : (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingIcon}>
                    <Ionicons name="car-outline" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>
                      {t('admin.settings.productSettings.shippingAmount', 'Shipping amount (AED)')}
                    </Text>
                    <Text style={styles.settingSubtitle}>
                      {t('admin.settings.productSettings.shippingAmountHint', '0 = Free shipping')}
                    </Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={shippingAmount}
                    onChangeText={setShippingAmount}
                    keyboardType="decimal-pad"
                    placeholder="0"
                  />
                </View>
                <View style={styles.settingItem}>
                  <View style={styles.settingIcon}>
                    <Ionicons name="pricetag-outline" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>
                      {t('admin.settings.productSettings.taxPercent', 'Tax (%)')}
                    </Text>
                    <Text style={styles.settingSubtitle}>
                      {t('admin.settings.productSettings.taxPercentHint', 'Applied to subtotal')}
                    </Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={taxPercent}
                    onChangeText={setTaxPercent}
                    keyboardType="decimal-pad"
                    placeholder="5"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.saveButton, shopSettingsSaving && styles.saveButtonDisabled]}
                  onPress={handleSaveShippingTax}
                  disabled={shopSettingsSaving}
                >
                  {shopSettingsSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>{t('admin.settings.productSettings.save', 'Save')}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('admin.settings.productSettings.display', 'Display & currency')}
          </Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                  {t('admin.settings.productSettings.currency.title', 'Default currency')}
                </Text>
                <Text style={styles.settingSubtitle}>AED</Text>
              </View>
            </View>
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
  content: {
    flex: 1,
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
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minWidth: 72,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: '#fff',
  },
});

export default AdminProductSettingsScreen;

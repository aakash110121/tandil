import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

const TechnicianAddBankAccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!bankName.trim()) next.bankName = t('payout.addBank.errorBankName');
    if (!accountHolderName.trim()) next.accountHolderName = t('payout.addBank.errorAccountHolder');
    if (!accountNumber.trim()) next.accountNumber = t('payout.addBank.errorAccountNumber');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // TODO: wire to POST /api/technician/bank-account or similar when API is ready
      await new Promise((r) => setTimeout(r, 600));
      setSaving(false);
      Alert.alert(
        t('payout.addBank.successTitle'),
        t('payout.addBank.successMessage'),
        [{ text: t('technician.ok'), onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      setSaving(false);
      Alert.alert(
        t('technician.error'),
        t('payout.addBank.errorSave')
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('payout.addBank.title')}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          {t('payout.addBank.subtitle')}
        </Text>

        <Input
          label={t('payout.addBank.bankName')}
          placeholder={t('payout.addBank.bankNamePlaceholder')}
          value={bankName}
          onChangeText={(v) => { setBankName(v); if (errors.bankName) setErrors({ ...errors, bankName: '' }); }}
          error={errors.bankName}
        />

        <Input
          label={t('payout.addBank.accountHolderName')}
          placeholder={t('payout.addBank.accountHolderPlaceholder')}
          value={accountHolderName}
          onChangeText={(v) => { setAccountHolderName(v); if (errors.accountHolderName) setErrors({ ...errors, accountHolderName: '' }); }}
          error={errors.accountHolderName}
        />

        <Input
          label={t('payout.addBank.accountNumber')}
          placeholder={t('payout.addBank.accountNumberPlaceholder')}
          value={accountNumber}
          onChangeText={(v) => { setAccountNumber(v); if (errors.accountNumber) setErrors({ ...errors, accountNumber: '' }); }}
          keyboardType="numeric"
          error={errors.accountNumber}
        />

        <Input
          label={t('payout.addBank.iban')}
          placeholder={t('payout.addBank.ibanPlaceholder')}
          value={iban}
          onChangeText={setIban}
        />

        <Input
          label={t('payout.addBank.swiftCode')}
          placeholder={t('payout.addBank.swiftPlaceholder')}
          value={swiftCode}
          onChangeText={setSwiftCode}
        />

        <Input
          label={t('payout.addBank.branchName')}
          placeholder={t('payout.addBank.branchPlaceholder')}
          value={branchName}
          onChangeText={setBranchName}
        />

        <Button
          title={t('payout.addBank.save')}
          onPress={handleSave}
          disabled={saving}
          loading={saving}
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  saveButton: { marginTop: SPACING.md },
});

export default TechnicianAddBankAccountScreen;

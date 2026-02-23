import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { createAddress, CreateAddressParams } from '../../services/userService';

const ADDRESS_TYPES = [
  { value: 'home', label: 'Home' },
  { value: 'office', label: 'Office' },
  { value: 'other', label: 'Other' },
];

const AddAddressScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [type, setType] = useState<string>('home');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('UAE');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedFullName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedStreet = streetAddress.trim();
    const trimmedCity = city.trim();
    const trimmedCountry = country.trim();

    if (!trimmedFullName) {
      Alert.alert(t('common.error', 'Error'), t('addAddress.fullNameRequired', 'Full name is required.'));
      return;
    }
    if (!trimmedPhone) {
      Alert.alert(t('common.error', 'Error'), t('addAddress.phoneRequired', 'Phone number is required.'));
      return;
    }
    if (!trimmedStreet) {
      Alert.alert(t('common.error', 'Error'), t('addAddress.streetRequired', 'Street address is required.'));
      return;
    }
    if (!trimmedCity) {
      Alert.alert(t('common.error', 'Error'), t('addAddress.cityRequired', 'City is required.'));
      return;
    }
    if (!trimmedCountry) {
      Alert.alert(t('common.error', 'Error'), t('addAddress.countryRequired', 'Country is required.'));
      return;
    }

    setSaving(true);
    try {
      const params: CreateAddressParams = {
        type,
        full_name: trimmedFullName,
        phone_number: trimmedPhone,
        street_address: trimmedStreet,
        city: trimmedCity,
        state: state.trim() || undefined,
        zip_code: zipCode.trim() || undefined,
        country: trimmedCountry,
        is_default: isDefault,
      };
      const created = await createAddress(params);
      if (created) {
        Alert.alert(t('common.success', 'Saved'), t('addAddress.saved', 'Address added successfully.'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert(t('common.error', 'Error'), t('addAddress.failed', 'Failed to add address.'));
      }
    } catch (err: any) {
      const message = err.response?.data?.message ?? err.message ?? t('addAddress.failed', 'Failed to add address.');
      Alert.alert(t('common.error', 'Error'), message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('addAddress.title', 'Add New Address')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>{t('addAddress.type', 'Address type')}</Text>
        <View style={styles.typeRow}>
          {ADDRESS_TYPES.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.typeBtn, type === opt.value && styles.typeBtnActive]}
              onPress={() => setType(opt.value)}
            >
              <Text style={[styles.typeBtnText, type === opt.value && styles.typeBtnTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('addAddress.fullName', 'Full name')} *</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('addAddress.placeholderFullName', 'e.g. Client One')}
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>{t('addAddress.phoneNumber', 'Phone number')} *</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder={t('addAddress.placeholderPhone', '+971501234567')}
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>{t('addAddress.streetAddress', 'Street address')} *</Text>
        <TextInput
          style={styles.input}
          value={streetAddress}
          onChangeText={setStreetAddress}
          placeholder={t('addAddress.placeholderStreet', 'e.g. 123 Main St')}
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>{t('addAddress.city', 'City')} *</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder={t('addAddress.placeholderCity', 'e.g. Dubai')}
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>{t('addAddress.state', 'State')}</Text>
        <TextInput
          style={styles.input}
          value={state}
          onChangeText={setState}
          placeholder={t('addAddress.placeholderState', 'Optional')}
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>{t('addAddress.zipCode', 'Zip code')}</Text>
        <TextInput
          style={styles.input}
          value={zipCode}
          onChangeText={setZipCode}
          placeholder={t('addAddress.placeholderZip', 'Optional')}
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>{t('addAddress.country', 'Country')} *</Text>
        <TextInput
          style={styles.input}
          value={country}
          onChangeText={setCountry}
          placeholder={t('addAddress.placeholderCountry', 'e.g. UAE')}
          placeholderTextColor={COLORS.textSecondary}
        />

        <TouchableOpacity
          style={styles.defaultRow}
          onPress={() => setIsDefault(!isDefault)}
          activeOpacity={0.8}
        >
          <Text style={styles.defaultLabel}>{t('addAddress.setDefault', 'Set as default address')}</Text>
          <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
            {isDefault && <Ionicons name="checkmark" size={16} color={COLORS.background} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{t('addAddress.save', 'Save Address')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  scroll: { flex: 1 },
  form: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  label: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  typeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  typeBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  typeBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  typeBtnTextActive: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.semiBold },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  defaultLabel: { fontSize: FONT_SIZES.md, color: COLORS.text },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontWeight: FONT_WEIGHTS.medium },
});

export default AddAddressScreen;

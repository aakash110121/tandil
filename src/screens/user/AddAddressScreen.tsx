import React, { useState, useEffect } from 'react';
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
import { createAddress, getUserAddresses, CreateAddressParams } from '../../services/userService';
import { getAddressFromCurrentLocation } from '../../utils/addressFromLocation';
import MapPickerModal from '../../components/MapPickerModal';
import type { AddressFromLocation } from '../../utils/addressFromLocation';

const MAX_ADDRESSES = 5;

const ADDRESS_TYPES = [
  { value: 'home', labelKey: 'addAddress.types.home' as const },
  { value: 'office', labelKey: 'addAddress.types.office' as const },
  { value: 'other', labelKey: 'addAddress.types.other' as const },
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
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);

  const fillFromLocation = async () => {
    setLocationLoading(true);
    const result = await getAddressFromCurrentLocation();
    setLocationLoading(false);
    if (result.ok) {
      const a = result.address;
      if (a.street_address) setStreetAddress(a.street_address);
      if (a.city) setCity(a.city);
      if (a.state) setState(a.state);
      if (a.country) setCountry(a.country);
      if (a.zip_code) setZipCode(a.zip_code);
    } else {
      Alert.alert(
        t('common.error'),
        t('addAddress.locationError')
      );
    }
  };

  const fillFromMapAddress = (a: AddressFromLocation) => {
    if (a.street_address) setStreetAddress(a.street_address);
    if (a.city) setCity(a.city);
    if (a.state) setState(a.state);
    if (a.country) setCountry(a.country);
    if (a.zip_code) setZipCode(a.zip_code);
  };

  useEffect(() => {
    fillFromLocation();
  }, []);

  const handleSave = async () => {
    const trimmedFullName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedStreet = streetAddress.trim();
    const trimmedCity = city.trim();
    const trimmedCountry = country.trim();

    try {
      const existing = await getUserAddresses();
      if (existing.length >= MAX_ADDRESSES) {
        Alert.alert(
          t('addressesScreen.maxReachedTitle'),
          t('addressesScreen.maxAddresses')
        );
        return;
      }
    } catch {
      // continue to save if fetch fails
    }

    if (!trimmedFullName) {
      Alert.alert(t('common.error'), t('addAddress.fullNameRequired'));
      return;
    }
    if (!trimmedPhone) {
      Alert.alert(t('common.error'), t('addAddress.phoneRequired'));
      return;
    }
    if (!trimmedStreet) {
      Alert.alert(t('common.error'), t('addAddress.streetRequired'));
      return;
    }
    if (!trimmedCity) {
      Alert.alert(t('common.error'), t('addAddress.cityRequired'));
      return;
    }
    if (!trimmedCountry) {
      Alert.alert(t('common.error'), t('addAddress.countryRequired'));
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
        Alert.alert(t('common.success'), t('addAddress.saved'), [
          { text: t('common.ok'), onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert(t('common.error'), t('addAddress.failed'));
      }
    } catch (err: any) {
      const message = err.response?.data?.message ?? err.message ?? t('addAddress.failed');
      Alert.alert(t('common.error'), message);
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
        <Text style={styles.headerTitle}>{t('addAddress.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>{t('addAddress.type')}</Text>
        <View style={styles.typeRow}>
          {ADDRESS_TYPES.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.typeBtn, type === opt.value && styles.typeBtnActive]}
              onPress={() => setType(opt.value)}
            >
              <Text style={[styles.typeBtnText, type === opt.value && styles.typeBtnTextActive]}>{t(opt.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('addAddress.fullName')} *</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('addAddress.placeholderFullName')}
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>{t('addAddress.phoneNumber')} *</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder={t('addAddress.placeholderPhone')}
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="phone-pad"
        />

        <View style={styles.locationOptions}>
          <TouchableOpacity
            style={styles.useLocationBtn}
            onPress={fillFromLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="location" size={18} color={COLORS.primary} />
                <Text style={styles.useLocationText}>{t('addAddress.useCurrentLocation')}</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pickFromMapBtn}
            onPress={() => setMapPickerVisible(true)}
          >
            <Ionicons name="map" size={18} color={COLORS.primary} />
            <Text style={styles.useLocationText}>{t('addAddress.pickFromMap')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>{t('addAddress.streetAddress')} *</Text>
        <TextInput
          style={styles.input}
          value={streetAddress}
          onChangeText={setStreetAddress}
          placeholder={t('addAddress.placeholderStreet')}
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>{t('addAddress.city')} *</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder={t('addAddress.placeholderCity')}
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>{t('addAddress.state')}</Text>
        <TextInput
          style={styles.input}
          value={state}
          onChangeText={setState}
          placeholder={t('addAddress.placeholderState')}
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>{t('addAddress.zipCode')}</Text>
        <TextInput
          style={styles.input}
          value={zipCode}
          onChangeText={setZipCode}
          placeholder={t('addAddress.placeholderZip')}
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>{t('addAddress.country')} *</Text>
        <TextInput
          style={styles.input}
          value={country}
          onChangeText={setCountry}
          placeholder={t('addAddress.placeholderCountry')}
          placeholderTextColor={COLORS.textSecondary}
        />

        <TouchableOpacity
          style={styles.defaultRow}
          onPress={() => setIsDefault(!isDefault)}
          activeOpacity={0.8}
        >
          <Text style={styles.defaultLabel}>{t('addAddress.setDefault')}</Text>
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
            <Text style={styles.saveBtnText}>{t('addAddress.save')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <MapPickerModal
        visible={mapPickerVisible}
        onClose={() => setMapPickerVisible(false)}
        onSelect={fillFromMapAddress}
        confirmMessage={t('addAddress.useThisLocation')}
      />
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
  locationOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  useLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 0,
  },
  pickFromMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 0,
  },
  useLocationText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium },
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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MapPickerModal from '../../components/MapPickerModal';
import type { AddressFromLocation } from '../../utils/addressFromLocation';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { useTranslation } from 'react-i18next';
import { getTechnicianServiceAreas, updateTechnicianServiceAreas } from '../../services/technicianService';

/** Show city/country (e.g. Dubai, Abu Dhabi) from current location or map. */
function formatAddressForArea(a: AddressFromLocation, selectedLocationLabel: string): string {
  if (a.city?.trim()) return a.city.trim();
  if (a.state?.trim()) return a.state.trim();
  if (a.country?.trim()) return a.country.trim();
  return a.street_address?.trim() || selectedLocationLabel;
}

const TechnicianServiceAreasSettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  useEffect(() => {
    getTechnicianServiceAreas()
      .then(data => {
        const areas = data.service_areas?.length
          ? data.service_areas
          : data.service_area
            ? [data.service_area]
            : [];
        setServiceAreas(areas);
      })
      .finally(() => setLoading(false));
  }, []);

  const onMapSelect = (address: AddressFromLocation) => {
    const label = formatAddressForArea(address, t('technician.selectedLocation'));
    setServiceAreas(prev => (prev.includes(label) ? prev : [...prev, label]));
    setMapVisible(false);
  };

  const removeArea = (index: number) => {
    setServiceAreas(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateTechnicianServiceAreas({
        service_areas: serviceAreas,
        ...(serviceAreas.length === 1 && { service_area: serviceAreas[0] }),
      });
      setSaving(false);
      if (result.success) {
        Alert.alert(t('technician.saved'), result.message ?? t('technician.serviceAreasUpdated'), [
          { text: t('technician.ok'), onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert(t('technician.error'), result.message ?? t('technician.saveFailed'));
      }
    } catch {
      setSaving(false);
      Alert.alert(t('technician.error'), t('technician.saveFailed') + ' ' + t('technician.tryAgain'));
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t('technician.loadingJobs')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('technician.serviceAreas')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('technician.serviceAreasScreen.addAddressFromMap')}</Text>
          <Text style={styles.hint}>
            {t('technician.serviceAreasScreen.pickLocationHint')}
          </Text>
          <TouchableOpacity style={styles.mapButton} onPress={() => setMapVisible(true)}>
            <Ionicons name="location-outline" size={28} color={COLORS.primary} />
            <Text style={styles.mapButtonText}>{t('technician.serviceAreasScreen.pickLocationFromMap')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('technician.serviceAreasScreen.yourServiceAreas', { count: serviceAreas.length })}</Text>
          {serviceAreas.length === 0 ? (
            <Text style={styles.emptyText}>{t('technician.serviceAreasScreen.noServiceAreasAdded')}</Text>
          ) : (
            serviceAreas.map((area, index) => (
              <View key={index} style={styles.areaCard}>
                <Ionicons name="location" size={20} color={COLORS.primary} />
                <Text style={styles.areaText} numberOfLines={2}>{area}</Text>
                <TouchableOpacity onPress={() => removeArea(index)} style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={22} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{t('technician.availability.save')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <MapPickerModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onSelect={onMapSelect}
        confirmMessage={t('technician.addAsServiceArea')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  section: { marginBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SPACING.sm },
  hint: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  mapButtonText: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  areaText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  removeBtn: { padding: SPACING.sm },
  saveBtn: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: '#fff' },
});

export default TechnicianServiceAreasSettingsScreen;

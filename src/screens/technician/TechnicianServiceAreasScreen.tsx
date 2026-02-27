import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MapPickerModal from '../../components/MapPickerModal';
import type { AddressFromLocation } from '../../utils/addressFromLocation';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

type RouteParams = { initialServiceAreas?: string[] };

/** Show city name only (e.g. Dubai, Abu Dhabi), not full address. */
function formatAddressForArea(a: AddressFromLocation, selectedLocationLabel: string): string {
  if (a.city?.trim()) return a.city.trim();
  if (a.state?.trim()) return a.state.trim();
  if (a.country?.trim()) return a.country.trim();
  return a.street_address?.trim() || selectedLocationLabel;
}

const TechnicianServiceAreasScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const initialAreas = (route.params as RouteParams)?.initialServiceAreas ?? [];

  const [serviceAreas, setServiceAreas] = useState<string[]>(initialAreas);
  const [mapVisible, setMapVisible] = useState(false);

  const onMapSelect = (address: AddressFromLocation) => {
    const label = formatAddressForArea(address, t('technician.selectedLocation'));
    setServiceAreas(prev => (prev.includes(label) ? prev : [...prev, label]));
    setMapVisible(false);
  };

  const removeArea = (index: number) => {
    setServiceAreas(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    navigation.navigate('Main', { screen: 'ScheduleTab', params: { service_areas: serviceAreas } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('technician.serviceAreas')}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('technician.done')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('technician.serviceAreasScreen.addAddressFromMap')}</Text>
          <Text style={styles.hint}>{t('technician.serviceAreasScreen.pickLocationHint')}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backButton: { padding: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  saveButton: { padding: SPACING.sm },
  saveButtonText: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: FONT_WEIGHTS.medium },
  scroll: { flex: 1 },
  section: { marginBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SPACING.md },
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
});

export default TechnicianServiceAreasScreen;

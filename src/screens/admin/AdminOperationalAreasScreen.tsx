import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MapView, { Marker, Region } from 'react-native-maps';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { adminService, AdminOperationalAreaItem, AdminOperationalAreasSummary } from '../../services/adminService';

const UAE_REGION: Region = {
  latitude: 24.35,
  longitude: 54.38,
  latitudeDelta: 5.2,
  longitudeDelta: 4.2,
};
const OPERATIONAL_AREAS_PER_PAGE = 108;

const UAE_LOCATION_FALLBACK_COORDS: Record<string, { latitude: number; longitude: number }> = {
  'abu dhabi': { latitude: 24.4539, longitude: 54.3773 },
  dubai: { latitude: 25.2048, longitude: 55.2708 },
  sharjah: { latitude: 25.3463, longitude: 55.4209 },
  ajman: { latitude: 25.4052, longitude: 55.5136 },
  fujairah: { latitude: 25.1288, longitude: 56.3265 },
  'ras al khaimah': { latitude: 25.7895, longitude: 55.9432 },
  'umm al quwain': { latitude: 25.5647, longitude: 55.5552 },
  'al ain': { latitude: 24.2075, longitude: 55.7447 },
};

function normalizePlace(value?: string | null): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function getAreaCoordinate(area: AdminOperationalAreaItem): { latitude: number; longitude: number } | null {
  if (typeof area.latitude === 'number' && typeof area.longitude === 'number') {
    return { latitude: area.latitude, longitude: area.longitude };
  }
  const locationKey = normalizePlace(area.location);
  if (locationKey && UAE_LOCATION_FALLBACK_COORDS[locationKey]) {
    return UAE_LOCATION_FALLBACK_COORDS[locationKey];
  }
  const nameKey = normalizePlace(area.name);
  const matchedKey = Object.keys(UAE_LOCATION_FALLBACK_COORDS).find((key) => nameKey.includes(key));
  if (matchedKey) return UAE_LOCATION_FALLBACK_COORDS[matchedKey];
  return null;
}

function isAreaActive(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes' || v === 'active';
  }
  return false;
}

const AdminOperationalAreasScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [areas, setAreas] = useState<AdminOperationalAreaItem[]>([]);
  const [summary, setSummary] = useState<AdminOperationalAreasSummary>({
    total_zones: 0,
    operational_zones: 0,
    pinned_on_map: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [togglingAreaIds, setTogglingAreaIds] = useState<Record<number, boolean>>({});

  const activePinnedAreas = areas
    .filter((area) => isAreaActive((area as unknown as { is_active: unknown }).is_active))
    .map((area) => ({ area, coordinate: getAreaCoordinate(area) }))
    .filter(
      (entry): entry is { area: AdminOperationalAreaItem; coordinate: { latitude: number; longitude: number } } =>
        entry.coordinate != null
    )
    .map((entry, index, arr) => {
      const duplicatesBefore = arr
        .slice(0, index)
        .filter(
          (x) =>
            x.coordinate.latitude === entry.coordinate.latitude &&
            x.coordinate.longitude === entry.coordinate.longitude
        ).length;
      if (duplicatesBefore === 0) return { ...entry, displayCoordinate: entry.coordinate };
      const step = 0.03;
      const angle = duplicatesBefore * 45;
      const radians = (angle * Math.PI) / 180;
      return {
        ...entry,
        displayCoordinate: {
          latitude: entry.coordinate.latitude + Math.sin(radians) * step,
          longitude: entry.coordinate.longitude + Math.cos(radians) * step,
        },
      };
    });

  const fetchOperationalAreas = useCallback(async (page: number = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const res = await adminService.getOperationalAreas({
        country: 'UAE',
        per_page: OPERATIONAL_AREAS_PER_PAGE,
        page,
      });
      const incoming = res?.data?.areas ?? [];
      const incomingSummary = res?.data?.summary;
      setAreas((prev) => (append ? [...prev, ...incoming] : incoming));
      if (incomingSummary) setSummary(incomingSummary);
      setCurrentPage(res?.pagination?.current_page ?? page);
      setLastPage(res?.pagination?.last_page ?? 1);
    } catch {
      if (!append) {
        setAreas([]);
        setSummary({ total_zones: 0, operational_zones: 0, pinned_on_map: 0 });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOperationalAreas(1, false);
    }, [fetchOperationalAreas])
  );

  const onToggleArea = async (id: number, value: boolean) => {
    const previousAreas = areas;
    setAreas((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: value } : item)));
    setTogglingAreaIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await adminService.toggleOperationalAreaActive(id);
      if (!res?.success) {
        setAreas(previousAreas);
        Alert.alert('Update failed', res?.message || 'Could not update zone status. Please try again.');
      } else if (res?.data && typeof res.data.is_active !== 'undefined') {
        const nextActive = isAreaActive(res.data.is_active);
        setAreas((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: nextActive } : item)));
      }
    } catch (e: any) {
      setAreas(previousAreas);
      Alert.alert('Update failed', e?.response?.data?.message || e?.message || 'Could not update zone status.');
    } finally {
      setTogglingAreaIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.topHeader}>
          <View>
            <Text style={styles.screenTitle}>UAE Operational Areas</Text>
            <Text style={styles.screenSubtitle}>
              Enable/disable cities and zones from one screen, with live map pins for active operations.
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButtonSecondary}>
              <Text style={styles.headerButtonSecondaryText}>Zone Assignment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButtonPrimary}>
              <Text style={styles.headerButtonPrimaryText}>New Zone</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL ZONES</Text>
            <Text style={styles.statValue}>{summary.total_zones}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardHighlight]}>
            <Text style={styles.statLabel}>OPERATIONAL</Text>
            <Text style={styles.statValue}>{summary.operational_zones}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PINNED ON MAP</Text>
            <Text style={styles.statValue}>{summary.pinned_on_map}</Text>
          </View>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapCardHeader}>
            <View>
              <Text style={styles.mapTitle}>UAE Operational Map</Text>
              <Text style={styles.mapSubtitle}>Only active zones with valid coordinates are pinned on map.</Text>
            </View>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>Live Pins</Text>
            </View>
          </View>
          <MapView
            style={styles.mapView}
            initialRegion={UAE_REGION}
            region={UAE_REGION}
            scrollEnabled
            zoomEnabled
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {activePinnedAreas.map(({ area, displayCoordinate }) => (
              <Marker
                key={`op-area-pin-${area.id}`}
                coordinate={displayCoordinate}
                title={area.name}
                description={`${area.location}, ${area.country}`}
              />
            ))}
          </MapView>
        </View>

        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Operational Area List</Text>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.cityZoneCell]}>ZONE</Text>
                <Text style={[styles.headerCell, styles.countryCell]}>CTRY</Text>
                <Text style={[styles.headerCell, styles.supervisorCell]}>SUPV</Text>
                <Text style={[styles.headerCell, styles.toggleCell]}>ACTIVE</Text>
              </View>

              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Loading operational areas...</Text>
                </View>
              ) : areas.length === 0 ? (
                <View style={styles.loadingRow}>
                  <Text style={styles.loadingText}>No operational areas found.</Text>
                </View>
              ) : (
                areas.map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <View style={styles.cityZoneCell}>
                      <Text style={styles.cellTitle}>{item.name}</Text>
                      <Text style={styles.cellSubTitle}>{item.location}</Text>
                    </View>
                    <Text style={[styles.rowCellText, styles.countryCell]}>{item.country}</Text>
                    <View style={styles.supervisorCell}>
                      <View style={[styles.supervisorTag, item.supervisors.length > 0 && styles.supervisorTagAssigned]}>
                        <Text style={[styles.supervisorTagText, item.supervisors.length > 0 && styles.supervisorTagTextAssigned]}>
                          {item.supervisors.length > 0 ? item.supervisors[0].name : 'None'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.toggleCell, styles.toggleCellWrap]}>
                      {togglingAreaIds[item.id] ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                      ) : (
                        <Switch
                          value={item.is_active}
                          onValueChange={(value) => onToggleArea(item.id, value)}
                          trackColor={{ false: COLORS.border, true: COLORS.primary + '66' }}
                          thumbColor={item.is_active ? COLORS.primary : '#f4f4f5'}
                        />
                      )}
                    </View>
                  </View>
                ))
              )}

              {!loading && currentPage < lastPage ? (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={() => fetchOperationalAreas(currentPage + 1, true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <ActivityIndicator size="small" color={COLORS.background} />
                  ) : (
                    <Text style={styles.loadMoreButtonText}>Load more</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  topBar: {
    marginBottom: SPACING.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topHeader: {
    marginBottom: SPACING.md,
  },
  screenTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  screenSubtitle: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  headerActions: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButtonSecondary: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  headerButtonSecondaryText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  headerButtonPrimary: {
    backgroundColor: '#5B58F5',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  headerButtonPrimaryText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  statCardHighlight: {
    borderColor: COLORS.success + '66',
    backgroundColor: COLORS.success + '12',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.bold,
  },
  mapCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  mapCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  mapTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  mapSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  liveBadgeText: {
    color: '#4F46E5',
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  mapView: {
    height: 220,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  tableCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  headerCell: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cityZoneCell: { flex: 1.9, paddingRight: 4 },
  countryCell: { flex: 0.9, paddingRight: 4 },
  supervisorCell: { flex: 1.25, paddingRight: 4 },
  toggleCell: { flex: 0.95, alignItems: 'center' },
  rowCellText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  cellTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  cellSubTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  supervisorTag: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FFF8E6',
    maxWidth: '100%',
  },
  supervisorTagAssigned: {
    backgroundColor: '#EEF2FF',
  },
  supervisorTagText: {
    fontSize: FONT_SIZES.xs,
    color: '#6b7280',
    maxWidth: 88,
  },
  supervisorTagTextAssigned: {
    color: '#6366f1',
  },
  toggleCellWrap: {
    alignItems: 'center',
  },
  loadingRow: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  loadMoreButton: {
    margin: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  loadMoreButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});

export default AdminOperationalAreasScreen;


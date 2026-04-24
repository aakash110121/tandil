/**
 * Get address fields from current device location (expo-location + reverse geocode).
 * Used to pre-fill Address and City on Add/Edit Address forms.
 */
import * as Location from 'expo-location';

export interface AddressFromLocation {
  street_address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  /** ISO 3166-1 alpha-2 from reverse geocode when available (e.g. AE for UAE). */
  iso_country_code?: string | null;
}

export type AddressFromLocationResult =
  | { ok: true; address: AddressFromLocation }
  | { ok: false; error: string };

/**
 * Request location permission, get current position, reverse geocode to address parts.
 * Returns address fields to pre-fill street_address and city (and optionally state, country, zip_code).
 */
export async function getAddressFromCurrentLocation(): Promise<AddressFromLocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { ok: false, error: 'Location permission denied' };
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = position.coords;
    const [first] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!first) {
      return {
        ok: false,
        error: 'Could not get address for this location',
      };
    }
    const streetParts = [first.streetNumber, first.street, first.name, first.district].filter(Boolean) as string[];
    const street_address = streetParts.length > 0 ? streetParts.join(', ') : (first.formattedAddress ?? '');
    const city = first.city ?? first.subregion ?? first.district ?? first.region ?? '';
    const state = first.region ?? first.subregion ?? '';
    const country = first.country ?? '';
    const zip_code = first.postalCode ?? '';
    return {
      ok: true,
      address: {
        street_address: street_address.trim() || 'Current location',
        city: city.trim(),
        state: state.trim(),
        country: country.trim() || 'UAE',
        zip_code: zip_code.trim(),
        iso_country_code: first.isoCountryCode ?? null,
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? 'Failed to get location',
    };
  }
}

/**
 * Reverse geocode given coordinates to address parts (e.g. when user picks a point on the map).
 */
export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<AddressFromLocationResult> {
  try {
    const [first] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!first) {
      return { ok: false, error: 'Could not get address for this location' };
    }
    const streetParts = [first.streetNumber, first.street, first.name, first.district].filter(Boolean) as string[];
    const street_address = streetParts.length > 0 ? streetParts.join(', ') : (first.formattedAddress ?? '');
    const city = first.city ?? first.subregion ?? first.district ?? first.region ?? '';
    const state = first.region ?? first.subregion ?? '';
    const country = first.country ?? '';
    const zip_code = first.postalCode ?? '';
    return {
      ok: true,
      address: {
        street_address: street_address.trim() || 'Selected location',
        city: city.trim(),
        state: state.trim(),
        country: country.trim() || 'UAE',
        zip_code: zip_code.trim(),
        iso_country_code: first.isoCountryCode ?? null,
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? 'Failed to get address',
    };
  }
}

/** UAE / Gulf names the backend typically accepts as `service_area` (not full postal strings). */
const UAE_SERVICE_AREA_KEYWORDS: { match: RegExp; canonical: string }[] = [
  { match: /\bdubai\b/i, canonical: 'Dubai' },
  { match: /\bsharjah\b/i, canonical: 'Sharjah' },
  { match: /\bajman\b/i, canonical: 'Ajman' },
  { match: /\bfujairah\b/i, canonical: 'Fujairah' },
  { match: /\br'?as\s+al\s+khaimah\b|\brak\b/i, canonical: 'Ras Al Khaimah' },
  { match: /\bumm\s+al\s+quwain\b|\buaq\b/i, canonical: 'Umm Al Quwain' },
  { match: /\bal\s+ain\b/i, canonical: 'Al Ain' },
  { match: /\babu\s+dhabi\b/i, canonical: 'Abu Dhabi' },
];

export function isLikelyUaeAddress(a: AddressFromLocation): boolean {
  if (a.iso_country_code && a.iso_country_code.toUpperCase() === 'AE') {
    return true;
  }
  const c = `${a.country} ${a.state} ${a.city}`.toLowerCase();
  return (
    /\buae\b/.test(c) ||
    /\bunited arab emirates\b/.test(c) ||
    /\bemirates\b/.test(c) ||
    c.includes('dubai') ||
    c.includes('abu dhabi') ||
    c.includes('sharjah')
  );
}

/**
 * Builds a `service_area` string for technician signup from reverse-geocode parts.
 * Avoids "City, Region, Country" blobs that often fail API validation; prefers canonical UAE names.
 */
export function buildTechnicianServiceAreaFromAddress(a: AddressFromLocation): string {
  const parts = [a.city, a.state, a.street_address].filter(Boolean).join(' ');
  for (const { match, canonical } of UAE_SERVICE_AREA_KEYWORDS) {
    if (match.test(parts)) {
      return canonical;
    }
  }
  if (isLikelyUaeAddress(a)) {
    const primary = (a.city || a.state || '').trim();
    if (primary) {
      return primary.split(',')[0].trim();
    }
  }
  // Outside UAE / no emirate match: do not send foreign city+state — backend expects DB areas.
  return '';
}

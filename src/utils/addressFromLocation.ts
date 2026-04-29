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
    const city = first.city ?? first.subregion ?? first.region ?? '';
    const state = first.region ?? '';
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
    const city = first.city ?? first.subregion ?? first.region ?? '';
    const state = first.region ?? '';
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
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? 'Failed to get address',
    };
  }
}

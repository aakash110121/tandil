// API Configuration using expo-constants
import Constants from 'expo-constants';

// Get API base URL from app.json extra config
// You can update it in app.json -> extra -> apiBaseUrl
export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 
  'https://phpstack-1180784-6050385.cloudwaysapps.com/api';

// For development, you can also use:
// export const API_BASE_URL = __DEV__ 
//   ? Constants.expoConfig?.extra?.apiBaseUrlDev || 'http://192.168.1.100:8000/api'
//   : Constants.expoConfig?.extra?.apiBaseUrl || 'https://phpstack-1180784-6050385.cloudwaysapps.com/api';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/** Build full image URL from API relative path (e.g. /media/products/xxx.jpg or products/xxx.jpg). */
export function buildFullImageUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  const path = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  const fullPath =
    path.startsWith('media/') ? path
    : path.startsWith('storage/') ? path
    : `storage/${path}`;
  return `${origin}/${fullPath}`;
}

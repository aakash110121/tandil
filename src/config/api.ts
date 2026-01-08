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


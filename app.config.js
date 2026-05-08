const appJson = require('./app.json');
const { expo } = appJson;

// EAS Build sets EAS_BUILD_PROFILE (e.g. 'preview', 'production'). Use it for Sentry environment.
const easBuildProfile = process.env.EAS_BUILD_PROFILE || 'development';
const stripeMerchantIdentifier =
  process.env.EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER || expo.extra?.stripeMerchantIdentifier || '';

const basePlugins = Array.isArray(expo.plugins) ? expo.plugins : [];
const pluginsWithoutStripe = basePlugins.filter((p) =>
  Array.isArray(p) ? p[0] !== '@stripe/stripe-react-native' : p !== '@stripe/stripe-react-native'
);
const stripePlugin = [
  '@stripe/stripe-react-native',
  {
    enableGooglePay: true,
    ...(stripeMerchantIdentifier ? { merchantIdentifier: stripeMerchantIdentifier } : {}),
  },
];

module.exports = {
  ...appJson,
  expo: {
    ...expo,
    ios: {
      ...expo.ios,
      infoPlist: {
        ...expo.ios?.infoPlist,
        NSLocationWhenInUseUsageDescription: 'We use your location to show local weather on your dashboard.',
        LSApplicationQueriesSchemes: ['tel', 'mailto', ...(expo.ios?.infoPlist?.LSApplicationQueriesSchemes || [])],
      },
    },
    android: {
      ...expo.android,
      permissions: [...(expo.android?.permissions || []), 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    },
    extra: {
      ...expo.extra,
      easBuildProfile,
      stripePublishableKey:
        process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || expo.extra?.stripePublishableKey || '',
      stripeMerchantIdentifier,
    },
    plugins: [...pluginsWithoutStripe, stripePlugin],
  },
};

const appJson = require('./app.json');
const { expo } = appJson;

// EAS Build sets EAS_BUILD_PROFILE (e.g. 'preview', 'production'). Use it for Sentry environment.
const easBuildProfile = process.env.EAS_BUILD_PROFILE || 'development';

module.exports = {
  ...appJson,
  expo: {
    ...expo,
    extra: {
      ...expo.extra,
      easBuildProfile,
    },
  },
};

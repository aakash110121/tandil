/*
  Metro configuration extending Expo's default config. This preserves Expo's
  special handling for the .expo/virtual-metro-entry while also shimming
  recyclerlistview to a noop file to avoid resolution errors.
*/
const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Extend the default config with our custom resolver
module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.includes('recyclerlistview')) {
        return {
          type: 'sourceFile',
          filePath: path.resolve(__dirname, 'src', 'shims', 'recyclerlistview.js'),
        };
      }
      // Use Expo's default resolver for everything else
      if (defaultConfig.resolver && typeof defaultConfig.resolver.resolveRequest === 'function') {
        return defaultConfig.resolver.resolveRequest(context, moduleName, platform);
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};






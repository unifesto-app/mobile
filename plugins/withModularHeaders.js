const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Custom Expo config plugin to add use_modular_headers! to Podfile
 * This is required for Firebase to work with static libraries
 */
const withModularHeaders = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf-8');
        
        // Add use_modular_headers! after platform declaration if not already present
        if (!podfileContent.includes('use_modular_headers!')) {
          podfileContent = podfileContent.replace(
            /(platform :ios.*\n)/,
            '$1\n# Fix for Firebase static library issue\nuse_modular_headers!\n'
          );
          
          fs.writeFileSync(podfilePath, podfileContent);
        }
      }
      
      return config;
    },
  ]);
};

module.exports = withModularHeaders;

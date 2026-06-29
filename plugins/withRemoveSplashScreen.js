const {
  withDangerousMod,
  withInfoPlist,
  withAndroidManifest,
  withAndroidStyles,
  withAndroidColors,
} = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Remove Expo's default splash screen to use only custom React Native splash
 */
const withRemoveSplashScreen = (config) => {
  // NOTE: Do NOT remove UILaunchStoryboardName — removing it causes
  // the app window to not size correctly on iOS (black gaps top/bottom).
  // config = withInfoPlist(config, (config) => {
  //   delete config.modResults.UILaunchStoryboardName;
  //   return config;
  // });

  // Change Android MainActivity theme from splash to AppTheme
  config = withAndroidManifest(config, (config) => {
    const mainActivity = config.modResults.manifest.application[0].activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );
    if (mainActivity) {
      mainActivity.$['android:theme'] = '@style/AppTheme';
    }
    return config;
  });

  // Remove splash screen styles from Android
  config = withAndroidStyles(config, (config) => {
    const styles = config.modResults.resources.style;
    if (styles) {
      // Remove Theme.App.SplashScreen style
      config.modResults.resources.style = styles.filter(
        (style) => style.$?.name !== 'Theme.App.SplashScreen'
      );
    }
    return config;
  });

  // Remove splash screen colors from Android
  config = withAndroidColors(config, (config) => {
    const colors = config.modResults.resources.color;
    if (colors) {
      // Remove splashscreen_background color
      config.modResults.resources.color = colors.filter(
        (color) => color.$?.name !== 'splashscreen_background'
      );
    }
    return config;
  });

  // Remove iOS SplashScreen files
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosPath = path.join(projectRoot, 'ios', config.modRequest.projectName || 'Unifesto');
      
      // Remove SplashScreen.storyboard
      const storyboardPath = path.join(iosPath, 'SplashScreen.storyboard');
      if (fs.existsSync(storyboardPath)) {
        fs.unlinkSync(storyboardPath);
      }

      // Remove splash screen assets
      const splashLogoPath = path.join(iosPath, 'Images.xcassets', 'SplashScreenLogo.imageset');
      if (fs.existsSync(splashLogoPath)) {
        fs.rmSync(splashLogoPath, { recursive: true, force: true });
      }

      const splashBgPath = path.join(iosPath, 'Images.xcassets', 'SplashScreenBackground.colorset');
      if (fs.existsSync(splashBgPath)) {
        fs.rmSync(splashBgPath, { recursive: true, force: true });
      }

      return config;
    },
  ]);

  // Remove Android splash screen images
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const resPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
      
      // Remove splashscreen_logo.png from all drawable folders
      const drawableFolders = [
        'drawable-mdpi',
        'drawable-hdpi',
        'drawable-xhdpi',
        'drawable-xxhdpi',
        'drawable-xxxhdpi',
      ];

      for (const folder of drawableFolders) {
        const splashPath = path.join(resPath, folder, 'splashscreen_logo.png');
        if (fs.existsSync(splashPath)) {
          fs.unlinkSync(splashPath);
        }
      }

      // Replace ic_launcher_background.xml with solid black (removes splashscreen_logo reference)
      const launcherBgPath = path.join(resPath, 'drawable', 'ic_launcher_background.xml');
      if (fs.existsSync(launcherBgPath)) {
        const cleanXml = `<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android">\n  <solid android:color="#000000"/>\n</shape>`;
        fs.writeFileSync(launcherBgPath, cleanXml, 'utf8');
      }

      return config;
    },
  ]);

  return config;
};

module.exports = withRemoveSplashScreen;

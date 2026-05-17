const withModularHeaders = require('./plugins/withModularHeaders');
// const withAndroidEdgeToEdge = require('./plugins/withAndroidEdgeToEdge');
// const withAndroidEdgeToEdgeStyles = require('./plugins/withAndroidStyles');
const withFirebaseDisableAutoInit = require('./plugins/withFirebaseDisableAutoInit');
const withRemoveOrientationRestrictions = require('./plugins/withRemoveOrientationRestrictions');

module.exports = () => {
  const config = {
    name: "Unifesto",
    slug: "unifesto",
    version: "1.0.1",
    orientation: "default",
    userInterfaceStyle: "dark",
    scheme: "unifesto",
    icon: "./assets/app-icon-transparent.png",
    splash: {
      image: "./assets/app-icon-transparent.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.unifesto.app",
      icon: "./assets/app-icon-dark.png",
      googleServicesFile: "./GoogleService-Info.plist",
      splash: {
        image: "./assets/app-icon-transparent.png",
        resizeMode: "contain",
        backgroundColor: "#000000"
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "We need camera access to let you take photos for your profile picture. For example, you can capture a new photo directly when updating your profile avatar.",
        NSPhotoLibraryUsageDescription: "Unifesto needs access to your photo library to select photos for your profile picture.",
        NSPhotoLibraryAddUsageDescription: "Unifesto needs permission to save event tickets and QR codes to your photo library.",
        NSUserNotificationsUsageDescription: "We need permission to send you notifications about event updates, ticket confirmations, and important announcements. For example, you'll receive a notification when your event registration is confirmed or when an event you're attending is about to start.",
        NSLocationWhenInUseUsageDescription: "Unifesto uses your location to help you discover nearby events and provide location-based event recommendations. Your location data is only used while you're using the app and is never shared with third parties.",
        // Firebase auto-initialization disabled for ATT compliance
        FirebaseAppDelegateProxyEnabled: false,
        FirebaseAnalyticsCollectionEnabled: false,
        FirebaseAnalyticsCollectionDeactivated: true,
        FirebaseScreenReportingEnabled: false,
      },
      associatedDomains: [
        "applinks:unifesto.app",
        "applinks:www.unifesto.app",
        "applinks:auth.unifesto.app"
      ],
      appClip: {
        bundleIdentifier: "com.unifesto.app.Clip"
      },
      usesAppleSignIn: true
    },
    android: {
      package: "com.unifesto.app",
      icon: "./assets/app-icon-transparent.png",
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/app-icon-transparent.png",
        backgroundColor: "#000000"
      },
      splash: {
        image: "./assets/app-icon-transparent.png",
        resizeMode: "contain",
        backgroundColor: "#000000"
      },
      permissions: [
        "android.permission.READ_PHONE_STATE",
        "android.permission.READ_DEVICE_CONFIG",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.INTERNET"
      ],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "unifesto.app",
              pathPrefix: "/events"
            },
            {
              scheme: "https",
              host: "unifesto.app",
              pathPrefix: "/org"
            },
            {
              scheme: "https",
              host: "unifesto.app",
              pathPrefix: "/signup"
            },
            {
              scheme: "https",
              host: "www.unifesto.app",
              pathPrefix: "/events"
            },
            {
              scheme: "https",
              host: "www.unifesto.app",
              pathPrefix: "/org"
            },
            {
              scheme: "https",
              host: "www.unifesto.app",
              pathPrefix: "/signup"
            },
            {
              scheme: "https",
              host: "auth.unifesto.app",
              pathPrefix: "/auth/callback"
            }
          ],
          category: [
            "BROWSABLE",
            "DEFAULT"
          ]
        },
        {
          action: "VIEW",
          data: [
            {
              scheme: "unifesto"
            }
          ],
          category: [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ],
      // Suppress Android 15 edge-to-edge deprecation warnings
      // These are from React Native/Expo libraries, not our code
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      buildToolsVersion: "35.0.0"
    },
    androidStatusBar: {
      translucent: false,
      backgroundColor: "#000000",
      barStyle: "light-content"
    },
    androidNavigationBar: {
      backgroundColor: "#000000",
      barStyle: "light-content"
    },
    web: {
      bundler: "metro",
      favicon: "./assets/app-icon-transparent.png"
    },
    plugins: [
      "expo-font",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#000000",
          image: "./assets/app-icon-transparent.png",
          imageWidth: 200
        }
      ],
      "expo-web-browser",
      [
        "onesignal-expo-plugin",
        {
          mode: "development"
        }
      ],
      "@react-native-firebase/app",
      "expo-dev-client"
    ],
    extra: {
      eas: {
        projectId: "63cae7f2-fb5a-4891-a98f-0ffc04e6c3ad"
      }
    }
  };

  // Apply custom plugins and return the modified config
  let modifiedConfig = withModularHeaders(config);
  // Disabled edge-to-edge plugins to fix status bar overlap on Android
  // modifiedConfig = withAndroidEdgeToEdge(modifiedConfig);
  // modifiedConfig = withAndroidEdgeToEdgeStyles(modifiedConfig);
  modifiedConfig = withFirebaseDisableAutoInit(modifiedConfig);
  modifiedConfig = withRemoveOrientationRestrictions(modifiedConfig);
  return modifiedConfig;
};

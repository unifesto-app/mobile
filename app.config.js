const withModularHeaders = require('./plugins/withModularHeaders');

module.exports = () => {
  const config = {
    name: "Unifesto",
    slug: "unifesto",
    version: "1.0.0",
    orientation: "portrait",
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
        NSUserTrackingUsageDescription: "We use tracking to provide personalized event recommendations and improve your experience. Your data is never sold to third parties.",
        NSCameraUsageDescription: "We need camera access to let you take photos for your profile picture. For example, you can capture a new photo directly when updating your profile avatar.",
        NSPhotoLibraryUsageDescription: "Unifesto needs access to your photo library to select photos for your profile picture.",
        NSPhotoLibraryAddUsageDescription: "Unifesto needs permission to save event tickets and QR codes to your photo library.",
        NSUserNotificationsUsageDescription: "We need permission to send you notifications about event updates, ticket confirmations, and important announcements. For example, you'll receive a notification when your event registration is confirmed or when an event you're attending is about to start."
      },
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
      ]
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
      "expo-tracking-transparency",
      [
        "onesignal-expo-plugin",
        {
          mode: "development"
        }
      ],
      "@react-native-firebase/app"
    ],
    extra: {
      eas: {
        projectId: "63cae7f2-fb5a-4891-a98f-0ffc04e6c3ad"
      }
    }
  };
  
  // Apply the custom plugin and return the modified config
  return withModularHeaders(config);
};

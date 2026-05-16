# Android Status Bar Fix - Rebuild Required

## Issue
The Android status bar was overlapping with native stack headers due to edge-to-edge mode being enabled.

## Changes Made

### 1. **app.config.js**
- Disabled edge-to-edge plugins (`withAndroidEdgeToEdge` and `withAndroidEdgeToEdgeStyles`)
- Added `androidStatusBar` configuration:
  ```javascript
  androidStatusBar: {
    translucent: false,
    backgroundColor: "#000000",
    barStyle: "light-content"
  }
  ```

### 2. **AppNavigator.tsx**
- Added `expo-navigation-bar` import
- Updated Android system UI configuration
- Temporarily commented out `SystemUI.setBackgroundColorAsync` (will work after rebuild)
- Simplified `makeHeaderOptions` (removed `headerStatusBarHeight` and custom height)

### 3. **Screen Header Offsets**
Updated `HEADER_TOP_OFFSET` for Android in all tab screens:
- HomeScreen: 90px
- DiscoverScreen: 90px
- TicketsScreen: 90px
- ProfileScreen: 70px
- WalletScreen: 90px

## Required Action: Rebuild the App

The configuration changes require a **native rebuild** to take effect. Choose one of the following methods:

### Option 1: Clean Rebuild (Recommended)
```bash
cd mobile-app

# Clean previous builds
npx expo prebuild --clean

# Run on Android
npx expo run:android
```

### Option 2: EAS Build
If you're using EAS Build for production:
```bash
eas build --platform android --profile development
```

### Option 3: Development Client
If using Expo Dev Client:
```bash
npx expo prebuild --clean
npx expo run:android
```

## After Rebuild

Once the app is rebuilt with the new configuration:

1. ✅ Edge-to-edge mode will be disabled
2. ✅ Status bar will have a solid black background
3. ✅ Native stack headers will render below the status bar (no overlap)
4. ✅ The warning `setBackgroundColorAsync is not supported with edge-to-edge enabled` will disappear
5. ✅ You can uncomment `SystemUI.setBackgroundColorAsync('#000000')` in AppNavigator.tsx

## Verification

After rebuilding, verify:
- [ ] No status bar overlap on native stack screens (EventDetail, Wallet, etc.)
- [ ] Status bar has black background with light content
- [ ] Navigation bar is black with light buttons
- [ ] No warnings in console about edge-to-edge
- [ ] Proper spacing on all tab screens (Home, Discover, Tickets, Profile)

## Rollback (if needed)

If you need to revert to edge-to-edge mode:
1. Uncomment the plugins in `app.config.js`
2. Remove the `androidStatusBar` configuration
3. Rebuild the app

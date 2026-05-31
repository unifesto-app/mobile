# Integration Checklist

Use this checklist to track your progress integrating the new backend API.

## ✅ Pre-Integration

- [ ] Backend is running on `http://localhost:8080`
- [ ] Backend has all services configured:
  - [ ] Resend API key (email OTP)
  - [ ] WhatsApp credentials (mobile OTP)
  - [ ] Google OAuth credentials
  - [ ] Apple Sign In credentials
- [ ] Database is running and migrated
- [ ] Backend tests pass (`npm test`)

## ✅ Configuration

- [ ] Google OAuth client IDs obtained from Google Console
- [ ] Client IDs added to mobile app `.env` file
- [ ] `NewAuthContext.tsx` updated with env variables (lines 60-64)
- [ ] API base URL set in `.env` (`EXPO_PUBLIC_API_URL`)
- [ ] Installed `expo-image-picker` if not already installed

## ✅ Code Changes

- [ ] Root layout updated to use `NewAuthContext`
- [ ] Router updated to use `NewLoginScreen`
- [ ] Router updated to use `NewProfileScreen`
- [ ] Router added route for `NewAccountScreen`
- [ ] Removed or commented out old signup route (now part of login)

## ✅ Testing - Authentication

- [ ] Email OTP flow works end-to-end
  - [ ] OTP sent to email
  - [ ] OTP received in inbox
  - [ ] OTP verification successful
  - [ ] Invalid OTP shows error
  - [ ] Resend OTP works
  
- [ ] Mobile OTP flow works end-to-end
  - [ ] OTP sent via WhatsApp
  - [ ] OTP received on WhatsApp
  - [ ] OTP verification successful
  - [ ] Invalid OTP shows error
  - [ ] Resend OTP works

- [ ] Google OAuth works
  - [ ] Google button appears
  - [ ] OAuth flow completes
  - [ ] Mobile verification required (if new user)
  - [ ] Login successful

- [ ] Apple Sign In works (iOS only)
  - [ ] Apple button appears on iOS
  - [ ] Apple auth completes
  - [ ] Mobile verification required (if new user)
  - [ ] Login successful

## ✅ Testing - Profile

- [ ] Profile screen loads correctly
  - [ ] Avatar displays (or initials if no avatar)
  - [ ] Name displays
  - [ ] Username displays (or mobile if no username)
  - [ ] Mobile number displays with verification badge
  - [ ] All menu items work

- [ ] Edit profile works
  - [ ] Can navigate to account screen
  - [ ] All fields load correctly
  - [ ] Can edit username
  - [ ] Can edit full name
  - [ ] Can edit bio
  - [ ] Can add social media links
  - [ ] Character count works for bio
  - [ ] Form validation works
  - [ ] Save button works
  - [ ] Changes persist after save

- [ ] Avatar upload works
  - [ ] Can pick image from library
  - [ ] Permission request works
  - [ ] Image uploads successfully
  - [ ] Avatar updates in UI
  - [ ] Avatar persists after refresh

## ✅ Testing - Session Management

- [ ] Session persists on app restart
- [ ] Logout clears session completely
- [ ] Invalid token handled gracefully
- [ ] Expired token handled gracefully
- [ ] Refresh session works

## ✅ Testing - Error Handling

- [ ] Network errors handled
- [ ] Backend errors displayed to user
- [ ] Invalid input validated
- [ ] Loading states show correctly
- [ ] Error messages are user-friendly

## ✅ Testing - Guest State

- [ ] Guest state shows when not logged in
- [ ] Sign in button works
- [ ] Browse button works
- [ ] Protected screens redirect to login

## ✅ Update Other Screens

Check and update these screens if they use user data:

- [ ] Event registration screens
- [ ] Ticket screens
- [ ] Wallet screens
- [ ] Settings screens
- [ ] Any screen displaying user name/avatar
- [ ] Any screen using `getProfile()` from old API

### Update Pattern for Each Screen:

```typescript
// OLD
import { getProfile } from '../lib/api/profile';
import { useAuth } from '../context/AuthContext';
const { user, session } = useAuth();
const profile = await getProfile();

// NEW
import * as AuthAPI from '../lib/api/auth';
import { useAuth } from '../context/NewAuthContext';
const { user, accessToken } = useAuth();
const profile = await AuthAPI.getCurrentUser(accessToken);
```

## ✅ Cleanup (Optional)

- [ ] Remove old `AuthContext.tsx`
- [ ] Remove old `LoginScreen.tsx`
- [ ] Remove old `SignUpScreen.tsx`
- [ ] Remove old `ProfileScreen.tsx`
- [ ] Remove `src/config/supabase.ts` (if not used elsewhere)
- [ ] Remove Supabase dependencies from `package.json`
- [ ] Update imports in any remaining files

## ✅ Documentation

- [ ] Read `QUICK_START.md`
- [ ] Read `MIGRATION_GUIDE.md`
- [ ] Read `COMPLETE_INTEGRATION_SUMMARY.md`
- [ ] Understand new authentication flow
- [ ] Understand new user data structure

## ✅ Production Readiness

- [ ] Update `.env` to use production API URL
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Test on different screen sizes
- [ ] Test with slow network
- [ ] Test with no network
- [ ] Test edge cases (expired OTP, max attempts, etc.)
- [ ] Performance testing (app startup, login flow)
- [ ] Memory leak testing

## ✅ Deployment

- [ ] Build iOS app successfully
- [ ] Build Android app successfully
- [ ] Test iOS build on TestFlight
- [ ] Test Android build on internal testing
- [ ] Submit to App Store (if ready)
- [ ] Submit to Play Store (if ready)

## 📊 Progress Tracker

**Total Tasks:** 80+
**Completed:** ___
**In Progress:** ___
**Blocked:** ___

## 🎯 Priority Tasks

**Must Do First:**
1. Configure Google OAuth
2. Update root layout to use NewAuthContext
3. Update router configuration
4. Test email OTP flow
5. Test mobile OTP flow

**Do Next:**
6. Test Google OAuth
7. Test Apple Sign In
8. Test profile editing
9. Update other screens

**Do Last:**
10. Cleanup old code
11. Production testing
12. Deployment

## 🚨 Known Issues

Track any issues you encounter:

| Issue | Status | Notes |
|-------|--------|-------|
| | | |
| | | |

## 📝 Notes

Add any notes or observations here:

---

**Started:** ___________
**Completed:** ___________
**Time Taken:** ___________

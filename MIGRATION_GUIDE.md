# Mobile App API Migration Guide

## Overview

This guide documents the migration from Supabase-based authentication to the new mobile-number-centric backend API.

## What Changed

### Authentication System

**OLD (Supabase):**
- Email/password authentication
- Google OAuth via Supabase
- Apple Sign In via Supabase
- Session managed by Supabase client
- User data stored in Supabase Auth

**NEW (Custom Backend):**
- Mobile-number-centric identity (one person = one mobile number)
- Email OTP authentication
- Mobile OTP verification (via WhatsApp)
- Google OAuth with mobile verification
- Apple Sign In with mobile verification
- JWT-based session management
- User data in PostgreSQL via Prisma

### Authentication Flow

#### Email OTP Flow
1. User enters email
2. Backend sends 6-digit OTP to email
3. User enters OTP
4. If mobile not verified → Mobile verification required
5. User enters mobile number
6. Backend sends OTP via WhatsApp
7. User enters mobile OTP
8. Fully authenticated

#### Social Login Flow (Google/Apple)
1. User clicks Google/Apple button
2. OAuth flow completes
3. Backend checks if mobile verified
4. If not verified → Mobile verification required
5. User enters mobile number
6. Backend sends OTP via WhatsApp
7. User enters mobile OTP
8. Fully authenticated

## New Files Created

### 1. API Service Layer
**File:** `src/lib/api/auth.ts`

Complete API service for authentication:
- `loginWithGoogle(idToken)` - Google OAuth
- `loginWithApple(identityToken, authorizationCode)` - Apple Sign In
- `sendEmailOtp(email)` - Send email OTP
- `verifyEmailOtp(email, otp)` - Verify email OTP
- `sendMobileOtp(mobileNumber, tempToken)` - Send WhatsApp OTP
- `verifyMobileOtp(mobileNumber, otp, tempToken)` - Verify mobile OTP
- `getSession(accessToken)` - Get current session
- `logout(accessToken)` - Logout
- `getCurrentUser(accessToken)` - Get user profile
- `updateUserProfile(accessToken, data)` - Update profile
- `completeOnboarding(accessToken)` - Complete onboarding
- `uploadAvatar(accessToken, uri)` - Upload avatar
- `checkUsernameAvailability(username)` - Check username
- `getUserByUsername(username)` - Get user by username

### 2. New Auth Context
**File:** `src/context/NewAuthContext.tsx`

Replaces Supabase auth with custom backend:
- Manages JWT access tokens
- Handles temp tokens for mobile verification
- Integrates with OneSignal and Firebase Analytics
- Stores auth state in AsyncStorage
- Provides all authentication methods

### 3. New Login Screen
**File:** `src/screens/NewLoginScreen.tsx`

Multi-step login flow:
- Email entry
- Email OTP verification
- Mobile number entry (if required)
- Mobile OTP verification (via WhatsApp)
- Social login buttons (Google/Apple)

## Migration Steps

### Step 1: Update Environment Variables

Update `.env` file:
```env
# Backend API (already configured)
EXPO_PUBLIC_API_URL=http://localhost:8080  # Development
# EXPO_PUBLIC_API_URL=https://api.unifesto.app  # Production

# Google OAuth (need to add)
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your_expo_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
```

### Step 2: Install Dependencies

The app already has required dependencies:
- `@react-native-async-storage/async-storage` ✓
- `expo-auth-session` ✓
- `expo-apple-authentication` ✓
- `expo-web-browser` ✓

### Step 3: Replace Auth Context

**In `App.tsx` or root layout:**

```typescript
// OLD
import { AuthProvider } from './src/context/AuthContext';

// NEW
import { AuthProvider } from './src/context/NewAuthContext';
```

### Step 4: Update Login/Signup Routes

**In your router configuration:**

```typescript
// OLD
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';

// NEW
import NewLoginScreen from './src/screens/NewLoginScreen';
// Note: Signup is now part of login flow (email OTP)
```

### Step 5: Update API Calls

**OLD (Supabase):**
```typescript
import { supabase } from './config/supabase';

const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);
```

**NEW (Custom Backend):**
```typescript
import * as AuthAPI from './lib/api/auth';

const user = await AuthAPI.getCurrentUser(accessToken);
```

### Step 6: Update Profile Management

**OLD:**
```typescript
import { getProfile, updateProfile } from './lib/api/profile';

const profile = await getProfile();
await updateProfile({ name: 'New Name' });
```

**NEW:**
```typescript
import * as AuthAPI from './lib/api/auth';

const user = await AuthAPI.getCurrentUser(accessToken);
await AuthAPI.updateUserProfile(accessToken, { fullName: 'New Name' });
```

## API Endpoint Mapping

### Authentication

| Old (Supabase) | New (Backend) | Method |
|----------------|---------------|--------|
| `supabase.auth.signInWithPassword()` | `/auth/email` + `/auth/email/verify` | POST |
| `supabase.auth.signInWithOAuth({ provider: 'google' })` | `/auth/google` | POST |
| `supabase.auth.signInWithIdToken({ provider: 'apple' })` | `/auth/apple` | POST |
| `supabase.auth.getSession()` | `/auth/session` | GET |
| `supabase.auth.signOut()` | `/auth/logout` | POST |

### User Profile

| Old (Supabase) | New (Backend) | Method |
|----------------|---------------|--------|
| `supabase.from('profiles').select()` | `/users/me` | GET |
| `supabase.from('profiles').update()` | `/users/me` | PATCH |
| N/A | `/users/me/onboard` | POST |
| N/A | `/users/me/avatar` | POST |
| N/A | `/users/check-username` | POST |
| N/A | `/users/{username}` | GET |

## User Data Structure

### OLD (Supabase)
```typescript
interface Profile {
  id: string;
  name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  email?: string;
  phone?: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}
```

### NEW (Backend)
```typescript
interface User {
  id: string;
  mobileNumber: string;           // Primary identifier
  mobileVerified: boolean;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  isOnboarded: boolean;
  createdAt: string;
}
```

## Breaking Changes

### 1. No More Password Authentication
- Email/password login removed
- Replaced with email OTP

### 2. Mobile Number Required
- All users must verify mobile number
- Mobile number is primary identifier
- One mobile = one account

### 3. No More Email-Only Accounts
- Email is used for OTP delivery only
- Not stored as primary identifier

### 4. Session Management
- JWT tokens instead of Supabase sessions
- Tokens stored in AsyncStorage
- Manual token refresh required

### 5. Profile Fields Changed
- `name` → `fullName`
- `avatar_url` → `avatarUrl`
- `phone` → `mobileNumber` (required, verified)
- Added social media URLs
- Added `isOnboarded` flag

## Testing Checklist

### Email OTP Flow
- [ ] Send OTP to email
- [ ] Receive OTP in email
- [ ] Verify OTP successfully
- [ ] Handle invalid OTP
- [ ] Resend OTP works
- [ ] Mobile verification required

### Mobile OTP Flow
- [ ] Send OTP via WhatsApp
- [ ] Receive OTP on WhatsApp
- [ ] Verify OTP successfully
- [ ] Handle invalid OTP
- [ ] Resend OTP works
- [ ] Complete authentication

### Google OAuth
- [ ] Google login button works
- [ ] OAuth flow completes
- [ ] Mobile verification required (if not verified)
- [ ] Complete authentication

### Apple Sign In
- [ ] Apple button shows (iOS only)
- [ ] Apple login works
- [ ] Mobile verification required (if not verified)
- [ ] Complete authentication

### Session Management
- [ ] Token stored correctly
- [ ] Session persists on app restart
- [ ] Logout clears session
- [ ] Invalid token handled

### Profile Management
- [ ] Get current user works
- [ ] Update profile works
- [ ] Upload avatar works
- [ ] Username validation works

## Rollback Plan

If migration fails, you can rollback by:

1. Revert `App.tsx` to use old `AuthContext`
2. Revert router to use old login/signup screens
3. Keep old Supabase configuration
4. New files can remain (won't affect old code)

## Next Steps

1. **Configure Google OAuth**
   - Get OAuth client IDs from Google Console
   - Add to `.env` file
   - Update `NewAuthContext.tsx` with client IDs

2. **Test All Flows**
   - Test email OTP flow
   - Test mobile OTP flow
   - Test Google OAuth
   - Test Apple Sign In (iOS)

3. **Update Other Screens**
   - Profile screen
   - Settings screen
   - Any screen using user data

4. **Remove Old Code**
   - Remove old `AuthContext.tsx`
   - Remove old `LoginScreen.tsx`
   - Remove old `SignUpScreen.tsx`
   - Remove Supabase dependencies (optional)

## Support

For issues or questions:
- Check backend logs: `cd backend && npm run start:dev`
- Check mobile logs: `npx expo start`
- Review API documentation: `backend/docs/openapi.yaml`
- Review auth system docs: `backend/docs/AUTH_SYSTEM.md`

## Important Notes

1. **WhatsApp OTP**: Make sure WhatsApp Business API is configured in backend
2. **Email OTP**: Make sure Resend is configured in backend
3. **Google OAuth**: Requires Google Console setup
4. **Apple Sign In**: iOS only, requires Apple Developer account
5. **Mobile Number Format**: Always use E.164 format (+91XXXXXXXXXX)
6. **OTP Expiry**: OTPs expire in 10 minutes
7. **OTP Attempts**: Maximum 5 attempts per OTP

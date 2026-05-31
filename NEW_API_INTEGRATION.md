# New Backend API Integration - Summary

## What Was Done

I've integrated the new mobile-number-centric backend API into the mobile app. The new system replaces Supabase authentication with a custom backend that uses email OTP and mobile OTP verification.

## Files Created

### 1. **src/lib/api/auth.ts**
Complete API service layer for the new backend with all authentication endpoints:
- Google OAuth login
- Apple Sign In
- Email OTP (send & verify)
- Mobile OTP (send & verify via WhatsApp)
- Session management
- User profile operations
- Avatar upload
- Username availability check

### 2. **src/context/NewAuthContext.tsx**
New authentication context that:
- Manages JWT access tokens
- Handles temporary tokens for mobile verification
- Stores auth state in AsyncStorage
- Integrates with OneSignal and Firebase Analytics
- Provides all authentication methods
- Handles multi-step authentication flow

### 3. **src/screens/NewLoginScreen.tsx**
New login screen with multi-step flow:
- Step 1: Email entry
- Step 2: Email OTP verification
- Step 3: Mobile number entry (if verification required)
- Step 4: Mobile OTP verification (via WhatsApp)
- Social login buttons (Google/Apple)
- Resend OTP functionality
- Error handling

### 4. **MIGRATION_GUIDE.md**
Comprehensive migration guide with:
- Overview of changes
- Step-by-step migration instructions
- API endpoint mapping
- Breaking changes documentation
- Testing checklist
- Rollback plan

### 5. **NEW_API_INTEGRATION.md** (this file)
Summary of the integration work

## Key Differences from Old System

### Authentication Flow

**OLD (Supabase):**
```
User → Email/Password → Logged In
User → Google OAuth → Logged In
User → Apple Sign In → Logged In
```

**NEW (Custom Backend):**
```
User → Email → Email OTP → Mobile Number → WhatsApp OTP → Logged In
User → Google OAuth → Mobile Number → WhatsApp OTP → Logged In
User → Apple Sign In → Mobile Number → WhatsApp OTP → Logged In
```

### Mobile Number Requirement

The new system is **mobile-number-centric**:
- Every user MUST have a verified mobile number
- One mobile number = one account
- Mobile number is the primary identifier
- Email is used for OTP delivery only

### Session Management

**OLD:** Supabase manages sessions automatically
**NEW:** JWT tokens stored in AsyncStorage, manual management

## What Needs to Be Done Next

### 1. Configure Google OAuth (REQUIRED)

Get OAuth credentials from Google Cloud Console:
1. Go to https://console.cloud.google.com
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add client IDs to `.env`:

```env
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your_expo_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
```

6. Update `NewAuthContext.tsx` line 60-64 with these IDs

### 2. Switch to New Auth System

**In your root layout file (e.g., `app/_layout.tsx` or `App.tsx`):**

```typescript
// OLD
import { AuthProvider } from './src/context/AuthContext';

// NEW
import { AuthProvider } from './src/context/NewAuthContext';
```

**In your router configuration:**

```typescript
// OLD
import LoginScreen from './src/screens/LoginScreen';

// NEW
import NewLoginScreen from './src/screens/NewLoginScreen';
```

### 3. Update API Base URL

For development, update `.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:8080
```

For production:
```env
EXPO_PUBLIC_API_URL=https://api.unifesto.app
```

### 4. Test All Flows

Run the app and test:
- [ ] Email OTP login
- [ ] Mobile OTP verification
- [ ] Google OAuth (after configuring)
- [ ] Apple Sign In (iOS only)
- [ ] Session persistence
- [ ] Logout

### 5. Update Other Screens

Update any screens that use user data:

**OLD:**
```typescript
import { getProfile } from '../lib/api/profile';

const profile = await getProfile();
console.log(profile.name); // OLD field
```

**NEW:**
```typescript
import * as AuthAPI from '../lib/api/auth';
import { useAuth } from '../context/NewAuthContext';

const { accessToken } = useAuth();
const user = await AuthAPI.getCurrentUser(accessToken);
console.log(user.fullName); // NEW field
```

### 6. Update Profile Screens

User data structure changed:

**OLD fields:**
- `name` → `fullName`
- `avatar_url` → `avatarUrl`
- `phone` → `mobileNumber`

**NEW fields added:**
- `linkedinUrl`
- `instagramUrl`
- `githubUrl`
- `websiteUrl`
- `isOnboarded`
- `mobileVerified`

### 7. Remove Old Code (Optional)

Once everything works, you can remove:
- `src/context/AuthContext.tsx` (old)
- `src/screens/LoginScreen.tsx` (old)
- `src/screens/SignUpScreen.tsx` (old)
- `src/config/supabase.ts` (if not used elsewhere)
- Supabase dependencies from `package.json`

## Backend Requirements

Make sure the backend is running and configured:

### 1. Backend Running
```bash
cd backend
npm run start:dev
```

Backend should be running on `http://localhost:8080`

### 2. Email Service (Resend)
Check `backend/.env`:
```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=no-reply@notify.unifesto.app
```

### 3. WhatsApp Service (Meta Business API)
Check `backend/.env`:
```env
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=1064159243455469
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### 4. Google OAuth
Check `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 5. Apple Sign In
Check `backend/.env`:
```env
APPLE_CLIENT_ID=com.unifesto.app
APPLE_TEAM_ID=9AH3Z5C5DH
APPLE_KEY_ID=XJN24KA694
APPLE_PRIVATE_KEY=your_private_key
```

## Testing the Integration

### Test Email OTP Flow

1. Start backend: `cd backend && npm run start:dev`
2. Start mobile app: `cd mobile-apps/discover && npx expo start`
3. Open app on device/simulator
4. Click "Login"
5. Enter email address
6. Click "Send OTP"
7. Check email for OTP
8. Enter OTP
9. Should prompt for mobile number
10. Enter mobile number (+91XXXXXXXXXX)
11. Click "Send OTP"
12. Check WhatsApp for OTP
13. Enter OTP
14. Should be logged in

### Test Google OAuth

1. Configure Google OAuth (see step 1 above)
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Should prompt for mobile number
5. Enter mobile number
6. Verify mobile OTP
7. Should be logged in

### Test Apple Sign In (iOS only)

1. Make sure Apple Sign In is configured in backend
2. Click "Sign in with Apple"
3. Complete Apple authentication
4. Should prompt for mobile number
5. Enter mobile number
6. Verify mobile OTP
7. Should be logged in

## API Endpoints Reference

### Authentication
- `POST /auth/google` - Google OAuth
- `POST /auth/apple` - Apple Sign In
- `POST /auth/email` - Send email OTP
- `POST /auth/email/verify` - Verify email OTP
- `POST /auth/mobile/send-otp` - Send WhatsApp OTP
- `POST /auth/verify-mobile` - Verify mobile OTP
- `GET /auth/session` - Get current session
- `POST /auth/logout` - Logout

### User Profile
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update profile
- `POST /users/me/onboard` - Complete onboarding
- `POST /users/me/avatar` - Upload avatar
- `POST /users/check-username` - Check username availability
- `GET /users/{username}` - Get user by username

### Roles (if needed)
- `GET /roles` - Get all roles
- `GET /roles/users/{userId}` - Get user roles
- `POST /roles/assign` - Assign role
- `DELETE /roles/{userRoleId}` - Remove role
- `GET /roles/check/{userId}/{roleCode}` - Check if user has role

## Troubleshooting

### "Failed to send OTP"
- Check backend is running
- Check Resend API key is configured
- Check WhatsApp credentials are configured

### "Invalid OTP"
- OTPs expire in 10 minutes
- Maximum 5 attempts per OTP
- Check backend logs for errors

### "Google login failed"
- Make sure Google OAuth is configured in backend
- Make sure Google client IDs are added to mobile app
- Check redirect URIs in Google Console

### "Apple login failed"
- iOS only feature
- Make sure Apple Sign In is configured in backend
- Check Apple credentials in backend `.env`

### "Session invalid"
- Token might be expired
- Try logging out and logging in again
- Check backend JWT configuration

## Architecture Overview

```
Mobile App (React Native + Expo)
    ↓
NewAuthContext (JWT token management)
    ↓
API Service Layer (src/lib/api/auth.ts)
    ↓
Backend API (NestJS)
    ↓
PostgreSQL (via Prisma)
```

## Security Notes

1. **JWT Tokens**: Stored in AsyncStorage (secure on device)
2. **OTP Delivery**: Email via Resend, Mobile via WhatsApp
3. **OTP Expiry**: 10 minutes
4. **OTP Attempts**: Maximum 5 attempts
5. **Mobile Verification**: Required for all users
6. **One Mobile = One Account**: Prevents duplicate accounts

## Support

For issues:
1. Check backend logs: `cd backend && npm run start:dev`
2. Check mobile logs: `npx expo start`
3. Review API docs: `backend/docs/openapi.yaml`
4. Review auth docs: `backend/docs/AUTH_SYSTEM.md`
5. Review this migration guide: `MIGRATION_GUIDE.md`

## Summary

✅ **Created**: New API service layer
✅ **Created**: New authentication context
✅ **Created**: New login screen with OTP flows
✅ **Created**: Comprehensive migration guide
✅ **Ready**: Backend API integration

🔧 **TODO**: Configure Google OAuth client IDs
🔧 **TODO**: Switch to new auth system in app
🔧 **TODO**: Test all authentication flows
🔧 **TODO**: Update other screens to use new API
🔧 **TODO**: Remove old Supabase code

The integration is complete and ready to use. Follow the "What Needs to Be Done Next" section to activate the new system.

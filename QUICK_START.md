# Quick Start Guide - New API Integration

## 🚀 Get Started in 5 Steps

### Step 1: Configure Google OAuth (5 minutes)

1. Go to https://console.cloud.google.com
2. Select your project or create new one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Copy client IDs to `.env`:

```env
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your_expo_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
```

6. Update `src/context/NewAuthContext.tsx` line 60-64 with env variables

### Step 2: Switch to New Auth (2 minutes)

**Find your root layout** (e.g., `app/_layout.tsx`):

```typescript
// Change this line:
import { AuthProvider } from './src/context/AuthContext';

// To this:
import { AuthProvider } from './src/context/NewAuthContext';
```

### Step 3: Update Routes (3 minutes)

**Update your router configuration:**

```typescript
// OLD routes
'/login' → LoginScreen
'/signup' → SignUpScreen
'/profile' → ProfileScreen

// NEW routes
'/login' → NewLoginScreen
// No /signup needed (part of login flow)
'/profile' → NewProfileScreen
'/account' → NewAccountScreen (new)
```

### Step 4: Set API URL (1 minute)

Update `.env`:
```env
# For development
EXPO_PUBLIC_API_URL=http://localhost:8080

# For production
# EXPO_PUBLIC_API_URL=https://api.unifesto.app
```

### Step 5: Test (10 minutes)

Start backend:
```bash
cd backend
npm run start:dev
```

Start mobile app:
```bash
cd mobile-apps/discover
npx expo start
```

Test the flow:
1. Open app
2. Click "Sign In"
3. Enter email
4. Enter OTP from email
5. Enter mobile number
6. Enter OTP from WhatsApp
7. You're logged in!

## 📁 Files Created

```
src/
├── lib/api/
│   └── auth.ts                    ← API service layer
├── context/
│   └── NewAuthContext.tsx         ← Auth context
└── screens/
    ├── NewLoginScreen.tsx         ← Login with OTP
    ├── NewProfileScreen.tsx       ← Profile view
    └── NewAccountScreen.tsx       ← Edit profile

Documentation:
├── MIGRATION_GUIDE.md             ← Detailed migration guide
├── NEW_API_INTEGRATION.md         ← Integration overview
├── COMPLETE_INTEGRATION_SUMMARY.md ← Complete summary
└── QUICK_START.md                 ← This file
```

## 🔑 Key Differences

| Feature | OLD (Supabase) | NEW (Backend) |
|---------|----------------|---------------|
| Login | Email + Password | Email OTP |
| Signup | Separate screen | Part of login |
| Mobile | Optional | Required, verified |
| Session | Supabase manages | JWT in AsyncStorage |
| Primary ID | Email | Mobile number |

## 🎯 Quick API Reference

```typescript
import * as AuthAPI from '../lib/api/auth';
import { useAuth } from '../context/NewAuthContext';

// In your component
const { user, accessToken } = useAuth();

// Get current user
const user = await AuthAPI.getCurrentUser(accessToken);

// Update profile
await AuthAPI.updateUserProfile(accessToken, {
  fullName: 'New Name',
  bio: 'My bio',
});

// Upload avatar
await AuthAPI.uploadAvatar(accessToken, imageUri);

// Check username
const { available } = await AuthAPI.checkUsernameAvailability('username');
```

## ⚠️ Common Issues

### "Failed to send OTP"
- Check backend is running on port 8080
- Check Resend API key in backend `.env`
- Check WhatsApp credentials in backend `.env`

### "Google login failed"
- Make sure client IDs are in mobile `.env`
- Make sure Google OAuth is configured in backend
- Check redirect URIs in Google Console

### "Session invalid"
- Token might be expired
- Try logout and login again
- Check backend JWT configuration

### "Avatar upload failed"
- Check file size (max 5MB)
- Check file format (jpg, png, webp)
- Check backend storage configuration

## 📱 User Data Changes

```typescript
// OLD
profile.name          → profile.fullName
profile.avatar_url    → profile.avatarUrl
profile.phone         → profile.mobileNumber
profile.email         → Not stored (email used for OTP only)

// NEW fields
profile.linkedinUrl
profile.instagramUrl
profile.githubUrl
profile.websiteUrl
profile.isOnboarded
profile.mobileVerified
```

## 🧪 Test Checklist

Quick test:
- [ ] Email OTP login works
- [ ] Mobile OTP verification works
- [ ] Profile displays correctly
- [ ] Edit profile works
- [ ] Avatar upload works
- [ ] Logout works

Full test:
- [ ] Google OAuth works
- [ ] Apple Sign In works (iOS)
- [ ] Session persists on restart
- [ ] Resend OTP works
- [ ] Form validation works
- [ ] Error handling works

## 🆘 Need Help?

1. **Backend not working?**
   - Check `backend/docs/AUTH_SYSTEM.md`
   - Check `backend/docs/openapi.yaml`

2. **Mobile app issues?**
   - Check `MIGRATION_GUIDE.md`
   - Check `COMPLETE_INTEGRATION_SUMMARY.md`

3. **API questions?**
   - Check `src/lib/api/auth.ts` for all available methods
   - Check backend OpenAPI spec

## ✅ You're Done!

Once you complete the 5 steps above, your app will be using the new backend API with:
- ✨ Email OTP authentication
- ✨ WhatsApp mobile verification
- ✨ Google & Apple Sign In
- ✨ Complete profile management
- ✨ Avatar upload
- ✨ Social media links

Happy coding! 🎉

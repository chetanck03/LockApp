# Parental Control System - Setup Instructions

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL (Neon cloud account)
- Firebase project with FCM enabled
- Android Studio
- React Native CLI
- ADB (Android Debug Bridge)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `JWT_SECRET`: Generate a secure random string
- `FIREBASE_PROJECT_ID`: From Firebase Console
- `FIREBASE_PRIVATE_KEY`: From Firebase service account JSON
- `FIREBASE_CLIENT_EMAIL`: From Firebase service account JSON

### 3. Database Migration

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start Backend

```bash
npm run dev
```

Backend runs on `http://localhost:3000`

## Parent App Setup

### 1. Install Dependencies

```bash
cd parent-app
npm install
```

### 2. Configure API URL

Edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-backend-url.com';
```

### 3. Run on Android

```bash
npx react-native run-android
```

### 4. Run on iOS

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

## Child App Setup

### 1. Install Dependencies

```bash
cd child-app
npm install
```

### 2. Add Firebase Configuration

Download `google-services.json` from Firebase Console and place in:
```
child-app/android/app/google-services.json
```

### 3. Update API URL

Edit `android/app/src/main/java/com/childapp/PolicyService.kt`:
```kotlin
private const val API_BASE_URL = "https://your-backend-url.com"
```

### 4. Build APK

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Device Owner Provisioning

### Method 1: ADB Command (Factory Reset Device First)

1. Factory reset the Android device
2. Skip all setup steps (don't add Google account)
3. Enable USB debugging
4. Connect device via USB
5. Run:

```bash
adb shell dpm set-device-owner com.childapp/.DeviceAdminReceiver
```

Expected output:
```
Success: Device owner set to package com.childapp
```

### Method 2: QR Code Provisioning

1. Factory reset device
2. On setup screen, tap 6 times on welcome screen
3. Connect to WiFi
4. Scan QR code generated from `provisioning.json`
5. App will auto-install and provision

Generate QR code:
```bash
# Use online QR generator with provisioning.json content
# Or use: https://qr.io/
```

### Method 3: NFC Provisioning

1. Create NFC tag with provisioning data
2. Factory reset device
3. Tap NFC tag during setup
4. Follow on-screen instructions

## Verification

### Check Device Owner Status

```bash
adb shell dpm list-owners
```

Should show:
```
Device Owner:
  admin=ComponentInfo{com.childapp/com.childapp.DeviceAdminReceiver}
```

### Test Commands

In parent app:
1. Register parent account
2. Add child device (use FCM token from child device logs)
3. Try lock device command
4. Try block/unblock app
5. Try kiosk mode

## Firebase Setup

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create new project
3. Add Android app with package name: `com.childapp`
4. Download `google-services.json`

### 2. Enable FCM

1. In Firebase Console, go to Project Settings
2. Cloud Messaging tab
3. Note the Server Key (for backend)

### 3. Service Account

1. Project Settings > Service Accounts
2. Generate new private key
3. Use credentials in backend `.env`

## Database Schema

Prisma will create these tables:
- `User`: Parent accounts
- `Device`: Child devices
- `Policy`: Commands/policies
- `Log`: Action logs

## Security Notes

1. Always use HTTPS in production
2. Rotate JWT secrets regularly
3. Validate all API inputs
4. Use strong passwords
5. Enable rate limiting
6. Monitor device owner status
7. Implement device binding validation

## Troubleshooting

### Device Owner Not Set

- Ensure device is factory reset
- No Google accounts added
- USB debugging enabled
- ADB authorized

### FCM Not Working

- Check `google-services.json` placement
- Verify Firebase project configuration
- Check internet connectivity
- Review FCM token in logs

### Commands Not Executing

- Verify device owner status
- Check FCM token validity
- Review backend logs
- Check device connectivity

### Build Errors

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## Production Deployment

### Backend

1. Deploy to cloud provider (Heroku, AWS, GCP)
2. Use environment variables
3. Enable HTTPS
4. Set up monitoring
5. Configure CORS properly

### Database

1. Use Neon production tier
2. Enable connection pooling
3. Set up backups
4. Monitor performance

### Apps

1. Sign APKs with release keystore
2. Upload to Google Play Console
3. Enable ProGuard
4. Test on multiple devices
5. Implement crash reporting

## Support

For issues:
1. Check logs: `adb logcat | grep ChildApp`
2. Review backend logs
3. Verify network connectivity
4. Check device owner status

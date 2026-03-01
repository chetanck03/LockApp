# Android Parental Control System

Production-ready parental control system with React Native parent app, Android child app with Device Owner mode, Node.js backend, and PostgreSQL database.

## System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Parent App    │────────▶│   Backend API    │────────▶│   PostgreSQL    │
│ (React Native)  │  HTTPS  │  (Node.js)       │         │   (Neon)        │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     │ FCM
                                     ▼
                            ┌──────────────────┐
                            │   Child Device   │
                            │ (Android Native) │
                            │  Device Owner    │
                            └──────────────────┘
```

## Features

### Parent App
- User authentication (register/login)
- Device management dashboard
- Real-time device status
- Remote device locking
- App blocking/unblocking
- Kiosk mode control
- Screen time limits
- Activity logs

### Child App
- Device Owner mode
- FCM push notifications
- Background policy service
- App management
- Device locking
- Kiosk mode
- Uninstall protection

### Backend
- RESTful API
- JWT authentication
- PostgreSQL database
- FCM integration
- Command queue system
- Action logging

## Tech Stack

- **Frontend**: React Native 0.73.4
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Neon)
- **Push**: Firebase Cloud Messaging
- **Android**: Kotlin + DevicePolicyManager
- **Auth**: JWT

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 2. Parent App Setup

```bash
cd parent-app
npm install
# Update API_BASE_URL in src/services/api.js
npx react-native run-android
```

### 3. Child App Setup

```bash
cd child-app
npm install
# Add google-services.json to android/app/
npx react-native run-android
```

### 4. Provision Device Owner

```bash
# Factory reset device first
adb shell dpm set-device-owner com.childapp/.DeviceAdminReceiver
```

## Documentation

- [Setup Instructions](SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [Provisioning Guide](PROVISIONING_GUIDE.md) - Device Owner setup
- [Deployment Notes](DEPLOYMENT_NOTES.md) - Production deployment
- [Backend README](backend/README.md) - API documentation

## Project Structure

```
parental-control-system/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database & Firebase config
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & validation
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   └── prisma/             # Database schema
├── parent-app/             # React Native parent app
│   └── src/
│       ├── screens/        # UI screens
│       ├── components/     # Reusable components
│       ├── services/       # API & storage
│       ├── store/          # State management
│       └── navigation/     # Navigation config
└── child-app/              # React Native + Android native
    ├── android/
    │   └── app/src/main/java/com/childapp/
    │       ├── DeviceAdminModule.kt
    │       ├── DeviceAdminReceiver.kt
    │       ├── PolicyService.kt
    │       └── FCMService.kt
    └── src/                # React Native UI
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register parent account
- `POST /auth/login` - Login

### Devices
- `POST /devices/register` - Register child device
- `GET /devices` - List devices
- `GET /devices/:id/status` - Get device status
- `POST /devices/:id/command` - Send command
- `GET /devices/:id/apps` - Get installed apps
- `GET /devices/:id/logs` - Get activity logs

### Commands
- `LOCK_DEVICE` - Lock device immediately
- `UNLOCK_DEVICE` - Unlock device
- `BLOCK_APP` - Hide/block app
- `UNBLOCK_APP` - Show/unblock app
- `ENABLE_KIOSK` - Enable kiosk mode
- `DISABLE_KIOSK` - Disable kiosk mode
- `SET_SCREEN_TIME` - Set screen time limit
- `GET_INSTALLED_APPS` - Fetch app list

## Device Owner Provisioning

### ADB Method (Testing)
```bash
# Factory reset device
# Skip Google account setup
adb install child-app.apk
adb shell dpm set-device-owner com.childapp/.DeviceAdminReceiver
```

### QR Code Method (Production)
1. Generate QR from provisioning.json
2. Factory reset device
3. Tap welcome screen 6 times
4. Scan QR code
5. App auto-installs and provisions

## Security Features

- HTTPS only
- JWT authentication
- Device binding
- FCM token validation
- Command origin verification
- Uninstall protection
- Factory reset protection

## Requirements

- Node.js 18+
- PostgreSQL (Neon)
- Firebase project
- Android Studio
- React Native CLI
- ADB tools

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

### Parent App
```
API_BASE_URL=https://your-backend.com
```

### Child App
- google-services.json (Firebase)
- API_BASE_URL in PolicyService.kt

## Testing

### Backend
```bash
cd backend
npm test
```

### Parent App
```bash
cd parent-app
npm test
```

### Child App
```bash
cd child-app
npm test
```

## Deployment

### Backend
- Deploy to Heroku, Railway, AWS, or GCP
- Use Neon for PostgreSQL
- Enable HTTPS
- Set environment variables

### Parent App
- Build for iOS: Archive in Xcode
- Build for Android: `./gradlew bundleRelease`
- Submit to App Store / Play Store

### Child App
- Build release APK: `./gradlew assembleRelease`
- Sign APK with release keystore
- Host on secure server or Play Store

## Troubleshooting

### Device Owner Not Set
- Ensure factory reset
- No Google accounts added
- USB debugging enabled

### FCM Not Working
- Check google-services.json
- Verify Firebase config
- Check internet connectivity

### Commands Not Executing
- Verify device owner status
- Check FCM token
- Review backend logs

## License

MIT

## Support

For issues and questions:
1. Check documentation
2. Review logs: `adb logcat | grep ChildApp`
3. Verify device owner: `adb shell dpm list-owners`
4. Check backend logs
5. Test network connectivity

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## Roadmap

- [ ] iOS child app support
- [ ] Web dashboard
- [ ] Location tracking
- [ ] Usage analytics
- [ ] Content filtering
- [ ] Time schedules
- [ ] Multiple parent accounts
- [ ] Device groups
- [ ] Geofencing
- [ ] Emergency alerts

## Credits

Built with:
- React Native
- Node.js + Express
- PostgreSQL + Prisma
- Firebase Cloud Messaging
- Android DevicePolicyManager

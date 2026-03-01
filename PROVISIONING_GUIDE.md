# Device Owner Provisioning Guide

## Overview

Device Owner mode gives the app full control over the Android device. This is required for parental control features like app blocking, device locking, and kiosk mode.

## Prerequisites

- Factory reset Android device (mandatory)
- Android 5.0+ (API 21+)
- USB cable and ADB installed
- Child app APK built

## Method 1: ADB Provisioning (Recommended for Testing)

### Step 1: Prepare Device

1. Factory reset the device:
   - Settings > System > Reset > Factory data reset
   - Or hold Power + Volume Down during boot

2. Complete initial setup:
   - Select language
   - Connect to WiFi
   - **IMPORTANT**: Skip Google account setup
   - Skip all optional steps
   - Do NOT add any accounts

3. Enable Developer Options:
   - Settings > About phone
   - Tap "Build number" 7 times

4. Enable USB Debugging:
   - Settings > Developer options
   - Enable "USB debugging"

### Step 2: Install App

```bash
# Connect device via USB
adb devices

# Install the APK
adb install child-app/android/app/build/outputs/apk/release/app-release.apk
```

### Step 3: Set Device Owner

```bash
# Set as device owner
adb shell dpm set-device-owner com.childapp/.DeviceAdminReceiver
```

Expected output:
```
Success: Device owner set to package com.childapp
Active admin set to component {com.childapp/com.childapp.DeviceAdminReceiver}
```

### Step 4: Verify

```bash
# Check device owner status
adb shell dpm list-owners

# Should output:
# Device Owner:
#   admin=ComponentInfo{com.childapp/com.childapp.DeviceAdminReceiver}
```

### Step 5: Launch App

```bash
adb shell am start -n com.childapp/.MainActivity
```

## Method 2: QR Code Provisioning (Production)

### Step 1: Generate QR Code

1. Edit `provisioning.json` with your values:
```json
{
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.childapp/.DeviceAdminReceiver",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://your-server.com/child-app.apk",
  "android.app.extra.PROVISIONING_SKIP_ENCRYPTION": true,
  "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true
}
```

2. Generate QR code from JSON:
   - Use https://qr.io/ or similar
   - Or use: `qrencode -o qr.png < provisioning.json`

### Step 2: Provision Device

1. Factory reset device
2. On welcome screen, tap 6 times quickly
3. Connect to WiFi when prompted
4. Scan the QR code
5. App downloads and installs automatically
6. Device owner is set automatically

## Method 3: NFC Provisioning

### Step 1: Prepare NFC Tag

1. Install NFC Tools app on another device
2. Write provisioning.json data to NFC tag
3. Set MIME type: `application/com.android.managedprovisioning`

### Step 2: Provision

1. Factory reset target device
2. On welcome screen, tap NFC tag
3. Follow on-screen instructions
4. App installs and provisions automatically

## Method 4: Zero-Touch Enrollment (Enterprise)

For large deployments:

1. Enroll in Android Zero-Touch
2. Configure device policy
3. Add app to policy
4. Devices auto-provision on first boot

## Troubleshooting

### Error: "Not allowed to set the device owner"

**Cause**: Device has accounts or is already set up

**Solution**:
```bash
# Remove all accounts
adb shell pm list users
adb shell pm remove-user <user-id>

# Or factory reset
```

### Error: "Device owner is already set"

**Cause**: Another app is device owner

**Solution**:
```bash
# Remove existing device owner
adb shell dpm remove-active-admin <component-name>

# Then set yours
adb shell dpm set-device-owner com.childapp/.DeviceAdminReceiver
```

### Error: "java.lang.IllegalStateException"

**Cause**: Google account added during setup

**Solution**:
- Factory reset
- Skip Google account during setup
- Try again

### QR Code Not Scanning

**Cause**: Wrong format or device not in provisioning mode

**Solution**:
- Verify JSON format
- Ensure 6 taps on welcome screen
- Check WiFi connectivity
- Try regenerating QR code

### App Not Installing via QR

**Cause**: APK URL not accessible

**Solution**:
- Verify APK URL is publicly accessible
- Check HTTPS certificate
- Test URL in browser
- Ensure APK is signed

## Verification Commands

```bash
# Check device owner
adb shell dpm list-owners

# Check admin status
adb shell dumpsys device_policy

# List installed packages
adb shell pm list packages | grep childapp

# Check app permissions
adb shell dumpsys package com.childapp

# View logs
adb logcat | grep -E "DeviceAdmin|ChildApp"
```

## Removing Device Owner (For Testing)

```bash
# Remove device owner
adb shell dpm remove-active-admin com.childapp/.DeviceAdminReceiver

# Uninstall app
adb uninstall com.childapp

# Factory reset
adb shell am broadcast -a android.intent.action.MASTER_CLEAR
```

## Production Checklist

- [ ] APK signed with release keystore
- [ ] APK hosted on HTTPS server
- [ ] provisioning.json updated with production URLs
- [ ] QR codes generated and tested
- [ ] Device owner verification tested
- [ ] Uninstall blocking enabled
- [ ] Factory reset protection configured
- [ ] User documentation prepared
- [ ] Support process established

## Security Considerations

1. **Device Owner Privileges**:
   - Full device control
   - Cannot be uninstalled by user
   - Survives factory reset (if configured)

2. **Provisioning Security**:
   - Only during initial setup
   - Requires physical access
   - Cannot be done remotely

3. **Best Practices**:
   - Use signed APKs only
   - Secure APK download URL
   - Validate provisioning source
   - Monitor device owner status
   - Implement remote wipe capability

## Support Matrix

| Android Version | ADB | QR Code | NFC | Zero-Touch |
|----------------|-----|---------|-----|------------|
| 5.0 - 6.0      | ✓   | ✗       | ✗   | ✗          |
| 7.0 - 8.1      | ✓   | ✓       | ✓   | ✗          |
| 9.0+           | ✓   | ✓       | ✓   | ✓          |

## Additional Resources

- [Android Device Administration](https://developer.android.com/guide/topics/admin/device-admin)
- [Managed Provisioning](https://developers.google.com/android/work/requirements/provision-device)
- [Device Owner Mode](https://source.android.com/devices/tech/admin/provision)

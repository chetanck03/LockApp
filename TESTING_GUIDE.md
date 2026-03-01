# Testing Guide

## Backend Testing

### Unit Tests

```bash
cd backend
npm test
```

### Manual API Testing

#### 1. Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "password123"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "password123"
  }'
```

Save the token from response.

#### 3. Register Device
```bash
curl -X POST http://localhost:3000/devices/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "device_name": "Test Device",
    "fcm_token": "test_fcm_token",
    "android_version": "13"
  }'
```

#### 4. Send Command
```bash
curl -X POST http://localhost:3000/devices/DEVICE_ID/command \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "command_type": "LOCK_DEVICE",
    "payload": {}
  }'
```

#### 5. Get Device Status
```bash
curl -X GET http://localhost:3000/devices/DEVICE_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Testing

```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt

# Query users
SELECT * FROM "User";

# Query devices
SELECT * FROM "Device";

# Query policies
SELECT * FROM "Policy";

# Query logs
SELECT * FROM "Log";
```

## Parent App Testing

### 1. Authentication Flow

1. Launch app
2. Tap "Register"
3. Enter email and password
4. Verify registration success
5. Logout
6. Login with same credentials
7. Verify dashboard loads

### 2. Device Management

1. Add test device manually in database
2. Pull to refresh device list
3. Tap on device card
4. Verify device details load

### 3. Commands

1. Tap "Lock Device"
2. Verify success message
3. Check backend logs for command
4. Tap "Manage Apps"
5. Toggle app block/unblock
6. Verify command sent

### 4. Error Handling

1. Turn off internet
2. Try sending command
3. Verify error message
4. Turn on internet
5. Retry command

## Child App Testing

### 1. Device Owner Setup

```bash
# Factory reset device
adb reboot recovery

# Install app
adb install child-app.apk

# Set device owner
adb shell dpm set-device-owner com.childapp/.DeviceAdminReceiver

# Verify
adb shell dpm list-owners
```

### 2. FCM Testing

1. Launch child app
2. Check logs for FCM token:
```bash
adb logcat | grep FCM
```
3. Copy token
4. Register device with token
5. Send test command from parent app
6. Verify command received in logs

### 3. Lock Device

1. Send LOCK_DEVICE command
2. Verify device locks immediately
3. Unlock with PIN/pattern
4. Check logs:
```bash
adb logcat | grep DeviceAdmin
```

### 4. Block App

1. Install test app (e.g., Chrome)
2. Send BLOCK_APP command with package name
3. Verify app disappears from launcher
4. Send UNBLOCK_APP command
5. Verify app reappears

### 5. Kiosk Mode

1. Send ENABLE_KIOSK command with package name
2. Verify device enters kiosk mode
3. Try exiting (should be blocked)
4. Send DISABLE_KIOSK command
5. Verify normal mode restored

### 6. Get Installed Apps

1. Send GET_INSTALLED_APPS command
2. Check backend logs for app list
3. Verify non-system apps listed

## Integration Testing

### End-to-End Flow

1. **Setup**
   - Start backend
   - Launch parent app
   - Provision child device

2. **Register Parent**
   - Create account in parent app
   - Verify JWT token saved
   - Verify user in database

3. **Register Child Device**
   - Get FCM token from child app
   - Register device via parent app
   - Verify device in database

4. **Send Commands**
   - Lock device
   - Block app
   - Enable kiosk mode
   - Set screen time

5. **Verify Execution**
   - Check device behavior
   - Check policy status in database
   - Check logs in database

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Create test script
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
    - post:
        url: "/auth/login"
        json:
          email: "test@example.com"
          password: "password123"
EOF

# Run test
artillery run load-test.yml
```

## Security Testing

### 1. JWT Validation

```bash
# Try accessing without token
curl -X GET http://localhost:3000/devices

# Try with invalid token
curl -X GET http://localhost:3000/devices \
  -H "Authorization: Bearer invalid_token"

# Try with expired token
# (Generate expired token and test)
```

### 2. SQL Injection

```bash
# Try SQL injection in email
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com OR 1=1--",
    "password": "password"
  }'
```

### 3. XSS Testing

```bash
# Try XSS in device name
curl -X POST http://localhost:3000/devices/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "device_name": "<script>alert(1)</script>",
    "fcm_token": "test"
  }'
```

### 4. Rate Limiting

```bash
# Send multiple requests rapidly
for i in {1..100}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"pass"}'
done
```

## Performance Testing

### Backend Response Times

```bash
# Test endpoint performance
ab -n 1000 -c 10 http://localhost:3000/health
```

### Database Query Performance

```sql
-- Explain query plans
EXPLAIN ANALYZE SELECT * FROM "Device" WHERE user_id = 'uuid';

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### App Performance

1. Use React Native Debugger
2. Enable Performance Monitor
3. Check FPS during navigation
4. Monitor memory usage
5. Profile with Flipper

## Automated Testing

### Backend Tests

```javascript
// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../src/index');

describe('Auth Endpoints', () => {
  test('POST /auth/register', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /auth/login', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
```

### React Native Tests

```javascript
// parent-app/__tests__/LoginScreen.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../src/screens/LoginScreen';

describe('LoginScreen', () => {
  test('renders correctly', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  test('handles login', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));
    
    // Add assertions
  });
});
```

## Test Checklist

### Backend
- [ ] User registration
- [ ] User login
- [ ] JWT validation
- [ ] Device registration
- [ ] Command sending
- [ ] FCM integration
- [ ] Database queries
- [ ] Error handling
- [ ] Input validation
- [ ] Rate limiting

### Parent App
- [ ] Authentication flow
- [ ] Device list
- [ ] Device details
- [ ] Command buttons
- [ ] App list
- [ ] Error messages
- [ ] Loading states
- [ ] Navigation
- [ ] Offline handling
- [ ] Token refresh

### Child App
- [ ] Device owner check
- [ ] FCM token generation
- [ ] Command reception
- [ ] Lock device
- [ ] Block/unblock apps
- [ ] Kiosk mode
- [ ] Background service
- [ ] Policy execution
- [ ] Status reporting
- [ ] Error handling

### Integration
- [ ] End-to-end flow
- [ ] Command delivery
- [ ] Status updates
- [ ] Real-time sync
- [ ] Multiple devices
- [ ] Concurrent commands
- [ ] Network failures
- [ ] Device offline/online

## Debugging

### Backend Logs

```bash
# View all logs
tail -f logs/combined.log

# View errors only
tail -f logs/error.log

# Filter by device
grep "device_id" logs/combined.log
```

### Android Logs

```bash
# All logs
adb logcat

# Filter by tag
adb logcat | grep DeviceAdmin

# Filter by package
adb logcat | grep com.childapp

# Clear logs
adb logcat -c
```

### Network Debugging

```bash
# Monitor network traffic
adb shell tcpdump -i any -s 0 -w /sdcard/capture.pcap

# Pull capture file
adb pull /sdcard/capture.pcap

# Analyze with Wireshark
wireshark capture.pcap
```

## Common Issues

### Issue: Commands not executing
**Debug**:
```bash
# Check device owner
adb shell dpm list-owners

# Check FCM token
adb logcat | grep FCM

# Check network
adb shell ping 8.8.8.8

# Check app logs
adb logcat | grep ChildApp
```

### Issue: App crashes
**Debug**:
```bash
# Get crash logs
adb logcat | grep AndroidRuntime

# Get stack trace
adb logcat | grep -A 50 "FATAL EXCEPTION"
```

### Issue: Database errors
**Debug**:
```sql
-- Check connections
SELECT * FROM pg_stat_activity;

-- Check locks
SELECT * FROM pg_locks;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public';
```

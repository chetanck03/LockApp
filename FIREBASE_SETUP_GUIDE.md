# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "parental-control-system")
4. Click "Continue"
5. Disable Google Analytics (optional) or configure it
6. Click "Create project"
7. Wait for project creation
8. Click "Continue"

## Step 2: Get Project ID

### Method 1: From Project Settings
1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Under "General" tab, find "Project ID"
4. Copy the Project ID (e.g., `parental-control-12345`)

### Method 2: From URL
- Your Firebase Console URL looks like: `https://console.firebase.google.com/project/parental-control-12345`
- The last part is your Project ID

**Save this as `FIREBASE_PROJECT_ID` in your .env file**

## Step 3: Generate Service Account Key

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Click the "Service accounts" tab
4. Click "Generate new private key" button
5. A dialog appears warning about keeping the key secure
6. Click "Generate key"
7. A JSON file downloads automatically (e.g., `parental-control-12345-firebase-adminsdk-xxxxx.json`)

## Step 4: Extract Credentials from JSON

Open the downloaded JSON file. It looks like this:

```json
{
  "type": "service_account",
  "project_id": "parental-control-12345",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@parental-control-12345.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Extract the values:

1. **FIREBASE_PROJECT_ID**
   - Find: `"project_id": "parental-control-12345"`
   - Copy: `parental-control-12345`

2. **FIREBASE_PRIVATE_KEY**
   - Find: `"private_key": "-----BEGIN PRIVATE KEY-----\n..."`
   - Copy the ENTIRE value including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - Keep the `\n` characters (they represent newlines)

3. **FIREBASE_CLIENT_EMAIL**
   - Find: `"client_email": "firebase-adminsdk-xxxxx@..."`
   - Copy: `firebase-adminsdk-xxxxx@parental-control-12345.iam.gserviceaccount.com`

## Step 5: Add to Backend .env File

Create or edit `backend/.env`:

```bash
FIREBASE_PROJECT_ID=parental-control-12345
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@parental-control-12345.iam.gserviceaccount.com
```

### Important Notes:

1. **Private Key Formatting**:
   - Must be wrapped in double quotes
   - Keep all `\n` characters (they represent line breaks)
   - Do NOT remove or modify the key content

2. **Security**:
   - NEVER commit this file to Git
   - Add `.env` to `.gitignore`
   - Keep the JSON file secure
   - Don't share these credentials

## Step 6: Enable Firebase Cloud Messaging (FCM)

1. In Firebase Console, go to "Project settings"
2. Click "Cloud Messaging" tab
3. Under "Cloud Messaging API (Legacy)", note the "Server key" (optional, for reference)
4. Under "Cloud Messaging API", click "Manage API in Google Cloud Console"
5. Enable "Firebase Cloud Messaging API" if not already enabled
6. Return to Firebase Console

## Step 7: Add Android App to Firebase

### For Child App:

1. In Firebase Console, click "Add app" or the Android icon
2. Enter Android package name: `com.childapp`
3. Enter app nickname: "Child App" (optional)
4. Leave SHA-1 empty for now (optional for FCM)
5. Click "Register app"
6. Download `google-services.json`
7. Place it in: `child-app/android/app/google-services.json`
8. Click "Next" through the remaining steps
9. Click "Continue to console"

### For Parent App (if using FCM):

1. Click "Add app" again
2. Enter Android package name: `com.parentapp`
3. Enter app nickname: "Parent App"
4. Download `google-services.json`
5. Place it in: `parent-app/android/app/google-services.json`

## Step 8: Verify Setup

### Test Backend Connection:

Create a test file `backend/test-firebase.js`:

```javascript
require('dotenv').config();
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

console.log('Firebase initialized successfully!');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);

// Test sending a message
const testToken = 'test_token_here';
admin.messaging().send({
  token: testToken,
  data: { test: 'message' }
}).then(response => {
  console.log('Test message sent:', response);
}).catch(error => {
  console.log('Expected error (invalid token):', error.code);
});
```

Run:
```bash
cd backend
node test-firebase.js
```

Expected output:
```
Firebase initialized successfully!
Project ID: parental-control-12345
Client Email: firebase-adminsdk-xxxxx@parental-control-12345.iam.gserviceaccount.com
Expected error (invalid token): messaging/invalid-argument
```

## Troubleshooting

### Error: "Failed to parse private key"

**Solution**: Check private key formatting
```bash
# Your private key should look like this in .env:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"

# NOT like this:
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQI...
-----END PRIVATE KEY-----
```

### Error: "Project ID not found"

**Solution**: Verify project ID matches exactly
```bash
# Check in Firebase Console > Project Settings > General
# Must match exactly (case-sensitive)
```

### Error: "Invalid service account"

**Solution**: Regenerate service account key
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download new JSON file
4. Update .env with new credentials

### Error: "google-services.json not found"

**Solution**: Verify file location
```bash
# Should be at:
child-app/android/app/google-services.json

# NOT at:
child-app/android/google-services.json
child-app/google-services.json
```

### Error: "Insufficient permissions"

**Solution**: Check service account roles
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to "IAM & Admin" > "IAM"
4. Find your service account
5. Ensure it has "Firebase Admin SDK Administrator Service Agent" role

## Security Best Practices

1. **Never commit credentials**:
   ```bash
   # Add to .gitignore
   .env
   *.json
   !package.json
   ```

2. **Use environment variables in production**:
   ```bash
   # Heroku
   heroku config:set FIREBASE_PROJECT_ID=your-project-id
   
   # Railway
   railway variables set FIREBASE_PROJECT_ID=your-project-id
   
   # AWS
   # Use AWS Secrets Manager or Parameter Store
   ```

3. **Rotate keys regularly**:
   - Generate new service account key every 90 days
   - Delete old keys after rotation

4. **Restrict API access**:
   - Enable App Check in Firebase
   - Use API key restrictions in Google Cloud Console

5. **Monitor usage**:
   - Check Firebase Console > Usage and billing
   - Set up budget alerts
   - Monitor for unusual activity

## Quick Reference

### Where to find each credential:

| Credential | Location |
|------------|----------|
| Project ID | Firebase Console > Project Settings > General |
| Private Key | Service Account JSON > `private_key` field |
| Client Email | Service Account JSON > `client_email` field |
| google-services.json | Firebase Console > Project Settings > Your apps > Download |

### File locations:

```
backend/.env                                    # Backend credentials
child-app/android/app/google-services.json     # Child app FCM config
parent-app/android/app/google-services.json    # Parent app FCM config (optional)
```

## Complete .env Example

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=parental-control-12345
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7xQT...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@parental-control-12345.iam.gserviceaccount.com
```

## Next Steps

After Firebase setup:
1. ✅ Start backend: `cd backend && npm run dev`
2. ✅ Test FCM from parent app
3. ✅ Verify child app receives notifications
4. ✅ Test command execution

## Support Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Service Account Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Console](https://console.firebase.google.com)

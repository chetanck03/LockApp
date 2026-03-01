# Production Deployment Notes

## Backend Deployment

### Recommended Platforms

1. **Heroku**
```bash
heroku create parental-control-api
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET=your-secret
heroku config:set FIREBASE_PROJECT_ID=your-project
git push heroku main
```

2. **Railway**
```bash
railway init
railway add postgresql
railway up
```

3. **AWS Elastic Beanstalk**
```bash
eb init
eb create parental-control-env
eb deploy
```

4. **Google Cloud Run**
```bash
gcloud run deploy parental-control \
  --source . \
  --platform managed \
  --region us-central1
```

### Environment Configuration

Required environment variables:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
```

### Database (Neon)

1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Run migrations:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Security Checklist

- [ ] HTTPS enabled (use Let's Encrypt or cloud provider SSL)
- [ ] CORS configured for specific origins
- [ ] Rate limiting enabled
- [ ] JWT secret is strong (32+ characters)
- [ ] Database credentials secured
- [ ] Firebase private key secured
- [ ] API input validation enabled
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection headers (helmet.js)

### Monitoring

1. **Logging**
```javascript
// Add winston or pino
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

2. **Error Tracking**
- Sentry: https://sentry.io
- Rollbar: https://rollbar.com
- LogRocket: https://logrocket.com

3. **Uptime Monitoring**
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://pingdom.com

### Performance

1. **Database Connection Pooling**
```javascript
// In prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

2. **Caching**
```javascript
// Add Redis for caching
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});
```

3. **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

## Parent App Deployment

### iOS App Store

1. **Prepare**
```bash
cd ios
pod install
```

2. **Build**
- Open Xcode
- Select "Any iOS Device"
- Product > Archive
- Distribute App > App Store Connect

3. **Submit**
- Upload to App Store Connect
- Fill app information
- Submit for review

### Google Play Store

1. **Generate Keystore**
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore parent-app.keystore \
  -alias parent-app \
  -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure Gradle**
```gradle
// android/app/build.gradle
signingConfigs {
    release {
        storeFile file('parent-app.keystore')
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias 'parent-app'
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
```

3. **Build Release**
```bash
cd android
./gradlew bundleRelease
```

4. **Upload**
- Go to Google Play Console
- Create app
- Upload AAB file
- Fill store listing
- Submit for review

## Child App Deployment

### Distribution Methods

1. **Google Play Store** (Recommended)
   - Standard app distribution
   - Automatic updates
   - Easy provisioning

2. **Enterprise Distribution**
   - Private app distribution
   - MDM integration
   - Custom provisioning

3. **Direct APK**
   - Host on secure server
   - QR code provisioning
   - Manual updates

### Build Release APK

```bash
cd child-app/android
./gradlew assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`

### Sign APK

```bash
jarsigner -verbose -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore child-app.keystore \
  app-release.apk child-app

zipalign -v 4 app-release.apk child-app-signed.apk
```

### Host APK

1. **AWS S3**
```bash
aws s3 cp child-app-signed.apk s3://your-bucket/child-app.apk
aws s3api put-object-acl --bucket your-bucket --key child-app.apk --acl public-read
```

2. **Firebase Hosting**
```bash
firebase init hosting
firebase deploy
```

3. **Cloudflare R2**
```bash
wrangler r2 object put your-bucket/child-app.apk --file child-app-signed.apk
```

### Update provisioning.json

```json
{
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://your-cdn.com/child-app.apk"
}
```

## Firebase Configuration

### Production Setup

1. **Create Production Project**
   - Separate from development
   - Enable FCM
   - Add Android apps

2. **Service Account**
   - Generate production key
   - Store securely
   - Use in backend env vars

3. **Security Rules**
   - Restrict API access
   - Enable App Check
   - Monitor usage

## CDN Configuration

### Cloudflare

1. Add domain
2. Enable SSL
3. Configure caching rules
4. Enable DDoS protection

### AWS CloudFront

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-backend.com \
  --default-root-object index.html
```

## Backup Strategy

### Database Backups

1. **Neon Automatic Backups**
   - Enabled by default
   - Point-in-time recovery
   - 7-day retention

2. **Manual Backups**
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

3. **Automated Backups**
```bash
# Cron job
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**
   - AWS ALB
   - Google Cloud Load Balancing
   - Nginx

2. **Multiple Instances**
   - Stateless backend
   - Shared database
   - Redis for sessions

### Vertical Scaling

1. **Database**
   - Upgrade Neon tier
   - Connection pooling
   - Query optimization

2. **Backend**
   - Increase instance size
   - Add more CPU/RAM
   - Optimize code

## Monitoring & Alerts

### Health Checks

```javascript
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});
```

### Alerts

1. **Uptime Alerts**
   - Email on downtime
   - SMS for critical issues
   - Slack integration

2. **Performance Alerts**
   - Response time > 2s
   - Error rate > 5%
   - Database connection issues

## Cost Optimization

### Backend
- Use serverless (Cloud Run, Lambda)
- Auto-scaling
- Spot instances for non-critical

### Database
- Right-size instance
- Connection pooling
- Query optimization

### Storage
- Use CDN for static assets
- Compress images
- Enable caching

## Compliance

### GDPR
- Data encryption
- User data export
- Right to deletion
- Privacy policy

### COPPA (Children's Privacy)
- Parental consent
- Minimal data collection
- Secure data storage
- Clear privacy policy

### App Store Guidelines
- Clear app description
- Privacy policy link
- Parental control disclosure
- Age rating

## Rollback Plan

1. **Database**
```bash
# Restore from backup
psql $DATABASE_URL < backup-20240301.sql
```

2. **Backend**
```bash
# Revert to previous version
git revert HEAD
git push heroku main
```

3. **Apps**
- Keep previous APK/IPA versions
- Phased rollout
- Quick rollback capability

## Launch Checklist

- [ ] Backend deployed and tested
- [ ] Database migrated and backed up
- [ ] Firebase configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Parent app submitted to stores
- [ ] Child app signed and hosted
- [ ] Provisioning tested
- [ ] Documentation complete
- [ ] Support channels ready
- [ ] Monitoring enabled
- [ ] Backup strategy implemented
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Privacy policy published
- [ ] Terms of service published

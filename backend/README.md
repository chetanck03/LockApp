# Parental Control Backend

Node.js + Express + PostgreSQL backend for parental control system.

## Features

- JWT authentication
- Device management
- Policy/command system
- FCM push notifications
- Real-time device status
- Action logging

## API Endpoints

### Authentication

```
POST /auth/register
POST /auth/login
```

### Devices

```
POST /devices/register
GET  /devices
GET  /devices/:id/status
PUT  /devices/:id/status
POST /devices/:id/command
GET  /devices/:id/apps
GET  /devices/:id/logs
```

### Policies

```
PUT /policies/:policyId/status
```

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing
- `FIREBASE_*`: Firebase credentials for FCM

## Database Schema

- Users: Parent accounts
- Devices: Child devices
- Policies: Commands sent to devices
- Logs: Action history

## Command Types

- `LOCK_DEVICE`: Lock device immediately
- `UNLOCK_DEVICE`: Unlock device
- `BLOCK_APP`: Hide/block application
- `UNBLOCK_APP`: Show/unblock application
- `ENABLE_KIOSK`: Enable kiosk mode
- `DISABLE_KIOSK`: Disable kiosk mode
- `SET_SCREEN_TIME`: Set screen time limit
- `GET_INSTALLED_APPS`: Fetch app list

## Production Deployment

1. Set `NODE_ENV=production`
2. Use production database
3. Enable HTTPS
4. Configure CORS
5. Set up monitoring
6. Enable rate limiting

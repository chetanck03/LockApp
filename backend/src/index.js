require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const prisma = require('./config/database');
const admin = require('./config/firebase');
const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/devices');
const policyRoutes = require('./routes/policies');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/devices', deviceRoutes);
app.use('/policies', policyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

// Test database and Firebase connections
async function testConnections() {
  console.log('\n🔍 Testing connections...\n');

  // Test Neon Database
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Neon Database: Connected successfully');
    console.log(`   Database URL: ${process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'configured'}`);
  } catch (error) {
    console.error('❌ Neon Database: Connection failed');
    console.error(`   Error: ${error.message}`);
  }

  // Test Firebase
  try {
    const app = admin.app();
    const projectId = process.env.FIREBASE_PROJECT_ID; // Read from env directly
    console.log('✅ Firebase: Initialized successfully');
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Client Email: ${process.env.FIREBASE_CLIENT_EMAIL?.split('@')[0]}@...`);
    
    // Test FCM by attempting to validate (will fail gracefully with invalid token)
    try {
      await admin.messaging().send({
        token: 'test_token_validation',
        data: { test: 'connection' }
      });
    } catch (fcmError) {
      if (fcmError.code === 'messaging/invalid-argument' || fcmError.code === 'messaging/invalid-registration-token') {
        console.log('   FCM: Ready (test validation passed)');
      }
    }
  } catch (error) {
    console.error('❌ Firebase: Initialization failed');
    console.error(`   Error: ${error.message}`);
  }

  console.log('\n');
}

app.listen(PORT, async () => {
  console.log(`\n Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  await testConnections();
  console.log(' Server ready to accept requests\n');
});

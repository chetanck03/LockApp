const admin = require('../config/firebase');

class FCMService {
  async sendCommand(fcmToken, command) {
    try {
      const message = {
        token: fcmToken,
        data: {
          type: 'COMMAND',
          command: JSON.stringify(command),
        },
        android: {
          priority: 'high',
        },
      };

      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('FCM Error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendToMultiple(tokens, command) {
    try {
      const message = {
        tokens,
        data: {
          type: 'COMMAND',
          command: JSON.stringify(command),
        },
        android: {
          priority: 'high',
        },
      };

      const response = await admin.messaging().sendMulticast(message);
      return { success: true, response };
    } catch (error) {
      console.error('FCM Multicast Error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new FCMService();

const prisma = require('../config/database');
const fcmService = require('./fcmService');

class CommandService {
  async createAndSendCommand(deviceId, policyType, payload) {
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    if (!device.fcm_token) {
      throw new Error('Device has no FCM token');
    }

    const policy = await prisma.policy.create({
      data: {
        device_id: deviceId,
        policy_type: policyType,
        payload,
        status: 'pending',
      },
    });

    const command = {
      policyId: policy.id,
      type: policyType,
      payload,
    };

    const fcmResult = await fcmService.sendCommand(device.fcm_token, command);

    if (fcmResult.success) {
      await prisma.policy.update({
        where: { id: policy.id },
        data: { status: 'sent' },
      });
    }

    return { policy, fcmResult };
  }

  async updatePolicyStatus(policyId, status, result = null) {
    return await prisma.policy.update({
      where: { id: policyId },
      data: {
        status,
        executed_at: status === 'executed' ? new Date() : undefined,
      },
    });
  }

  async logAction(deviceId, action, result) {
    return await prisma.log.create({
      data: {
        device_id: deviceId,
        action,
        result,
      },
    });
  }
}

module.exports = new CommandService();

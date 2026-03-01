const prisma = require('../config/database');
const commandService = require('../services/commandService');

class PolicyController {
  async sendCommand(req, res) {
    try {
      const { id } = req.params;
      const { command_type, payload } = req.body;
      const userId = req.user.userId;

      const device = await prisma.device.findFirst({
        where: {
          id,
          user_id: userId,
        },
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const result = await commandService.createAndSendCommand(
        id,
        command_type,
        payload
      );

      res.json(result);
    } catch (error) {
      console.error('Send command error:', error);
      res.status(500).json({ error: error.message || 'Failed to send command' });
    }
  }

  async updatePolicyStatus(req, res) {
    try {
      const { policyId } = req.params;
      const { status, result } = req.body;

      const policy = await commandService.updatePolicyStatus(policyId, status, result);

      if (result) {
        await commandService.logAction(policy.device_id, policy.policy_type, result);
      }

      res.json(policy);
    } catch (error) {
      console.error('Update policy status error:', error);
      res.status(500).json({ error: 'Failed to update policy status' });
    }
  }

  async getApps(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const device = await prisma.device.findFirst({
        where: {
          id,
          user_id: userId,
        },
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      const result = await commandService.createAndSendCommand(
        id,
        'GET_INSTALLED_APPS',
        {}
      );

      res.json(result);
    } catch (error) {
      console.error('Get apps error:', error);
      res.status(500).json({ error: 'Failed to fetch apps' });
    }
  }
}

module.exports = new PolicyController();

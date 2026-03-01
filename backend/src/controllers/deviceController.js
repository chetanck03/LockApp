const prisma = require('../config/database');

class DeviceController {
  async register(req, res) {
    try {
      const { device_name, fcm_token, android_version } = req.body;
      const userId = req.user.userId;

      const device = await prisma.device.create({
        data: {
          user_id: userId,
          device_name,
          fcm_token,
          android_version,
          is_online: true,
          last_seen: new Date(),
        },
      });

      res.status(201).json(device);
    } catch (error) {
      console.error('Device registration error:', error);
      res.status(500).json({ error: 'Device registration failed' });
    }
  }

  async getDevices(req, res) {
    try {
      const userId = req.user.userId;

      const devices = await prisma.device.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      res.json(devices);
    } catch (error) {
      console.error('Get devices error:', error);
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  }

  async getStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const device = await prisma.device.findFirst({
        where: {
          id,
          user_id: userId,
        },
        include: {
          policies: {
            orderBy: { created_at: 'desc' },
            take: 10,
          },
        },
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      res.json(device);
    } catch (error) {
      console.error('Get status error:', error);
      res.status(500).json({ error: 'Failed to fetch device status' });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_online, fcm_token } = req.body;

      const device = await prisma.device.update({
        where: { id },
        data: {
          is_online,
          fcm_token,
          last_seen: new Date(),
        },
      });

      res.json(device);
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update device status' });
    }
  }

  async getLogs(req, res) {
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

      const logs = await prisma.log.findMany({
        where: { device_id: id },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      res.json(logs);
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  }
}

module.exports = new DeviceController();

const express = require('express');
const { body } = require('express-validator');
const deviceController = require('../controllers/deviceController');
const policyController = require('../controllers/policyController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/register',
  [
    body('device_name').notEmpty(),
    body('fcm_token').notEmpty(),
    body('android_version').optional(),
    validate,
  ],
  deviceController.register
);

router.get('/', deviceController.getDevices);

router.get('/:id/status', deviceController.getStatus);

router.put('/:id/status', deviceController.updateStatus);

router.post(
  '/:id/command',
  [
    body('command_type').notEmpty(),
    body('payload').isObject(),
    validate,
  ],
  policyController.sendCommand
);

router.get('/:id/apps', policyController.getApps);

router.get('/:id/logs', deviceController.getLogs);

module.exports = router;

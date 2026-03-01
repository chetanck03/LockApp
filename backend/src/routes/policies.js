const express = require('express');
const { body } = require('express-validator');
const policyController = require('../controllers/policyController');
const validate = require('../middleware/validation');

const router = express.Router();

router.put(
  '/:policyId/status',
  [
    body('status').notEmpty(),
    body('result').optional(),
    validate,
  ],
  policyController.updatePolicyStatus
);

module.exports = router;

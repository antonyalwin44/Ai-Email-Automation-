const express = require('express');
const router = express.Router();
const { getEmailLogs, getDashboardStats } = require('../controllers/logController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getEmailLogs);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;

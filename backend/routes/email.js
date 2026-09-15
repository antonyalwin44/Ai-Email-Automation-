const express = require('express');
const router = express.Router();
const { generateEmail, sendEmail } = require('../controllers/emailController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/generate-email', generateEmail);
router.post('/send-email', sendEmail);

module.exports = router;

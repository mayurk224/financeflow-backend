const express = require('express');
const router = express.Router();
const { updateOnboarding } = require('../controllers/userController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

router.put('/onboarding', verifyAccessToken, updateOnboarding);

module.exports = router;

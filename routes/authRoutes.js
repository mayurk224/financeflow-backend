const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { logoutUser } = require("../controllers/authController");
const { refreshAccessToken } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/refresh-token', refreshAccessToken);
router.post('/logout', logoutUser);

module.exports = router;

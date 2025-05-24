const express = require("express");
const router = express.Router();
const { updateOnboarding, addAmountToAccount } = require("../controllers/userController");
const { verifyAccessToken, protect } = require("../middlewares/authMiddleware");

router.put("/onboarding", verifyAccessToken, updateOnboarding);
router.post("/add-balance", protect, addAmountToAccount);

module.exports = router;

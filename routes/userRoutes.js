const express = require("express");
const router = express.Router();
const {
  updateOnboarding,
  addAmountToAccount,
  getLoggedInUser,
  setPasscode,
  disablePasscode,
  updateUserProfile,
  deleteAccount,
  changePassword,
} = require("../controllers/userController");
const { verifyAccessToken, protect } = require("../middlewares/authMiddleware");

router.put("/onboarding", verifyAccessToken, updateOnboarding);
router.post("/add-balance", protect, addAmountToAccount);
router.get("/profile", protect, getLoggedInUser);
router.post("/set-passcode", protect, setPasscode);
router.delete("/disable-passcode", protect, disablePasscode);
router.put("/update-profile", protect, updateUserProfile);
router.delete("/delete-account", protect, deleteAccount);
router.put("/change-password", protect, changePassword);

module.exports = router;

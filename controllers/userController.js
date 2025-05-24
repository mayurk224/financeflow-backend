const User = require("../models/User");

exports.updateOnboarding = async (req, res) => {
  const userId = req.userId; // set by verifyAccessToken middleware
  const { userType, country, currency, avatar } = req.body;

  try {
    // Basic validation
    if (
      !userType ||
      !country ||
      !currency?.code ||
      !currency?.symbol ||
      !avatar
    ) {
      return res
        .status(400)
        .json({ message: "All onboarding fields are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        userType,
        country,
        currency,
        avatar,
        isOnboarded: true,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Onboarding completed",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        userType: updatedUser.userType,
        country: updatedUser.country,
        currency: updatedUser.currency,
        avatar: updatedUser.avatar,
        isOnboarded: updatedUser.isOnboarded,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (err) {
    console.error("Onboarding error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

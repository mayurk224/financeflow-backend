const Transaction = require("../models/Transaction");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

exports.addAmountToAccount = async (req, res) => {
  const user = req.user;
  const { amount } = req.body;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number" });
  }

  try {
    user.balance += amount;
    await user.save();

    // Create a transaction log
    await Transaction.create({
      user: user._id,
      type: "income",
      category: "Deposit",
      amount,
      note: "Account top-up",
      balanceAfter: user.balance,
    });

    res.status(200).json({
      message: "Balance updated and transaction logged",
      balance: user.balance,
    });
  } catch (err) {
    console.error("Add balance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getLoggedInUser = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        userType: user.userType,
        country: user.country,
        currency: user.currency,
        balance: user.balance,
        isOnboarded: user.isOnboarded,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.setPasscode = async (req, res) => {
  const { password, passcode } = req.body;

  if (!/^\d{4,6}$/.test(passcode)) {
    return res.status(400).json({ message: "Passcode must be 4 to 6 digits" });
  }

  try {
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const hashedPasscode = await bcrypt.hash(passcode, 10);
    user.passcode = hashedPasscode;

    await user.save();

    res.status(200).json({ message: "Passcode set successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.disablePasscode = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user._id).select(
      "+password +passcode"
    );

    if (!user.passcode) {
      return res
        .status(400)
        .json({ message: "No passcode set for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Remove passcode field
    user.passcode = undefined;
    await user.save();

    res.status(200).json({ message: "Passcode login disabled" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { username, avatar, userType, country, currency } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (avatar) user.avatar = avatar;
    if (userType) user.userType = userType;
    if (country) user.country = country;
    if (currency?.code && currency?.symbol) {
      user.currency = {
        code: currency.code,
        symbol: currency.symbol,
      };
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated",
      user: {
        username: user.username,
        avatar: user.avatar,
        userType: user.userType,
        country: user.country,
        currency: user.currency,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  const { password } = req.body;

  try {
    // Find user with password field
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Delete transactions
    await Transaction.deleteMany({ user: user._id });

    // Delete user
    await User.findByIdAndDelete(user._id);

    // Clear cookies (optional)
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res
      .status(200)
      .json({ message: "Account and all data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both old and new passwords are required" });
  }

  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res
        .status(400)
        .json({ message: "New password must be different from the old one" });
    }

    // Hash and update password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    await user.save();

    // Optionally clear cookies to force re-login
    // res.clearCookie("accessToken");
    // res.clearCookie("refreshToken");

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

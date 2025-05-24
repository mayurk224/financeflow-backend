const Transaction = require("../models/Transaction");
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

exports.addAmountToAccount = async (req, res) => {
  const user = req.user;
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }

  try {
    user.balance += amount;
    await user.save();

    // Create a transaction log
    await Transaction.create({
      user: user._id,
      type: 'income',
      category: 'Deposit',
      amount,
      note: 'Account top-up',
      balanceAfter: user.balance,
    });

    res.status(200).json({
      message: 'Balance updated and transaction logged',
      balance: user.balance,
    });
  } catch (err) {
    console.error('Add balance error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

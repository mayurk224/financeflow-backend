const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    // Onboarding fields
    userType: {
      type: String,
      enum: [
        "personal",
        "family",
        "business",
        "freelancer",
        "student",
        "other",
      ],
      default: "personal",
    },

    country: {
      type: String,
      trim: true,
    },

    currency: {
      code: { type: String, trim: true }, // e.g., "INR"
      symbol: { type: String, trim: true }, // e.g., "₹"
    },

    avatar: {
      type: String,
      enum: [
        "avatar1.png",
        "avatar2.png",
        "avatar3.png",
        "avatar4.png",
        "avatar5.png",
        "avatar6.png",
        "avatar7.png",
        "avatar8.png",
        "avatar9.png",
        "avatar10.png",
      ],
      default: "avatar1.png",
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    isOnboarded: {
      type: Boolean,
      default: false,
    },

    passcode: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Add a method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

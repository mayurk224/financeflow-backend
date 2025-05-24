const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        // Income Categories
        "Salary",
        "Business",
        "Investment",
        "Gift",
        "Interest",
        "Deposit",

        // Expense Categories
        "Food",
        "Transport",
        "Shopping",
        "Rent",
        "Utilities",
        "Entertainment",
        "Healthcare",
        "Education",
        "Travel",
        "Subscription",
        "Other",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    note: {
      type: String,
      trim: true,
    },
    balanceAfter: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);

const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    goalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    savedAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

const SavingsGoal = mongoose.model(
  "SavingsGoal",
  savingsGoalSchema
);

module.exports = SavingsGoal;

const mongoose = require("mongoose");

const moneySchoolProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    completedLessons: {
      type: [Number],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "MoneySchoolProgress",
  moneySchoolProgressSchema
);

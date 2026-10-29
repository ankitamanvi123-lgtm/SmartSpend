const SavingsGoal = require("../models/SavingsGoal");

// Create or update savings goal
const setSavingsGoal = async (req, res) => {
  try {
    const {
      goalAmount,
      savedAmount
    } = req.body;

    if (
      goalAmount === undefined ||
      savedAmount === undefined
    ) {
      return res.status(400).json({
        message: "Please enter goal amount and saved amount"
      });
    }

    if (
      Number(goalAmount) < 0 ||
      Number(savedAmount) < 0
    ) {
      return res.status(400).json({
        message: "Amounts cannot be negative"
      });
    }

    let savingsGoal = await SavingsGoal.findOne({
      user: req.user.id
    });

    if (savingsGoal) {
      savingsGoal.goalAmount = Number(goalAmount);
      savingsGoal.savedAmount = Number(savedAmount);

      await savingsGoal.save();
    } else {
      savingsGoal = await SavingsGoal.create({
        user: req.user.id,
        goalAmount: Number(goalAmount),
        savedAmount: Number(savedAmount)
      });
    }

    res.json({
      message: "Savings goal saved successfully",
      savingsGoal
    });
  } catch (error) {
    console.log("Savings Goal Error:", error);

    res.status(500).json({
      message: "Failed to save savings goal",
      error: error.message
    });
  }
};


// Get savings goal
const getSavingsGoal = async (req, res) => {
  try {
    const savingsGoal = await SavingsGoal.findOne({
      user: req.user.id
    });

    if (!savingsGoal) {
      return res.json(null);
    }

    res.json(savingsGoal);
  } catch (error) {
    console.log("Get Savings Goal Error:", error);

    res.status(500).json({
      message: "Failed to get savings goal",
      error: error.message
    });
  }
};


module.exports = {
  setSavingsGoal,
  getSavingsGoal
};
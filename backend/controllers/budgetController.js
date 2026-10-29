const Budget = require("../models/Budget");

// Add or update monthly budget
const setBudget = async (req, res) => {
  try {
    const { month, amount } = req.body;

    if (!month || amount === undefined) {
      return res.status(400).json({
        message: "Please provide month and amount"
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user.id,
        month
      },
      {
        user: req.user.id,
        month,
        amount
      },
      {
        new: true,
        upsert: true
      }
    );

    res.status(200).json({
      message: "Budget saved successfully",
      budget
    });
  } catch (error) {
    console.log("Budget Error:", error);

    res.status(500).json({
      message: "Failed to save budget",
      error: error.message
    });
  }
};


// Get user's budgets
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id
    }).sort({ month: -1 });

    res.json(budgets);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get budgets",
      error: error.message
    });
  }
};


module.exports = {
  setBudget,
  getBudgets
};
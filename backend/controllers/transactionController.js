const Transaction = require("../models/Transaction");

// Add transaction
const addTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      category,
      description,
      date
    } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      category,
      description: description || "",
      date: date
    });

    res.status(201).json({
      message: "Transaction added successfully",
      transaction
    });
  } catch (error) {
    console.log("Transaction Error:", error);

    res.status(500).json({
      message: "Failed to add transaction",
      error: error.message
    });
  }
};


// Get transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get transactions",
      error: error.message
    });
  }
};


// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      category,
      description,
      date
    } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    const transaction =
      await Transaction.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.id
        },
        {
          type,
          amount,
          category,
          description: description || "",
          date: date
        },
        {
          new: true,
          runValidators: true
        }
      );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.json({
      message: "Transaction updated successfully",
      transaction
    });
  } catch (error) {
    console.log("Update Error:", error);

    res.status(500).json({
      message: "Failed to update transaction",
      error: error.message
    });
  }
};


// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction =
      await Transaction.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
      });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.json({
      message: "Transaction deleted successfully"
    });
  } catch (error) {
    console.log("Delete Error:", error);

    res.status(500).json({
      message: "Failed to delete transaction"
    });
  }
};


module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
};
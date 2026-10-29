const express = require("express");

const {
  setBudget,
  getBudgets
} = require("../controllers/budgetController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, setBudget);

router.get("/", authMiddleware, getBudgets);

module.exports = router;
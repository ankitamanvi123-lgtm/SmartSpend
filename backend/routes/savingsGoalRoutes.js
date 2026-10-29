const express = require("express");

const {
  setSavingsGoal,
  getSavingsGoal
} = require("../controllers/savingsGoalController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  setSavingsGoal
);

router.get(
  "/",
  authMiddleware,
  getSavingsGoal
);

module.exports = router;
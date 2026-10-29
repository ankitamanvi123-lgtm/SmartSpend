
const express = require("express");
const MoneySchoolProgress = require("../models/MoneySchoolProgress");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get the logged-in user's progress
router.get("/", authMiddleware, async (req, res) => {
  try {
    let progress = await MoneySchoolProgress.findOne({
      userId: req.user.id
    });

    if (!progress) {
      progress = await MoneySchoolProgress.create({
        userId: req.user.id,
        completedLessons: []
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({
      message: "Could not load Money School progress"
    });
  }
});

// Save the logged-in user's progress
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { completedLessons } = req.body;

    if (
      !Array.isArray(completedLessons) ||
      !completedLessons.every(
        (lesson) =>
          Number.isInteger(lesson) &&
          lesson >= 1 &&
          lesson <= 6
      ) ||
      new Set(completedLessons).size !== completedLessons.length
    ) {
      return res.status(400).json({
        message: "Invalid completed lessons"
      });
    }

    const progress = await MoneySchoolProgress.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { completedLessons } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      message: "Money School progress saved",
      completedLessons: progress.completedLessons
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not save Money School progress"
    });
  }
});

module.exports = router;

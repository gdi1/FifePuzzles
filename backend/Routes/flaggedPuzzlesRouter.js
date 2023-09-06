const express = require("express");
const userController = require("../Controllers/userController");
const authController = require("../Controllers/authController");
const flaggedPuzzlesController = require("../Controllers/flaggedPuzzlesController");

const router = express.Router();

router.use(authController.protect);

router.post(
  "/send-ticket",
  flaggedPuzzlesController.sendFlaggedPuzzleTicket
);

router.get(
  "/active/skip/:skip",
  authController.restrictTo("administrator"),
  flaggedPuzzlesController.getFlaggedPuzzles
);

router.get(
  "/active-number",
  authController.restrictTo("administrator"),
  flaggedPuzzlesController.getNumberOfActiveFlaggedPuzzles
);

router.post(
  "/resolve-ticket",
  authController.restrictTo("administrator"),
  flaggedPuzzlesController.resolveFlaggedPuzzleTicket
);


module.exports = router;

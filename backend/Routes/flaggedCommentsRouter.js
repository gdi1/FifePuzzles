const express = require("express");
const authController = require("../Controllers/authController");
const flaggedCommentsController = require("../Controllers/flaggedCommentsController");

const router = express.Router();

router.use(authController.protect);

router.post(
  "/send-ticket",
  flaggedCommentsController.sendFlaggedCommentTicket
);
router.get(
  "/active/skip/:skip",
  authController.restrictTo("administrator"),
  flaggedCommentsController.getFlaggedComments
);

router.get(
  "/active-number",
  authController.restrictTo("administrator"),
  flaggedCommentsController.getNumberOfActiveFlaggedComments
);

router.post(
  "/resolve-ticket",
  authController.restrictTo("administrator"),
  flaggedCommentsController.resolveFlaggedCommentTicket
);

module.exports = router;

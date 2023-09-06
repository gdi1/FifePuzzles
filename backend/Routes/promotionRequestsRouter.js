const express = require("express");
const userController = require("../Controllers/userController");
const authController = require("../Controllers/authController");
const promotionRequestController = require("../Controllers/promotionRequestController");

const router = express.Router();

router.use(authController.protect);
router.post(
  "/send-promotion-request",
  authController.restrictTo("solver"),
  promotionRequestController.sendPromotionRequest
);

router.get(
  "/active/skip/:skip",
  authController.restrictTo("administrator"),
  promotionRequestController.getPromotionRequestsSkip
);
router.get(
  "/active-number",
  authController.restrictTo("administrator"),
  promotionRequestController.getPromotionRequestsNumber
);

router.post(
  "/resolve-promotion-request",
  authController.restrictTo("administrator"),
  promotionRequestController.resolvePromotionRequest
);

module.exports = router;

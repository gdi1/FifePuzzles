const express = require("express");
const userCountController = require("../Controllers/userCountController");

const router = express.Router();
router.get("/", userCountController.getUserCounts);

module.exports = router;

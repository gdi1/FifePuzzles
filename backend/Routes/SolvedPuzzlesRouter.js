const express = require("express");
const solvedPuzzlesController = require("../Controllers/solvedPuzzlesController");
const authController = require("../Controllers/authController");

const solvedPuzzlesRouter = express.Router();
solvedPuzzlesRouter.use(authController.protect)
solvedPuzzlesRouter.get("/type", solvedPuzzlesController.getSolvedPuzzlesType);
solvedPuzzlesRouter.get("/difficulty", solvedPuzzlesController.getSolvedPuzzlesDifficulty);
solvedPuzzlesRouter.post("/addPuzzleSolvedRecord", solvedPuzzlesController.newSolvedPuzzle);

module.exports = solvedPuzzlesRouter;

const mongoose = require("mongoose");

const puzzleSolvedSchema = mongoose.Schema({
  date: Date,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  puzzle: {
    type: mongoose.Schema.ObjectId,
    refPath: "puzzleType",
    required: true,
  },
  puzzleType: {
    type: String,
    required: true,
    enum: ["sudoku", "eights_puzzle", "hashi"],
  },
  difficulty: {
    type: String,
  },
});

puzzleSolvedSchema.pre("save", async function (next) {
  await this.populate("puzzle");
  this.difficulty =
    this.puzzle.difficulty <= 3
      ? "easy"
      : this.puzzle.difficulty <= 7
      ? "medium"
      : "hard";
  next();
});

const puzzleSolvedModel = mongoose.model("PuzzleSolved", puzzleSolvedSchema);
module.exports = puzzleSolvedModel;

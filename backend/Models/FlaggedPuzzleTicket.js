mongoose = require("mongoose");

const FlaggedPuzzleTicket = mongoose.Schema({
  message: {
    type: String,
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
  ticketer: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  datePosted: {
    type: Date,
    default: new Date(),
  },
  admin: { type: mongoose.Schema.ObjectId, ref: "User" },
  dateResolved: Date,
});

FlaggedPuzzleTicket.pre(/^find/, function (next) {
  this.populate("puzzle");
  next();
});

const FlaggedPuzzleTicketModel = mongoose.model(
  "FlaggedPuzzleTicket",
  FlaggedPuzzleTicket
);

module.exports = FlaggedPuzzleTicketModel;

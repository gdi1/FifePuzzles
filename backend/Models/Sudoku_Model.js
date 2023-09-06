const mongoose = require("mongoose");
//Defining schema
const sudoku_schema = new mongoose.Schema(
  {
    "puzzle-type": {
      type: "string",
      // ensures the users must have a name
      required: [true, "Sudoku must have a type!"],
    },
    values: {
      type: [["number"]],
      // ensures the users must have a name
      required: [true, "Sudoku must have a puzzle!"],
    },
    solution: {
      type: [["number"]],
      // ensures the users must have a name
      required: [true, "Sudoku must have a solution!"],
    },
    "creator-id": {
      type: "string",
      // ensures the users must have a name
      required: [true, "Sudoku must have a creator id!"],
    },
    difficulty: {
      type: "number",
      // ensures the users must have a name
      required: [true, "Sudoku must have a difficulty!"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    //https://stackoverflow.com/questions/19287142/populate-a-mongoose-model-with-a-field-that-isnt-an-id
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
sudoku_schema.virtual("sudoku_creator", {
  ref: "User",
  localField: '"creator-id"',
  foreignField: "userID",
  justOne: false, // for many-to-many relationships
});
//Defining model on schema
const sudoku_model = mongoose.model("sudoku", sudoku_schema);
module.exports = sudoku_model;

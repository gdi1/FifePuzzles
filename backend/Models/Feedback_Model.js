const mongoose = require("mongoose");

const feedback_schema = new mongoose.Schema({
  "puzzle-id": {
    type: mongoose.Types.ObjectId,
    required: [true, "feedback must be linked to a puzzle"],
  },
  "user-id": {
    type: "string",
    required: [true, "user id required for feedback"],
  },
  rating: {
    type: "number",
    required: [true, "must have user rating"],
  },
  comment: {
    type: "string",
    required: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  datePosted: Date,
});

const feedback_model = mongoose.model("feedback", feedback_schema);
module.exports = feedback_model;

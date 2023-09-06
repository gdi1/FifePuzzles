const mongoose = require("mongoose");

const FlaggedCommentTicket = mongoose.Schema({
  feedback: {
    type: mongoose.Schema.ObjectId,
    ref: "feedback",
    required: true,
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
  message: {
    type: String,
    required: true,
  },
  admin: { type: mongoose.Schema.ObjectId, ref: "User" },
  dateResolved: Date,
});

FlaggedCommentTicket.pre(/^find/, function (next) {
  this.populate("feedback");
  next();
});

const FlaggedCommentTicketModel = mongoose.model(
  "FlaggedCommentTicket",
  FlaggedCommentTicket
);

module.exports = FlaggedCommentTicketModel;

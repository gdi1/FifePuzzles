const mongoose = require("mongoose");

const promotionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    require: [true, "Request must have a user associated with it."],
  },
  message: { type: String, require: [true, "Request must have a message."] },
  active: {
    type: Boolean,
    default: true,
  },
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    select: false,
  },
  verdict: {
    type: String,
    default: "undecided",
    enum: ["accepted", "rejected", "undecided"],
  },
  datePosted: {
    type: Date,
    default: Date.now(),
  },
  dateResolved: Date,
});

const PromotionRequest = mongoose.model("PromotionRequest", promotionSchema);

module.exports = PromotionRequest;

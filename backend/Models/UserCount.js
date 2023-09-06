const mongoose = require("mongoose");

const userCountSchema = mongoose.Schema({
  date: Date,
  count: {
    type: Number,
    required: true,
  },
  users: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    select: false,
  },
});

userCountSchema.pre("save", async function (next) {
  this.count = this.users.length;
  next();
});

const UserCountModel = mongoose.model("UserCount", userCountSchema);
module.exports = UserCountModel;

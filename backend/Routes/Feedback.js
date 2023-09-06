const express = require("express");
const feedback_model = require("../Models/Feedback_Model");
const feedback_router = express.Router();
const authController = require("../Controllers/authController");
// feedback_router.use(authController.protect);
feedback_router.post("/add_feedback/", async (req, res) => {
  let rating = req.body.rating;
  let puzzleID = req.body["puzzle-id"];
  let userID = req.body["user-id"];
  let comment = req.body["comment-body"];

  const now = new Date();
  let feedback = {
    "puzzle-id": puzzleID,
    "user-id": userID,
    rating: rating,
    comment: comment,
    datePosted: now,
  };
  let feedback_to_upload = new feedback_model(feedback);
  console.log(feedback_to_upload);
  feedback_to_upload.save(function (err) {
    console.log("aaaaaaa", err);
    if (err) {
      res.json({ added: false, message: "failed on server" });
    } else {
      res.json({ added: true, message: "feedback added" });
    }
  });
});

feedback_router.post("/get_feedback/", async (req, res) => {
  let user = req.body["user-id"];
  let puzzle = req.body["puzzle-id"];
  console.log(puzzle)
  //this gets comments left by a user
  if (user) {
    let result = await feedback_model
      .find({
        "user-id": { $eq: user }, "comment": {
          "$ne": ""
        }, active: true
      })
      .exec()
      .then((response) => response);
    res.json(result);
  }

  //this gets comments left for a puzzle
  else if (puzzle) {
    let result = await feedback_model
      .find({
        "puzzle-id": { $eq: puzzle }, "comment": {
          "$ne": ""
        }, active: true
      })
      .sort([["datePosted", -1]])
      .exec()
      .then((response) => response);
    console.log(req.body, result);
    res.json(result);
  }
});
// feedback_router.use(authController.restrictTo("administrator"));
feedback_router.post("/delete_feedback/", async (req, res) => {
  let commentID = req.body.commentID;
  console.log("jdiewujdiweuhiduhweiduhiw", commentID)
  feedback_model.findByIdAndDelete(commentID, (err, result) => {
    if (err) {
      res.json({ success: false })
    } else {
      console.log("deleted comment ////////////////")
      res.json({ success: true })
    }
  });
})

module.exports = feedback_router;

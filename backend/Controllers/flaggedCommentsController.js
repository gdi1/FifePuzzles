const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../Models/User");
const FlaggedCommentTicket = require("./../Models/FlaggedCommentTicket");

exports.getNumberOfActiveFlaggedComments = catchAsync(
  async (req, res, next) => {
    const numOfFlaggedComments = await FlaggedCommentTicket.count({
      active: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        numOfFlaggedComments,
      },
    });
  }
);

exports.getFlaggedComments = catchAsync(async (req, res, next) => {
  console.log("inside flagged comments get");
  const { skip } = req.params;
  const batchSize = 4;
  const flaggedComments = await FlaggedCommentTicket.find({ active: true })
    .sort([["datePosted", -1]])
    .skip(skip)
    .limit(batchSize);

  console.log(flaggedComments);

  res.status(200).json({
    status: "success",
    data: {
      flaggedComments,
      batchSize,
    },
  });
});

/*exports.createFlaggedCommentTicket = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { message } = req.body;

  const now = Date.now();
  const flaggedCommentTicket = await FlaggedCommentTicket.create({
    message,
    ticketer: user._id,
    datePosted: now,
  });

  console.log("New flagged comment ticket: ", flaggedCommentTicket);

  res.status(200).json({
    status: "success",
    data: {
      flaggedCommentTicket,
    },
  });
});*/

exports.sendFlaggedCommentTicket = catchAsync(async (req, res) => {
  let textSubmitted = req.body.info.textSubmitted;
  let feedbackID = req.body.info.feedbackID;
  let userID = req.body.info.userID;
  const flaggedFeedbackTicket = {
    message: textSubmitted,
    feedback: feedbackID,
    ticketer: userID,
  };
  let ticket_to_upload = new FlaggedCommentTicket(flaggedFeedbackTicket);
  //Saving puzzle and sending result of save
  ticket_to_upload.save(function (err) {
    if (err) {
      res.json({
        added: false,
      });
    } else {
      res.json({
        added: true,
        ticketID: ticket_to_upload._id,
      });
    }
  });
});

exports.resolveFlaggedCommentTicket = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { ticketID, message, subject, isIssue, banAccount } = req.body;

  const flaggedCommentTicket = await FlaggedCommentTicket.findOne({
    _id: ticketID,
  });

  if (!flaggedCommentTicket)
    return next(new AppError("Invalid flagged puzzle ticket id", 404));

  const now = Date.now();
  flaggedCommentTicket.admin = user;
  flaggedCommentTicket.dateResolved = now;
  flaggedCommentTicket.active = false;
  await flaggedCommentTicket.save();

  if (!isIssue) {
    // send message to ticketer
    if (message !== "" || subject !== "") {
      const ticketer = await User.findOne({
        _id: flaggedCommentTicket.ticketer,
      });
      if (ticketer) {
        const now = Date.now();
        ticketer.messages.unshift({
          message,
          subject,
          sentAt: now,
        });
        await ticketer.save();
      }
    }
  } else {
    // send message to commenter
    const { feedback } = flaggedCommentTicket;
    feedback.active = false;
    await feedback.save();

    if (message !== "" || subject !== "" || banAccount) {
      let commenter = undefined;
      if (feedback["user-id"] && feedback["user-id"].includes("-")) {
        commenter = await User.findOne({ userID: feedback["user-id"] });
      } else {
        commenter = await User.findOne({
          _id: feedback["user-id"],
        });
      }
      console.log("BBBBBBBB");

      if (commenter) {
        if (!banAccount) {
          const now = Date.now();
          commenter.messages.unshift({
            message,
            subject,
            sentAt: now,
          });
        } else {
          commenter.active = false;
          commenter.banMessage.subject = subject || "Banned account";
          commenter.banMessage.message =
            message || "Your account has been permanently banned.";
        }
        await commenter.save();
      }

      console.log("AAAAAA");
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      flaggedCommentTicket,
    },
  });
});

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../Models/User");
const FlaggedPuzzleTicket = require("./../Models/FlaggedPuzzleTicket");

exports.getNumberOfActiveFlaggedPuzzles = catchAsync(async (req, res, next) => {
  const numOfFlaggedPuzzles = await FlaggedPuzzleTicket.count({ active: true });

  res.status(200).json({
    status: "success",
    data: {
      numOfFlaggedPuzzles,
    },
  });
});

exports.getFlaggedPuzzles = catchAsync(async (req, res, next) => {
  console.log("inside flagged puzzles get");
  const { skip } = req.params;
  const batchSize = 4;
  const flaggedPuzzles = await FlaggedPuzzleTicket.find({ active: true })
    .sort([["datePosted", -1]])
    .skip(skip)
    .limit(batchSize);

  console.log(flaggedPuzzles);

  res.status(200).json({
    status: "success",
    data: {
      flaggedPuzzles,
      batchSize,
    },
  });
});

/*exports.createFlaggedPuzzleTicket = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { puzzleType, message, puzzle } = req.body;

  const now = Date.now();
  const flaggedPuzzleTicket = await FlaggedPuzzleTicket.create({
    message,
    puzzleType,
    puzzle,
    ticketer: user._id,
    datePosted: now,
  });

  console.log("New flagged puzzle ticket: ", flaggedPuzzleTicket);

  res.status(200).json({
    status: "success",
    data: {
      flaggedPuzzleTicket,
    },
  });
});*/

exports.sendFlaggedPuzzleTicket = catchAsync(async (req, res) => {
  let textSubmitted = req.body.info.textSubmitted;
  let puzzleID = req.body.info.puzzleID;
  let userID = req.body.info.userID;
  let puzzleType = req.body.info.puzzleType;
  const flaggedPuzzleTicket = {
    message: textSubmitted,
    puzzle: puzzleID,
    puzzleType: puzzleType,
    ticketer: userID,
  };
  let ticket_to_upload = new FlaggedPuzzleTicket(flaggedPuzzleTicket);
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

exports.resolveFlaggedPuzzleTicket = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { ticketID, message, subject, isIssue } = req.body;

  const flaggedPuzzleTicket = await FlaggedPuzzleTicket.findOne({
    _id: ticketID,
  });

  if (!flaggedPuzzleTicket)
    return next(new AppError("Invalid flagged puzzle ticket id", 404));

  const now = Date.now();
  flaggedPuzzleTicket.admin = user;
  flaggedPuzzleTicket.dateResolved = now;
  flaggedPuzzleTicket.active = false;
  await flaggedPuzzleTicket.save();

  if (!isIssue) {
    // send message to ticketer
    if (message !== "" || subject !== "") {
      const ticketer = await User.findOne({
        _id: flaggedPuzzleTicket.ticketer,
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
    // send message to puzzle creator
    const { puzzle } = flaggedPuzzleTicket;
    puzzle.active = false;
    await puzzle.save();

    if (message !== "" || subject !== "") {
      const puzzleCreator = await User.findOne({
        userID: puzzle["creator-id"],
      });
      if (puzzleCreator) {
        const now = Date.now();
        puzzleCreator.messages.unshift({
          message,
          subject,
          sentAt: now,
        });
        await puzzleCreator.save();
      }
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      flaggedPuzzleTicket,
    },
  });
});

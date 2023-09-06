const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../Models/User");
const PromotionRequest = require("./../Models/PromotionRequest");
const PuzzleSolved = require("../Models/PuzzleSolved");
const UserCount = require("./../Models/UserCount");
const Hashi = require("./../Models/Hashi_Model");
const Sudoku = require("./../Models/Sudoku_Model");
const Eights_Puzzle = require("./../Models/Eights_Puzzle_Model");

exports.sendPromotionRequest = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { message } = req.body;

  const previousRequests = await PromotionRequest.find({ user: id }).sort([
    ["datePosted", -1],
  ]);

  const thirtydays = 1000 * 60 * 60 * 24 * 30;

  console.log(previousRequests);
  /*if (
    previousRequests.length !== 0 &&
    new Date().getTime() - previousRequests[0].datePosted.getTime() < thirtydays
  ) {
    return next(new AppError("Must wait 30 days since last request!", 400));
  }*/

  const now = Date.now();

  const promRequest = await PromotionRequest.create({
    user: id,
    message: message,
    datePosted: now,
  });

  res.status(200).json({
    status: "success",
    data: {
      message: "Promotion request send successfully!",
      promRequest,
    },
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const { user } = req;
  const userToDelete = await User.findOne({ _id: user._id }).select(
    "+password"
  );
  const { password } = req.body;

  if (
    !userToDelete ||
    !(await user.correctPassword(password, userToDelete.password))
  ) {
    return next(new AppError("Incorrect password!", 401));
  }

  await User.deleteOne({ _id: userToDelete._id });

  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  // send response back to client stating that their logout was successful
  res.status(200).json({ status: "success" });
});

/**
 * Function to udpate a user;s details
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  // as of right now the only field that the user is allowed to change is their name
  const { name } = req.body;

  // get the current user
  const { user } = req;
  console.log("Inside update");

  // if there is no new name entered, then return error immediately
  if (!name) {
    return next(new AppError("Invalid new name.", 400));
  }

  // if the user is a guest, then return error immediately because they should only be able to update their name on the website they registered.
  if (user.isGuest) {
    return next(new AppError("Guest users cannot change their name.", 400));
  }

  // update their name with the new one
  user.name = name;
  // save changes
  await user.save();

  //sed successfull response back to the client
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getPromotionRequests = catchAsync(async (req, res, next) => {
  console.log("In heree");
  const { batch } = req.params;
  const batchSize = 4;
  const promRequests = await PromotionRequest.find({ active: true })
    .populate({
      path: "user",
    })
    .sort([["datePosted", -1]])
    .skip((batch - 1) * batchSize)
    .limit(batchSize);

  console.log(batch, batchSize, promRequests.length);

  res.status(200).json({
    status: "success",
    data: {
      promRequests,
      batchSize,
    },
  });
});

exports.getPromotionRequestsSkip = catchAsync(async (req, res, next) => {
  console.log("In heree");
  const { skip } = req.params;
  const batchSize = 4;

  const promRequests = await PromotionRequest.find({ active: true })
    .populate({
      path: "user",
    })
    .sort([["datePosted", -1]])
    .skip(skip)
    .limit(batchSize);

  console.log(skip, batchSize, promRequests.length);
  console.log(promRequests);

  res.status(200).json({
    status: "success",
    data: {
      promRequests,
      batchSize,
    },
  });
});

exports.getPromotionRequestsNumber = catchAsync(async (req, res, next) => {
  const promRequestsNum = await PromotionRequest.count({ active: true });

  res.status(200).json({
    status: "success",
    data: {
      numberOfPromRequests: promRequestsNum,
    },
  });
});

exports.resolvePromotionRequest = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { promID, verdict, message, subject } = req.body;
  const promRequest = await PromotionRequest.findOne({ _id: promID });

  if (!promRequest)
    return next(
      new AppError("There is no promotion request with this id", 404)
    );

  const userRequesting = await User.findOne({ _id: promRequest.user });

  if (!userRequesting) {
    return next(
      new AppError(
        "There is no user associated with this promotion request",
        404
      )
    );
  }

  promRequest.active = false;
  promRequest.dateResolved = new Date();
  promRequest.verdict = verdict;
  promRequest.admin = user.id;
  const updatedPromRequest = await promRequest.save();

  if (message.trim() !== "" || subject.trim() !== "") {
    const now = Date.now();
    userRequesting.messages.unshift({
      message: message,
      subject: subject,
      sentAt: now,
    });
  }

  if (verdict === "accepted") userRequesting.role = "creator";

  const updatedUser = await userRequesting.save();

  res.status(200).json({
    status: "success",
    data: {
      updatedPromRequest,
      updatedUser,
    },
  });
});

exports.setMessagesAsSeen = catchAsync(async (req, res, next) => {
  const { user } = req;

  const retrievedUser = await User.findOne({ _id: user.id }).sort([
    ["messages.sentAt", -1],
  ]);
  let firstSeen = retrievedUser.messages.findIndex(
    (message) => message.seen === true
  );

  if (firstSeen === -1) firstSeen = retrievedUser.messages.length;

  for (let i = 0; i < firstSeen; i++) {
    retrievedUser.messages[i].seen = true;
  }
  await retrievedUser.save();

  res.status(200).json({
    status: "message",
    data: {
      message: "Messages updated successfully",
      messages: retrievedUser.messages,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  let user;
  const { id } = req.params;
  if (id && id.includes("-")) {
    user = await User.findOne({ userID: req.params.id });
  } else {
    user = await User.findOne({ _id: req.params.id });
  }

  let solvedPuzzlesType = undefined;
  let solvedPuzzlesDifficulty = undefined;
  let userActivity = undefined;
  let userActivity6Months = undefined;
  let userActivityYear = undefined;

  if (!user) return next(new AppError("Could not find user", 404));

  solvedPuzzlesType = await PuzzleSolved.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: "$puzzleType",
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  solvedPuzzlesDifficulty = await PuzzleSolved.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: "$difficulty",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  userActivity = await UserCount.aggregate([
    { $match: { users: user._id } },
    {
      $group: {
        _id: { month: { $month: "$date" }, year: { $year: "$date" } },
        count: {
          $sum: 1,
        },
      },
    },
    { $sort: { "_id.year": 1 } },
    { $sort: { "_id.month": 1 } },
  ]);

  const last6Months = new Date(
    new Date().getTime() - 1000 * 60 * 60 * 24 * 180
  );

  const lastYear = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365);

  userActivity6Months = await UserCount.aggregate([
    { $match: { users: user._id, date: { $gte: last6Months } } },
    {
      $group: {
        _id: { month: { $month: "$date" }, year: { $year: "$date" } },
        count: {
          $sum: 1,
        },
      },
    },
    { $sort: { "_id.year": 1 } },
    { $sort: { "_id.month": 1 } },
  ]);

  userActivityYear = await UserCount.aggregate([
    { $match: { users: user._id, date: { $gte: lastYear } } },
    {
      $group: {
        _id: { month: { $month: "$date" }, year: { $year: "$date" } },
        count: {
          $sum: 1,
        },
      },
    },
    { $sort: { "_id.year": 1 } },
    { $sort: { "_id.month": 1 } },
  ]);

  const { user: administrator } = await req;
  administrator.recentSearchedUsers.unshift(user._id);
  administrator.recentSearchedUsers = administrator.recentSearchedUsers.filter(
    // (el, index) => administrator.recentSearchedUsers.indexOf(el) === index
    (el, index) =>
      administrator.recentSearchedUsers.findIndex((innerEl) =>
        innerEl.equals(el)
      ) === index
  );
  await administrator.save();

  const now = new Date();
  const allTime =
    userActivity.length > 0
      ? userActivity[0]._id
      : { month: now.getMonth(), year: now.getFullYear() };

  const { userActivityLast6Months, userActivityLastYear, userActivityAllTime } =
    generateDatesUserToDisplay(
      allTime,
      now,
      userActivity6Months,
      userActivityYear,
      userActivity
    );

  const months = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  };

  const last6MonthsLabels = userActivityLast6Months.map(
    (el) => `${months[el.month]} ${el.year % 100}`
  );
  const lastYearLabels = userActivityLastYear.map(
    (el) => `${months[el.month]} ${el.year % 100}`
  );
  const allTimeLabels = userActivityAllTime.map(
    (el) => `${months[el.month]} ${el.year % 100}`
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
      solvedPuzzlesType,
      solvedPuzzlesDifficulty,
      userActivityAllTime,
      userActivityLast6Months,
      userActivityLastYear,
      last6MonthsLabels,
      lastYearLabels,
      allTimeLabels,
    },
  });
});

const generateDatesUserToDisplay = (
  allTime,
  now,
  userActivity6Months,
  userActivityYear,
  userActivity
) => {
  const last6Months = new Date(
    new Date().getTime() - 1000 * 60 * 60 * 24 * 180
  );

  let last6MonthsMonth = last6Months.getMonth() + 1;
  let last6MonthsYear = last6Months.getFullYear();

  const lastYear = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365);

  let lastYearMonth = lastYear.getMonth() + 1;
  let lastYearYear = lastYear.getFullYear();

  const nowMonth = now.getMonth() + 1;
  const nowYear = now.getFullYear();

  let allTimeMonth = allTime.month;
  let allTimeYear = allTime.year;

  let userActivityLast6Months = [];
  let userActivityLastYear = [];
  let userActivityAllTime = [];

  let j = 0;
  while (last6MonthsMonth !== nowMonth || last6MonthsYear !== nowYear) {
    if (
      j < userActivity6Months.length &&
      userActivity6Months[j]._id.month === last6MonthsMonth &&
      userActivity6Months[j]._id.year === last6MonthsYear
    ) {
      userActivityLast6Months.push({
        month: last6MonthsMonth,
        year: last6MonthsYear,
        count: userActivity6Months[j].count,
      });
      j++;
    } else {
      userActivityLast6Months.push({
        month: last6MonthsMonth,
        year: last6MonthsYear,
        count: 0,
      });
    }

    last6MonthsMonth = last6MonthsMonth % 12;
    if (last6MonthsMonth === 0) {
      last6MonthsYear++;
    }
    last6MonthsMonth++;
  }
  if (
    j < userActivity6Months.length &&
    userActivity6Months[j]._id.month === last6MonthsMonth &&
    userActivity6Months[j]._id.year === last6MonthsYear
  ) {
    userActivityLast6Months.push({
      month: last6MonthsMonth,
      year: last6MonthsYear,
      count: userActivity6Months[j].count,
    });
    j++;
  } else {
    userActivityLast6Months.push({
      month: last6MonthsMonth,
      year: last6MonthsYear,
      count: 0,
    });
  }

  j = 0;
  while (lastYearMonth !== nowMonth || lastYearYear !== nowYear) {
    if (
      j < userActivityYear.length &&
      userActivityYear[j]._id.month === lastYearMonth &&
      userActivityYear[j]._id.year === lastYearYear
    ) {
      userActivityLastYear.push({
        month: lastYearMonth,
        year: lastYearYear,
        count: userActivityYear[j].count,
      });
      j++;
    } else {
      userActivityLastYear.push({
        month: lastYearMonth,
        year: lastYearYear,
        count: 0,
      });
    }
    lastYearMonth = lastYearMonth % 12;
    if (lastYearMonth === 0) {
      lastYearYear++;
    }
    lastYearMonth++;
  }
  if (
    j < userActivityYear.length &&
    userActivityYear[j]._id.month === lastYearMonth &&
    userActivityYear[j]._id.year === lastYearYear
  ) {
    userActivityLastYear.push({
      month: lastYearMonth,
      year: lastYearYear,
      count: userActivityYear[j].count,
    });
    j++;
  } else {
    userActivityLastYear.push({
      month: lastYearMonth,
      year: lastYearYear,
      count: 0,
    });
  }

  j = 0;
  while (allTimeMonth !== nowMonth || allTimeYear !== nowYear) {
    if (
      j < userActivity.length &&
      userActivity[j]._id.month === allTimeMonth &&
      userActivity[j]._id.year === allTimeYear
    ) {
      userActivityAllTime.push({
        month: allTimeMonth,
        year: allTimeYear,
        count: userActivity[j].count,
      });
      j++;
    } else {
      userActivityAllTime.push({
        month: allTimeMonth,
        year: allTimeYear,
        count: 0,
      });
    }
    allTimeMonth = allTimeMonth % 12;
    if (allTimeMonth === 0) {
      allTimeYear++;
    }
    allTimeMonth++;
  }

  if (
    j < userActivity.length &&
    userActivity[j]._id.month === allTimeMonth &&
    userActivity[j]._id.year === allTimeYear
  ) {
    userActivityAllTime.push({
      month: allTimeMonth,
      year: allTimeYear,
      count: userActivity[j].count,
    });
    j++;
  } else {
    userActivityAllTime.push({
      month: allTimeMonth,
      year: allTimeYear,
      count: 0,
    });
  }

  return { userActivityLast6Months, userActivityLastYear, userActivityAllTime };
};

exports.getPuzzle = catchAsync(async (req, res, next) => {
  const { puzzleID, puzzleType } = req.query;

  console.log("Hereeee", puzzleID, puzzleType);

  const puzzle = await (puzzleType === "sudoku"
    ? Sudoku
    : puzzleType === "eights_puzzle"
    ? Eights_Puzzle
    : Hashi
  ).findOne({ _id: puzzleID });

  if (!puzzle) return next(new AppError("Could not find puzzle", 404));

  const numberOfUsersThatSolvedIt = await PuzzleSolved.count({
    puzzle: puzzleID,
    puzzleType,
  });

  const { user } = req;

  user.recentSearchedPuzzles.unshift({ puzzle: puzzle._id, puzzleType });
  user.recentSearchedPuzzles = user.recentSearchedPuzzles.filter(
    (el, index) =>
      user.recentSearchedPuzzles.findIndex((innerEl) =>
        innerEl.puzzle.equals(el.puzzle)
      ) === index
  );
  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      puzzle,
      numberOfUsersThatSolvedIt,
    },
  });
});

exports.getNumberOfSolversForPuzzle = catchAsync(async (req, res, next) => {
  const { puzzleID, puzzleType } = req.body;

  const numberOfUsersThatSolvedIt = await PuzzleSolved.count({
    puzzle: puzzleID,
    puzzleType,
  });

  res.status(200).json({
    status: "success",
    data: {
      numberOfUsersThatSolvedIt,
    },
  });
});

exports.getRecentSearchedUsers = catchAsync(async (req, res, next) => {
  const { user } = req;
  let recentSearchedUsers = [];
  if (user.role === "administrator") {
    const result = await User.findOne({ _id: user._id }).populate(
      "recentSearchedUsers"
    );

    recentSearchedUsers = result.recentSearchedUsers;
    await result.save();
  }

  res.status(200).json({
    status: "success",
    data: {
      recentSearchedUsers,
    },
  });
});

exports.getRecentSearchedPuzzles = catchAsync(async (req, res, next) => {
  const { user } = req;
  let recentSearchedPuzzles = [];
  if (user.role === "administrator") {
    const result = await User.findOne({ _id: user._id }).populate({
      path: "recentSearchedPuzzles",
      populate: { path: "puzzle" },
    });

    for (let i = 0; i < result.recentSearchedPuzzles.length; i++) {
      if (result.recentSearchedPuzzles[i].puzzle === null) {
        result.recentSearchedPuzzlesult = result.recentSearchedPuzzles.splice(
          i,
          1
        );
      }
    }
    console.log("Result is", user);
    recentSearchedPuzzles = result.recentSearchedPuzzles;
    await result.save();
  }

  console.log(recentSearchedPuzzles);

  res.status(200).json({
    status: "success",
    data: {
      recentSearchedPuzzles,
    },
  });
});

exports.resolveBanAccount = catchAsync(async (req, res, next) => {
  const { message, subject, userID } = req.body;

  const user = await User.findOne({ _id: userID });

  if (user) {
    if (user.active) {
      user.active = false;
      user.banMessage.subject = subject || "Banned account";
      user.banMessage.message =
        message || "Your account has been permanently banned.";
      await user.save();
    } else if (!user.active) {
      const now = new Date();
      user.active = true;
      user.messages.unshift({
        message:
          message || "Your account has been reactivated upon recent actions.",
        subject: subject || "Account reactivation.",
        sentAt: now,
      });
      await user.save();
    }
  } else {
    return next(new AppError("Could not find user", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.sendMessageUser = catchAsync(async (req, res, next) => {
  const { userID, message, subject } = req.body;

  const user = await User.findOne({ _id: userID });

  if (user) {
    const now = new Date();
    user.messages.unshift({
      message: message,
      subject,
      sentAt: now,
    });
    await user.save();
  } else {
    return next(new AppError("Could not find user", 404));
  }
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.togglePuzzleStatus = catchAsync(async (req, res, next) => {
  const { puzzleID, puzzleType, message, subject } = req.body;

  const puzzle = await (puzzleType === "sudoku"
    ? Sudoku
    : puzzleType === "eights_puzzle"
    ? Eights_Puzzle
    : Hashi
  ).findOne({ _id: puzzleID });

  if (!puzzle) return next(new AppError("Could not find puzzle", 404));

  puzzle.active = !puzzle.active;
  await puzzle.save();

  let puzzleCreator = undefined;
  if (message !== "" || subject !== "") {
    puzzleCreator = await User.findOne({
      userID: puzzle["creator-id"],
    });
    if (puzzleCreator) {
      const now = new Date();
      puzzleCreator.messages.unshift({
        message,
        subject,
        sentAt: now,
      });
      await puzzleCreator.save();
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      puzzle,
      puzzleCreator,
    },
  });
});

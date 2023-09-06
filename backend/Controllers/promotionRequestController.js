const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../Models/User");
const PromotionRequest = require("./../Models/PromotionRequest");

exports.sendPromotionRequest = catchAsync(async (req, res, next) => {
  //console.log("Bnaaa");
  const { id } = req.user;
  const { message } = req.body;

  const previousRequests = await PromotionRequest.find({ user: id }).sort([
    ["datePosted", -1],
  ]);

  const thirtydays = 1000 * 60 * 60 * 24 * 30;

  //console.log(previousRequests);
  if (
    previousRequests.length !== 0 &&
    new Date().getTime() - previousRequests[0].datePosted.getTime() < thirtydays
  ) {
    return next(new AppError("Must wait 30 days since last request!", 400));
  }

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

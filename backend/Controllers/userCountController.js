const catchAsync = require("../utils/catchAsync");
const UserCount = require("./../Models/UserCount");

exports.addNewUser = catchAsync(async (user) => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  let todayUserCount = await UserCount.findOne({ date: today }).select("users");

  if (todayUserCount) {
    if (!todayUserCount.users.includes(user._id)) {
      todayUserCount.users.push(user._id);
      await todayUserCount.save();
    }
  } else {
    todayUserCount = await UserCount.create({
      date: today,
      count: 1,
      users: [user._id],
    });
  }

  return todayUserCount;
});

exports.getUserCounts = catchAsync(async (req, res, next) => {
  const userCounts = await UserCount.find({}).sort([["date", 1]]);

  const now = new Date(new Date().setHours(0, 0, 0, 0));
  let lastWeek = new Date(
    new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 6).setHours(
      0,
      0,
      0,
      0
    )
  );
  let lastMonth = new Date(
    new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 29).setHours(
      0,
      0,
      0,
      0
    )
  );
  let last3Months = new Date(
    new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 89).setHours(
      0,
      0,
      0,
      0
    )
  );
  let allTime = userCounts.length > 0 ? new Date(userCounts[0].date) : now;

  const lastWeekActivity = await UserCount.find({
    date: { $gt: lastWeek },
  }).sort([["date", 1]]);
  const lastMonthActivity = await UserCount.find({
    date: { $gt: lastMonth },
  }).sort([["date", 1]]);
  const last3MonthsActivity = await UserCount.find({
    date: { $gt: last3Months },
  }).sort([["date", 1]]);

  //console.log("Time is:", lastWeek.getTime());

  const lastWeekArray = [];
  const lastMonthArray = [];
  const last3MonthsArray = [];
  const allTimeArray = [];

  const oneDay = 1000 * 60 * 60 * 24;

  while (lastWeek.getTime() <= now.getTime()) {
    lastWeekArray.push({ date: lastWeek, count: 0 });
    lastWeek = new Date(lastWeek.getTime() + oneDay);
  }

  while (lastMonth.getTime() <= now.getTime()) {
    lastMonthArray.push({ date: lastMonth, count: 0 });
    lastMonth = new Date(lastMonth.getTime() + oneDay);
  }

  while (lastMonth.getTime() <= now.getTime()) {
    lastMonthArray.push({ date: lastMonth, count: 0 });
    lastMonth = new Date(lastMonth.getTime() + oneDay);
  }

  while (last3Months.getTime() <= now.getTime()) {
    last3MonthsArray.push({ date: last3Months, count: 0 });
    last3Months = new Date(last3Months.getTime() + oneDay);
  }

  while (allTime.getTime() <= now.getTime()) {
    allTimeArray.push({ date: allTime, count: 0 });
    allTime = new Date(allTime.getTime() + oneDay);
  }

  let j = 0;
  for (let i = 0; i < lastWeekArray.length; i++) {
    if (
      j < lastWeekActivity.length &&
      lastWeekArray[i].date.getTime() === lastWeekActivity[j].date.getTime()
    ) {
      lastWeekArray[i].count = lastWeekActivity[j].count;
      j++;
    }
  }

  j = 0;
  for (let i = 0; i < lastMonthArray.length; i++) {
    if (
      j < lastMonthActivity.length &&
      lastMonthArray[i].date.getTime() === lastMonthActivity[j].date.getTime()
    ) {
      lastMonthArray[i].count = lastMonthActivity[j].count;
      j++;
    }
  }

  j = 0;
  for (let i = 0; i < last3MonthsArray.length; i++) {
    if (
      j < last3MonthsActivity.length &&
      last3MonthsArray[i].date.getTime() ===
        last3MonthsActivity[j].date.getTime()
    ) {
      last3MonthsArray[i].count = last3MonthsActivity[j].count;
      j++;
    }
  }

  j = 0;
  for (let i = 0; i < allTimeArray.length; i++) {
    if (
      j < userCounts.length &&
      allTimeArray[i].date.getTime() === userCounts[j].date.getTime()
    ) {
      allTimeArray[i].count = userCounts[j].count;
      j++;
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      lastWeekArray,
      lastMonthArray,
      last3MonthsArray,
      allTimeArray,
    },
  });
});

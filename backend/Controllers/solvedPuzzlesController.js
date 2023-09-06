const catchAsync = require("../utils/catchAsync");
const PuzzleSolved = require("../Models/PuzzleSolved");
const Sudoku = require("../Models/Sudoku_Model");
const EightsPuzzle = require("../Models/Eights_Puzzle_Model");
const Hashi = require("../Models/Hashi_Model");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

const getAggregateTypeArray = (date = undefined) => {
  /* 
            ------- REFERENCE -------- 
  
  Mongodb aggregate Nested Group (no date) Stack Overflow. 
  Available at: https://stackoverflow.com/questions/42456436/mongodb-aggregate-nested-group 
  (Accessed: February 19, 2023). 
  */
  if (date === undefined) {
    return [
      {
        $group: {
          _id: { date: "$date", puzzleType: "$puzzleType" },
          count: {
            $sum: 1,
          },
        },
      },

      {
        $group: {
          _id: "$_id.date",
          puzzleCount: {
            $push: {
              puzzleType: "$_id.puzzleType",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];
  } else {
    return [
      { $match: { date: { $gte: date } } },
      {
        $group: {
          _id: { date: "$date", puzzleType: "$puzzleType" },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          puzzleCount: {
            $push: {
              puzzleType: "$_id.puzzleType",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];
  }
};

const getAggregateDifficultyArray = (date = undefined) => {
  /* 
              ------- REFERENCE -------- 
    
    Mongodb aggregate Nested Group (no date) Stack Overflow. 
    Available at: https://stackoverflow.com/questions/42456436/mongodb-aggregate-nested-group 
    (Accessed: February 19, 2023). 
    */
  if (date === undefined) {
    return [
      {
        $group: {
          _id: { date: "$date", difficulty: "$difficulty" },
          count: {
            $sum: 1,
          },
        },
      },

      {
        $group: {
          _id: "$_id.date",
          puzzleCount: {
            $push: {
              difficulty: "$_id.difficulty",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];
  } else {
    return [
      { $match: { date: { $gte: date } } },
      {
        $group: {
          _id: { date: "$date", difficulty: "$difficulty" },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          puzzleCount: {
            $push: {
              difficulty: "$_id.difficulty",
              count: "$count",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ];
  }
};

const generateDatesArray = (from, till, fields) => {
  let dates = [];
  const oneDay = 1000 * 60 * 60 * 24;

  while (from.getTime() <= till.getTime()) {
    dates.push({
      date: from,
      count: {
        ...fields,
      },
    });
    from = new Date(from.getTime() + oneDay);
  }

  return dates;
};

const generateDates = () => {
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

  return { now, lastWeek, lastMonth, last3Months };
};

const fillInArray = (arrayToFillIn, values, field) => {
  let j = 0;
  for (let i = 0; i < arrayToFillIn.length; i++) {
    if (
      j < values.length &&
      arrayToFillIn[i].date.getTime() === values[j]._id.getTime()
    ) {
      for (let k = 0; k < values[j].puzzleCount.length; k++) {
        arrayToFillIn[i].count[values[j].puzzleCount[k][field]] =
          values[j].puzzleCount[k].count;
      }
      j++;
    }
  }
};

exports.getSolvedPuzzlesType = async (req, res, next) => {
  let { now, lastWeek, lastMonth, last3Months } = generateDates();

  const solvedPuzzlesTypeLastWeek = await PuzzleSolved.aggregate(
    getAggregateTypeArray(lastWeek)
  );
  const solvedPuzzlesTypeLastMonth = await PuzzleSolved.aggregate(
    getAggregateTypeArray(lastMonth)
  );
  const solvedPuzzlesTypeLast3Months = await PuzzleSolved.aggregate(
    getAggregateTypeArray(last3Months)
  );
  const solvedPuzzlesTypeAllTime = await PuzzleSolved.aggregate(
    getAggregateTypeArray()
  );

  let allTime =
    solvedPuzzlesTypeAllTime.length > 0
      ? new Date(solvedPuzzlesTypeAllTime[0]._id)
      : now;

  const fields = { sudoku: 0, eights_puzzle: 0, hashi: 0 };
  const lastWeekArray = generateDatesArray(lastWeek, now, fields);
  const lastMonthArray = generateDatesArray(lastMonth, now, fields);
  const last3MonthsArray = generateDatesArray(last3Months, now, fields);
  const allTimeArray = generateDatesArray(allTime, now, fields);

  fillInArray(allTimeArray, solvedPuzzlesTypeAllTime, "puzzleType");
  fillInArray(lastWeekArray, solvedPuzzlesTypeLastWeek, "puzzleType");
  fillInArray(lastMonthArray, solvedPuzzlesTypeLastMonth, "puzzleType");
  fillInArray(last3MonthsArray, solvedPuzzlesTypeLast3Months, "puzzleType");

  res.status(200).json({
    status: "success",
    data: {
      allTimeArray,
      lastWeekArray,
      lastMonthArray,
      last3MonthsArray,
    },
  });
};

exports.getSolvedPuzzlesDifficulty = catchAsync(async (req, res, next) => {
  let { now, lastWeek, lastMonth, last3Months } = generateDates();

  const solvedPuzzlesDifficultyAllTime = await PuzzleSolved.aggregate(
    getAggregateDifficultyArray(undefined)
  );

  const solvedPuzzlesDifficultyLastWeek = await PuzzleSolved.aggregate(
    getAggregateDifficultyArray(lastWeek)
  );

  const solvedPuzzlesDifficultyLastMonth = await PuzzleSolved.aggregate(
    getAggregateDifficultyArray(lastMonth)
  );

  const solvedPuzzlesDifficultyLast3Months = await PuzzleSolved.aggregate(
    getAggregateDifficultyArray(last3Months)
  );

  let allTime =
    solvedPuzzlesDifficultyAllTime.length > 0
      ? new Date(solvedPuzzlesDifficultyAllTime[0]._id)
      : now;

  const fields = { easy: 0, medium: 0, hard: 0 };
  const lastWeekArray = generateDatesArray(lastWeek, now, fields);
  const lastMonthArray = generateDatesArray(lastMonth, now, fields);
  const last3MonthsArray = generateDatesArray(last3Months, now, fields);
  const allTimeArray = generateDatesArray(allTime, now, fields);

  fillInArray(allTimeArray, solvedPuzzlesDifficultyAllTime, "difficulty");
  fillInArray(lastWeekArray, solvedPuzzlesDifficultyLastWeek, "difficulty");
  fillInArray(lastMonthArray, solvedPuzzlesDifficultyLastMonth, "difficulty");
  fillInArray(
    last3MonthsArray,
    solvedPuzzlesDifficultyLast3Months,
    "difficulty"
  );

  res.status(200).json({
    status: "success",
    data: {
      allTimeArray,
      lastWeekArray,
      lastMonthArray,
      last3MonthsArray,
    },
  });
});

exports.newSolvedPuzzle = catchAsync(async (req, res, next) => {
  // let user = jwt.decode(req.cookies.jwt);
  // let userID = user.userID.replace("G" + user.groupID + "-", "");
  const { puzzleID, puzzleType } = req.body;
  const {user}=req
  console.log("hhhhh",user)
  let puzzle = await (puzzleType === "sudoku"
    ? Sudoku
    : puzzleType === "eights_puzzle"
    ? EightsPuzzle
    : Hashi
  ).findOne({ _id: puzzleID });
  /*if (puzzleType === "eights_puzzle") {
    puzzle = await EightsPuzzle.findOne({ _id: puzzleID });
  } else if (puzzleType === "sudoku") {
    puzzle = await Sudoku.findOne({ _id: puzzleID });
  } else if (puzzleType === "hashi") {
    puzzle = await Hashi.findOne({ _id: puzzleID });
  }*/

  if (puzzle === undefined) {
    return next(new AppError("Puzzle ID and type do not match!", 404));
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const newSolvedPuzzle = await PuzzleSolved.create({
    date: today,
    user: user._id,
    puzzle: puzzleID,
    puzzleType,
  });

  res.status(200).json({
    status: "success",
    data: {
      newSolvedPuzzle,
    },
  });
});

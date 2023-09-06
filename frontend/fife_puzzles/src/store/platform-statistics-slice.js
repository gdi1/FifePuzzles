import { createSlice } from "@reduxjs/toolkit";

const platformStatisticsSlice = createSlice({
  name: "platform-statistics",
  initialState: {
    userActivity: {
      currentNumberOfUsers: undefined,
      allUserActivity: [],
      lastWeekUserActivity: [],
      lastMonthUserActivity: [],
      last3MonthsUserActivity: [],

      lastWeekLabels: [],
      lastMonthLabels: [],
      last3MonthsLabels: [],
      allTimeLabels: [],
    },
    puzzleTypeActivity: {
      allPuzzleTypeActivity: [[], [], []],
      lastWeekPuzzleTypeActivity: [[], [], []],
      lastMonthPuzzleTypeActivity: [[], [], []],
      last3MonthsPuzzleTypeActivity: [[], [], []],

      lastWeekLabels: [],
      lastMonthLabels: [],
      last3MonthsLabels: [],
      allTimeLabels: [],
    },
    puzzleDifficultyActivity: {
      allPuzzleDifficultyActivity: [[], [], []],
      lastWeekPuzzleDifficultyActivity: [[], [], []],
      lastMonthPuzzleDifficultyActivity: [[], [], []],
      last3MonthsPuzzleDifficultyActivity: [[], [], []],

      lastWeekLabels: [],
      lastMonthLabels: [],
      last3MonthsLabels: [],
      allTimeLabels: [],
    },
  },
  reducers: {
    setCurrentNumberOfUsers(state, action) {
      state.userActivity.currentNumberOfUsers = action.payload;
    },
    setUserActivity(state, action) {
      state.userActivity.allUserActivity = action.payload.allTimeArray.map(
        (el) => el.count
      );
      state.userActivity.lastWeekUserActivity =
        action.payload.lastWeekArray.map((el) => el.count);
      state.userActivity.lastMonthUserActivity =
        action.payload.lastMonthArray.map((el) => el.count);
      state.userActivity.last3MonthsUserActivity =
        action.payload.last3MonthsArray.map((el) => el.count);

      state.userActivity.lastWeekLabels = action.payload.lastWeekArray.map(
        (el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
      );

      state.userActivity.lastMonthLabels = action.payload.lastMonthArray.map(
        (el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
      );

      state.userActivity.last3MonthsLabels =
        action.payload.last3MonthsArray.map((el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
        );

      state.userActivity.allTimeLabels = action.payload.allTimeArray.map((el) =>
        new Date(el.date).toLocaleDateString(undefined, {
          year: "2-digit",
          month: "short",
          day: "numeric",
        })
      );
    },

    setPuzzleTypeActivity(state, action) {
      state.puzzleTypeActivity.allPuzzleTypeActivity[0] =
        action.payload.allTimeArray.map((el) => el.count.sudoku);

      state.puzzleTypeActivity.allPuzzleTypeActivity[1] =
        action.payload.allTimeArray.map((el) => el.count.eights_puzzle);

      state.puzzleTypeActivity.allPuzzleTypeActivity[2] =
        action.payload.allTimeArray.map((el) => el.count.hashi);

      state.puzzleTypeActivity.lastWeekPuzzleTypeActivity[0] =
        action.payload.lastWeekArray.map((el) => el.count.sudoku);

      state.puzzleTypeActivity.lastWeekPuzzleTypeActivity[1] =
        action.payload.lastWeekArray.map((el) => el.count.eights_puzzle);

      state.puzzleTypeActivity.lastWeekPuzzleTypeActivity[2] =
        action.payload.lastWeekArray.map((el) => el.count.hashi);

      state.puzzleTypeActivity.lastMonthPuzzleTypeActivity[0] =
        action.payload.lastMonthArray.map((el) => el.count.sudoku);

      state.puzzleTypeActivity.lastMonthPuzzleTypeActivity[1] =
        action.payload.lastMonthArray.map((el) => el.count.eights_puzzle);

      state.puzzleTypeActivity.lastMonthPuzzleTypeActivity[2] =
        action.payload.lastMonthArray.map((el) => el.count.hashi);

      state.puzzleTypeActivity.last3MonthsPuzzleTypeActivity[0] =
        action.payload.last3MonthsArray.map((el) => el.count.sudoku);

      state.puzzleTypeActivity.last3MonthsPuzzleTypeActivity[1] =
        action.payload.last3MonthsArray.map((el) => el.count.eights_puzzle);

      state.puzzleTypeActivity.last3MonthsPuzzleTypeActivity[2] =
        action.payload.last3MonthsArray.map((el) => el.count.hashi);

      state.puzzleTypeActivity.lastWeekLabels =
        action.payload.lastWeekArray.map((el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
        );

      state.puzzleTypeActivity.lastMonthLabels =
        action.payload.lastMonthArray.map((el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
        );

      state.puzzleTypeActivity.last3MonthsLabels =
        action.payload.last3MonthsArray.map((el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
        );

      state.puzzleTypeActivity.allTimeLabels = action.payload.allTimeArray.map(
        (el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
      );
    },
    setPuzzleDifficultyActivity(state, action) {
      state.puzzleDifficultyActivity.allPuzzleDifficultyActivity[0] =
        action.payload.allTimeArray.map((el) => el.count.easy);

      state.puzzleDifficultyActivity.allPuzzleDifficultyActivity[1] =
        action.payload.allTimeArray.map((el) => el.count.medium);

      state.puzzleDifficultyActivity.allPuzzleDifficultyActivity[2] =
        action.payload.allTimeArray.map((el) => el.count.hard);

      state.puzzleDifficultyActivity.lastWeekPuzzleDifficultyActivity[0] =
        action.payload.lastWeekArray.map((el) => el.count.easy);

      state.puzzleDifficultyActivity.lastWeekPuzzleDifficultyActivity[1] =
        action.payload.lastWeekArray.map((el) => el.count.medium);

      state.puzzleDifficultyActivity.lastWeekPuzzleDifficultyActivity[2] =
        action.payload.lastWeekArray.map((el) => el.count.hard);

      state.puzzleDifficultyActivity.lastMonthPuzzleDifficultyActivity[0] =
        action.payload.lastMonthArray.map((el) => el.count.easy);

      state.puzzleDifficultyActivity.lastMonthPuzzleDifficultyActivity[1] =
        action.payload.lastMonthArray.map((el) => el.count.medium);

      state.puzzleDifficultyActivity.lastMonthPuzzleDifficultyActivity[2] =
        action.payload.lastMonthArray.map((el) => el.count.hard);

      state.puzzleDifficultyActivity.last3MonthsPuzzleDifficultyActivity[0] =
        action.payload.last3MonthsArray.map((el) => el.count.easy);

      state.puzzleDifficultyActivity.last3MonthsPuzzleDifficultyActivity[1] =
        action.payload.last3MonthsArray.map((el) => el.count.medium);

      state.puzzleDifficultyActivity.last3MonthsPuzzleDifficultyActivity[2] =
        action.payload.last3MonthsArray.map((el) => el.count.hard);

      state.puzzleDifficultyActivity.lastWeekLabels =
        action.payload.lastWeekArray.map((el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
        );

      state.puzzleDifficultyActivity.lastMonthLabels =
        action.payload.lastMonthArray.map((el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
        );

      state.puzzleDifficultyActivity.last3MonthsLabels =
        action.payload.last3MonthsArray.map((el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
        );

      state.puzzleDifficultyActivity.allTimeLabels =
        action.payload.allTimeArray.map((el) =>
          new Date(el.date).toLocaleDateString(undefined, {
            year: "2-digit",
            month: "short",
            day: "numeric",
          })
        );
    },
  },
});

export const psActions = platformStatisticsSlice.actions;

export default platformStatisticsSlice;

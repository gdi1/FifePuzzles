import { createSlice } from "@reduxjs/toolkit";

const userToDisplaySlice = createSlice({
  name: "userToDisplay",
  initialState: {
    user: undefined,
    solvedPuzzlesType: [],
    solvedPuzzlesDifficulty: [],
    userActivity: [],
    userActivity6Months: [],
    userActivityYear: [],
    lastYearLabels: [],
    allTimeLabels: [],
    last6MonthsLabels: [],
    solvedPuzzleTypeLabels: [],
    solvedPuzzleDifficultyLabels: [],
    showUser: false,
    isFetchingRecentUser: false,
  },
  reducers: {
    setUserToDisplay(state, action) {
      state.user = action.payload.user;

      state.userActivity = action.payload.userActivityAllTime.map(
        (el) => el.count
      );
      state.userActivityYear = action.payload.userActivityLastYear.map(
        (el) => el.count
      );
      state.userActivity6Months = action.payload.userActivityLast6Months.map(
        (el) => el.count
      );

      state.solvedPuzzlesType = action.payload.solvedPuzzlesType.map(
        (el) => el.count
      );
      state.solvedPuzzlesDifficulty =
        action.payload.solvedPuzzlesDifficulty.map((el) => el.count);

      state.last6MonthsLabels = action.payload.last6MonthsLabels;
      state.allTimeLabels = action.payload.allTimeLabels;
      state.lastYearLabels = action.payload.lastYearLabels;

      state.solvedPuzzleTypeLabels = action.payload.solvedPuzzlesType.map(
        (el) => el._id
      );
      state.solvedPuzzleDifficultyLabels =
        action.payload.solvedPuzzlesDifficulty.map((el) => el._id);
    },
    resetUserToDisplay(state, action) {
      state.user = undefined;
      state.userActivity = [];
      state.solvedPuzzlesType = [];
      state.solvedPuzzlesDifficulty = [];
      state.showUser = false;
    },

    setShowUser(state, action) {
      state.showUser = action.payload;
    },

    setIsFetchingRecentUser(state, action) {
      state.isFetchingRecentUser = action.payload;
    },
    setUserActive(state, action) {
      if (state.user) {
        state.user.active = action.payload;
      }
    },
  },
});

export const utdActions = userToDisplaySlice.actions;

export default userToDisplaySlice;

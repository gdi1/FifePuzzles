import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./login-slice";
import prSlice from "./promotion-requests-slice";
import fpSlice from "./flagged-puzzles-slice";
import fcSlice from "./flagged-comments-slice";
import platformStatisticsSlice from "./platform-statistics-slice";
import userToDisplaySlice from "./user-to-display-slice";
import puzzleToDisplaySlice from "./puzzle-to-display-slice";

const store = configureStore({
  reducer: {
    login: loginSlice.reducer,
    promotionRequests: prSlice.reducer,
    flaggedPuzzles: fpSlice.reducer,
    flaggedComments: fcSlice.reducer,
    platformStatistics: platformStatisticsSlice.reducer,
    userToDisplay: userToDisplaySlice.reducer,
    puzzleToDisplay: puzzleToDisplaySlice.reducer,
  },
});

export default store;

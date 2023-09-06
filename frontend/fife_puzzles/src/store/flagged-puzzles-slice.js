import { createSlice } from "@reduxjs/toolkit";

const fpSlice = createSlice({
  name: "flagged-puzzles",
  initialState: {
    flaggedPuzzles: [],
    currentLength: 0,
    totalLength: 0,
    hasFetched: false,
  },
  reducers: {
    addEarlierFlaggedPuzzles(state, action) {
      state.flaggedPuzzles.push(...action.payload);
      state.currentLength += action.payload.length;
      state.hasFetched = true;
    },

    addNewFlaggedPuzzle(state, action) {
      const index = state.flaggedPuzzles.findIndex(
        (fp) => fp._id === action.payload._id
      );
      if (index === -1) {
        state.flaggedPuzzles.unshift(action.payload);
        state.currentLength++;
        state.totalLength++;
      }
    },

    resolveFlaggedPuzzle(state, action) {
      state.flaggedPuzzles = state.flaggedPuzzles.filter(
        (fp) => fp._id !== action.payload
      );
      if (
        state.currentLength !== 0 &&
        state.flaggedPuzzles.length === state.currentLength - 1
      ) {
        state.currentLength--;
        state.totalLength--;
      } else if (state.currentLength === 0 && !state.hasFetched) {
        state.totalLength--;
      }
    },

    setTotalLength(state, action) {
      state.totalLength = action.payload;
    },
  },
});

export const fpActions = fpSlice.actions;

export default fpSlice;

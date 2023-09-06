import { createSlice } from "@reduxjs/toolkit";

const fcSlice = createSlice({
  name: "flagged-comments",
  initialState: {
    flaggedComments: [],
    currentLength: 0,
    totalLength: 0,
    hasFetched: false,
  },
  reducers: {
    addEarlierFlaggedComments(state, action) {
      state.flaggedComments.push(...action.payload);
      state.currentLength += action.payload.length;
      state.hasFetched = true;
    },

    addNewFlaggedComment(state, action) {
      const index = state.flaggedComments.findIndex(
        (fp) => fp._id === action.payload._id
      );
      if (index === -1) {
        state.flaggedComments.unshift(action.payload);
        state.currentLength++;
        state.totalLength++;
      }
    },

    resolveFlaggedComment(state, action) {
      state.flaggedComments = state.flaggedComments.filter(
        (fp) => fp._id !== action.payload
      );
      if (
        state.currentLength !== 0 &&
        state.flaggedComments.length === state.currentLength - 1
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

export const fcActions = fcSlice.actions;

export default fcSlice;

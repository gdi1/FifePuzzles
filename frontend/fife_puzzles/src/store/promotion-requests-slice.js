import { createSlice } from "@reduxjs/toolkit";

const prSlice = createSlice({
  name: "promotion-requests",
  initialState: {
    promotionRequests: [],
    currentLength: 0,
    totalLength: 0,
    hasFetched: false,
  },
  reducers: {
    addEarlierPromotionRequests(state, action) {
      state.promotionRequests.push(...action.payload);
      state.currentLength += action.payload.length;
      state.hasFetched = true;
    },

    addNewPromotionRequest(state, action) {
      const index = state.promotionRequests.findIndex(
        (pr) => pr._id === action.payload._id
      );
      if (index === -1) {
        state.promotionRequests.unshift(action.payload);
        state.currentLength++;
        state.totalLength++;
      }
    },

    resolvePromotionRequest(state, action) {
      state.promotionRequests = state.promotionRequests.filter(
        (pr) => pr._id !== action.payload
      );
      if (
        state.currentLength !== 0 &&
        state.promotionRequests.length === state.currentLength - 1
      ) {
        state.currentLength--;
        state.totalLength--;
      } else if (
        state.totalLength > 0 &&
        state.currentLength === 0 &&
        !state.hasFetched
      ) {
        state.totalLength--;
      }
    },

    setTotalLength(state, action) {
      state.totalLength = action.payload;
    },
  },
});

export const prActions = prSlice.actions;

export default prSlice;

import { createSlice } from "@reduxjs/toolkit";

const puzzleToDisplaySlice = createSlice({
  name: "puzzleToDisplay",
  initialState: {
    puzzle: undefined,
    numberOfUsersThatSolvedIt: undefined,
    search: {
      puzzleType: "sudoku",
    },
    isFetchingRecentPuzzle: false,
    showPuzzle: false,
  },
  reducers: {
    resetPuzzleToDisplay(state, action) {
      state.puzzle = undefined;
      state.numberOfUsersThatSolvedIt = undefined;
    },
    setSearchPuzzleType(state, action) {
      state.search.puzzleType = action.payload;
    },
    setSearchPuzzle(state, action) {
      state.puzzle = action.payload.puzzle;
      state.numberOfUsersThatSolvedIt =
        action.payload.numberOfUsersThatSolvedIt;
    },
    setIsFetchingPuzzle(state, action) {
      state.isFetchingRecentPuzzle = action.payload;
    },
    setShowPuzzle(state, action) {
      state.showPuzzle = action.payload;
    },
    setPuzzleActive(state, action) {
      if (state.puzzle) {
        state.puzzle.active = action.payload;
      }
    },
  },
});

export const ptdActions = puzzleToDisplaySlice.actions;

export default puzzleToDisplaySlice;

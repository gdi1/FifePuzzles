const main = require("./../AI/SudokuSolver");
const sudoku = require("./sudokuFiles/sudoku.json");
const hardSudoku = require("./sudokuFiles/hardSudoku.json");
const multiSolution = require("./sudokuFiles/twoPossibleSudoku.json");
const wrongSolution = require("./sudokuFiles/wrongSolution.json");
const emptySolution = require("./sudokuFiles/emptySudoku.json");
const easySudoku = require("./sudokuFiles/easySudoku.json");
const unsolvableInitial = require("./sudokuFiles/unsolvableInitialLayout.json");

test("Solve a regular sudoku", () => {
  let result = main(sudoku.values, sudoku.solution);
  expect(result.valid).toBe(true);
});

test("Solve a hard sudoku", () => {
  let result = main(hardSudoku.values, null);
  expect(result.valid).toBe(true);
});

test("Invalidate a sudoku with multiple solutions", () => {
  let result = main(multiSolution.values, null);
  expect(result.valid).toBe(false);
});

test("Invalidate a sudoku where the solution found by the solver doesn't match the JSON's solution", () => {
  let result = main(wrongSolution.values, wrongSolution.solution);
  expect(result.valid).toBe(false);
});

test("Check that two puzzles can be solved", () => {
  let result = main(sudoku.values, sudoku.solution);
  expect(result.valid).toBe(true);
  result = main(hardSudoku.values, null);
  expect(result.valid).toBe(true);
});

test("Check that after a valid sudoku, an invalid sudoku is correctly identified", () => {
  let result = main(sudoku.values, sudoku.solution);
  expect(result.valid).toBe(true);
  result = main(multiSolution.values, null);
  expect(result.valid).toBe(false);
});

test("Check that after an invalid sudoku, a valid sudoku is correctly identified", () => {
  let result = main(multiSolution.values, null);
  expect(result.valid).toBe(false);
  result = main(sudoku.values, sudoku.solution);
  expect(result.valid).toBe(true);
});

test("Check that two invalid sudokus can be identified correctly", () => {
  let result = main(multiSolution.values, null);
  expect(result.valid).toBe(false);
  result = main(wrongSolution.values, wrongSolution.solution);
  expect(result.valid).toBe(false);
});

test("Check that a sudoku puzzle with not enough filled in starting cells is identified as invalid", () => {
  let result = main(emptySolution.values, null);
  expect(result.valid).toBe(false);
});

test("Check that a sudoku puzzle can be solved if no choices need to be made", () => {
  let result = main(easySudoku.values, null);
  expect(result.valid).toBe(true);
});

test("Check that a sudoku puzzle that has an unsolvable layout from the start is identified as invalid", () => {
  let result = main(unsolvableInitial.values, null);
  expect(result.valid).toBe(false);
});

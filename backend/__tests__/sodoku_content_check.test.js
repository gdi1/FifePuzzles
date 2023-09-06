const checkContent = require("../supporting_functions/sodoku_content_check");
const sudoku = require("./sudokuFiles/sudoku.json");
const incompleteSudoku = require("./sudokuFiles/incompleteSudokuFile.json");
const tooLargeSudoku = require("./sudokuFiles/tooLargeSudoku.json");
const misMatchedSudoku = require("./sudokuFiles/mismatchedStartSolution.json");
const wrongSolution = require("./sudokuFiles/wrongSolution.json");
const differentRowColumns = require("./sudokuFiles/differentRowColumns.json");
const lowDifficulty = require("./sudokuFiles/lowDifficulty.json");
const highDifficulty = require("./sudokuFiles/highDifficulty.json");
const magicEights = require("./sudokuFiles/magicEights.json");
const stringSudoku = require("./sudokuFiles/stringSudokuArray.json");
const lettersSudoku = require("./sudokuFiles/lettersSudoku.json");

test("Validate a 9x9 sudoku", () => {
    expect(checkContent(sudoku)).toBe(true);
});

test("Invalidate a sudoku missing a property", () => {
    expect(checkContent(incompleteSudoku)).toBe(false);
});

test("Invalidate a sudoku with a number outside the expected range", () => {
    expect(checkContent(tooLargeSudoku)).toBe(false);
});

test("Invalidate a sudoku where the starting values don't match with the solution", () => {
    expect(checkContent(misMatchedSudoku)).toBe(false);
});

test("Invalidate a sudoku where a value appears in a location it shouldn't in the solution", () => {
    expect(checkContent(wrongSolution)).toBe(false);
});

test("Invalidate a sudoku if the number of rows and columns don't match", () => {
    expect(checkContent(differentRowColumns)).toBe(false);
});

test("Invalidate a sudoku with a difficulty less than 1", () => {
    expect(checkContent(lowDifficulty)).toBe(false);
});

test("Invalidate a sudoku with a difficulty greater than 100", () => {
    expect(checkContent(highDifficulty)).toBe(false);
});

test("Invalidate a non sudoku puzzle", () => {
    expect(checkContent(magicEights)).toBe(false);
});

// The sudoku is valid if you convert each letter to a number a=1, b=2 etc. but we only want sudokus to be made of 2D arrays of 1-9
test("Invalidate a sudoku made of strings rather than arrays", () => {
    expect(checkContent(stringSudoku)).toBe(false);
})

test("Invalidate a sudoku made of a 2D Array but each entry is a character instead of a number", () => {
    expect(checkContent(lettersSudoku)).toBe(false);
});
const checkContent = require("../supporting_functions/hashi_content_check");
const hashi = require("./sudokuFiles/easyHashi9x13.json");
const incompleteHashi = require("./sudokuFiles/incompleteHashi.json");
const wrongFieldTypeHashi = require("./sudokuFiles/wrongFieldTypeHashi.json");
const sudoku = require("./sudokuFiles/sudoku.json");
const tooHighDifficultyHashi = require("./sudokuFiles/tooHighDifficultyHashi.json");
const tooLowDifficultyHashi = require("./sudokuFiles/tooLowDifficultyHashi.json");
const hashiDifferentDimensions = require("./sudokuFiles/hashiDifferentDimensions.json");
const hashiStartingBridges = require("./sudokuFiles/hashiStartingBridges.json");
const hashiLetters = require("./sudokuFiles/hashiLetters.json");
const hashiDifferentNumberSolution = require("./sudokuFiles/hashiDifferentNumberSolution.json");
const hashiNewNumberSolution = require("./sudokuFiles/hashiNewNumberSolution.json");
const hashiIncorrectNumberBridges = require("./sudokuFiles/hashiIncorrectNumberBridges.json");
const hashiInvalidBridge = require("./sudokuFiles/hashiInvalidBridge.json")
const hashiMultipleIslands = require("./sudokuFiles/hashiMultipleIslands.json");

test("Validate a normal hashi", () => {
    expect(checkContent(hashi)).toBe(true);
});

test("Invalidate a hashi missing a property", () => {
    expect(checkContent(incompleteHashi)).toBe(false);
});

test("Invalidate a hashi with wrong field type", () => {
    expect(checkContent(wrongFieldTypeHashi)).toBe(false);
});

test("Invalidate a non hashi", () => {
    expect(checkContent(sudoku)).toBe(false);
});

test("Invalidate a hashi with too high difficulty", () => {
    expect(checkContent(tooHighDifficultyHashi)).toBe(false);
});

test("Invalidate a hashi with too low difficulty", () => {
    expect(checkContent(tooLowDifficultyHashi)).toBe(false);
});

test("Invalidate a hashi with a solution with different dimensions", () => {
    expect(checkContent(hashiDifferentDimensions)).toBe(false);
});

test("Invalidate a hashi that has bridges in the starting position", () => {
    expect(checkContent(hashiStartingBridges)).toBe(false);
});

test("Invalidate a hashi that has letters in either values or solution", () => {
    expect(checkContent(hashiStartingBridges)).toBe(false);
});

test("Invalidate a hashi where a number in the solution does not match the starting position", () => {
    expect(checkContent(hashiDifferentNumberSolution)).toBe(false);
});

test("Invalidate a hashi where there is an extra number in the solution that is not in the starting position", () => {
    expect(checkContent(hashiNewNumberSolution)).toBe(false);
});

test("Invalidate a hashi where a number does not have the correct number of bridges connected to it", () => {
    expect(checkContent(hashiIncorrectNumberBridges)).toBe(false);
});

test("Invalidate a hashi with an invalid bridge", () => {
    expect(checkContent(hashiInvalidBridge)).toBe(false);
});

test("Invalidate a hashi with multiple islands", () => {
    expect(checkContent(hashiMultipleIslands)).toBe(false);
});
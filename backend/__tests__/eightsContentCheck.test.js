const checkContent = require("../supporting_functions/eights_content_check");
const eights = require("./sudokuFiles/trivialEights.json");
const incompleteEights = require("./sudokuFiles/incompleteEights.json");
const wrongFieldTypeEights = require("./sudokuFiles/wrongFieldTypeEights.json");
const sudoku = require("./sudokuFiles/sudoku.json");
const tooHighDifficultyEights = require("./sudokuFiles/tooHighDifficultyEights.json");
const tooLowDifficultyEights = require("./sudokuFiles/tooLowDifficultyEights.json");
const eights2x2 = require("./sudokuFiles/eights2x2.json");
const eightsDuplicateNumbers = require("./sudokuFiles/eightsDuplicateNumbers.json");
const eightsInvalidNumber = require("./sudokuFiles/eightsInvalidNumber.json");
const eightsString = require("./sudokuFiles/eightsString.json");
const eightsImpossible = require("./sudokuFiles/eightsImpossible.json");

test("Validate a normal eights puzzle", () => {
    expect(checkContent(eights)).toBe(true);
});

test("Invalidate an eights puzzle missing a property", () => {
    expect(checkContent(incompleteEights)).toBe(false);
});

test("Invalidate an eights puzzle with wrong field type", () => {
    expect(checkContent(wrongFieldTypeEights)).toBe(false);
});

test("Invalidate a non eights puzzle", () => {
    expect(checkContent(sudoku)).toBe(false);
});

test("Invalidate an eights puzzle with too high difficulty", () => {
    expect(checkContent(tooHighDifficultyEights)).toBe(false);
});

test("Invalidate an eights puzzle with too low difficulty", () => {
    expect(checkContent(tooLowDifficultyEights)).toBe(false);
});

test("Invalidate an eights puzzle that is not 3x3", () => {
    expect(checkContent(eights2x2)).toBe(false);
});

test("Invalidate an eights puzzle that contains duplicate numbers", () => {
    expect(checkContent(eightsDuplicateNumbers)).toBe(false);
});

test("Invalidate an eights puzzle that contains a number outside of expected range", () => {
    expect(checkContent(eightsInvalidNumber)).toBe(false);
});

test("Invalidate an eights puzzle that contains a string in the puzzle", () => {
    expect(checkContent(eightsString)).toBe(false);
});

test("Invalidate an eights puzzle where it is impossible to reach the solution", () => {
    expect(checkContent(eightsImpossible)).toBe(false);
});
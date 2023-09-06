const findDifficulty = require("../supporting_functions/sodoku_difficulty");
const sudoku = require("./sudokuFiles/sudoku.json");

test("Check that a sudoku is allocated an integer", () => {
    let result = findDifficulty(sudoku.values);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
});
const findDifficulty = require("../supporting_functions/hashi_difficulty");
const hashi = require("./sudokuFiles/expertHashi9x13.json");

test("Check that a hashi is allocated an integer", () => {
    let result = findDifficulty(hashi.values);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
});
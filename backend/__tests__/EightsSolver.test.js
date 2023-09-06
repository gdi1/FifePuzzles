const main = require("./../AI/EightsSolver");

test("Solve an easy puzzle", () => {
    let result = main([[1, 2, 3], [4, 5, 6], [7, null, 8]]);
    expect(result).toBe(true);
});

test("Solve puzzle with more steps", () => {
    let result = main([[1, 2, null], [5, 7, 3], [4, 8, 6]]);
    expect(result).toBe(true);
});

test("Be able to identify an unsolvable puzzle", () => {
    let result = main([[2, 1, 3], [4, 5, 6], [7, 8, null]]);
    expect(result).toBe(false);
});
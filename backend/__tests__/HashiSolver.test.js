const main = require("../AI/HashiSolver");
const h1 = 11;
const h2 = 12;
const v1 = 21;
const v2 = 22;

// Valid Hashi Puzzles taken from Professor Layton and the Miracle Mask daily puzzles (If anyone was wondering (you weren't))

// The Alchemists's Lair 01
test("Solve an easy Hashi", () => {
    let result = main([[4, 0, 6, 0, 3], [0, 0, 0, 1, 0], [4, 0, 3, 0, 0], [0, 0, 0, 0, 1], [2, 0, 0, 2, 0]],[[4, h2, 6, h2, 3], [v2, 0, v2, 1, v1], [4, h1, 3, v1, v1], [v1, 0, 0, v1, 1], [2, h1, h1, 2, 0]]);
    expect(result.valid).toBe(true);
});

// The Alchemist's Lair 05
test("Solve a regular Hashi", () => {
    let result = main([[1, 0, 2, 0, 0, 2, 0, 3, 0], [0, 0, 0, 3, 0, 0, 1, 0, 2], [4, 0, 4, 0, 0, 0, 0, 0, 0], [0, 2, 0, 8, 0, 5, 0, 3, 0], [3, 0, 1, 0, 0, 0, 0, 0, 3], [0, 0, 0, 0, 1, 0, 0, 3, 0], [3, 0, 0, 3, 0, 2, 0, 0, 3], [0, 1, 0, 0, 3, 0, 0, 3, 0], [3, 0, 4, 0, 0, 0, 3, 0, 3]], [[1, 0, 2, 0, 0, 2, h2, 3, 0], [v1, 0, v2, 3, h1, h1, 1, v1, 2], [4, h2, 4, v2, 0, 0, 0, v1, v2], [v1, 2, h2, 8, h2, 5, h1, 3, v2], [3, h1, 1, v2, 0, v2, 0, v1, 3], [v1, 0, 0, v2, 1, v2, 0, 3, v1], [3, h1, h1, 3, v1, 2, 0, v2, 3], [v1, 1, h1, h1, 3, h1, h1, 3, v2], [3, h2, 4, h2, h2, h2, 3, h1, 3]])
    expect(result.valid).toBe(true);
})

// The Alchemist's Lair 18
test("Solve a hard Hashi", () => {
    let result = main([[3, 0, 0, 3, 0, 3, 0, 0, 3, 0, 3, 0, 0, 2], [0, 1, 0, 0, 0, 0, 2, 0, 0, 4, 0, 0, 2, 0], [3, 0, 0, 2, 0, 2, 0, 2, 0, 0, 2, 0, 0, 4], [0, 4, 0, 0, 0, 0, 3, 0, 2, 0, 0, 0, 0, 0], [3, 0, 2, 0, 3, 0, 0, 4, 0, 4, 0, 0, 2, 0], [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2], [3, 0, 1, 0, 0, 2, 0, 3, 0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 3, 0, 0, 0, 5, 0, 0, 3, 0, 1], [2, 0, 0, 2, 0, 0, 3, 0, 0, 3, 0, 0, 2, 0]], [
        [3, h1, h1, 3, h1, 3, h1, h1, 3, h2, 3, h1, h1, 2],
        [v2, 1, 0, v1, 0, v1, 2, h1, h1, 4, h2, h2, 2, v1],
        [3, v1, 0, 2, h1, 2, v1, 2, 0, v1, 2, h2, h2, 4],
        [v1, 4, h2, h2, h2, h2, 3, v2, 2, v1, 0, 0, 0, v1],
        [3, v1, 2, h1, 3, h1, h1, 4, v2, 4, h1, h1, 2, v1],
        [v2, 2, v1, 0, v1, 0, 0, v1, v2, v2, 0, 1, v1, 2],
        [3, v1, 1, 0, v1, 2, h2, 3, v2, 2, 0, v1, v1, v1],
        [v1, 2, h1, h1, 3, h1, h1, h1, 5, h2, h2, 3, v1, 1],
        [2, h1, h1, 2, h1, h1, 3, h2, h2, 3, h1, h1, 2, 0]
    ]);
    expect(result.valid).toBe(true);
})

// Recognising a puzzle with no solutions
test("Puzzle with no solution", () => {
    let result = main([[2, 0, 0, 0, 2], [0, 0, 0, 0, 0], [4, 0, 3, 0, 4]], null)
    expect(result.valid).toBe(false)
})

// Recognising a puzzle with multiple solutions
test("Puzzle with 2 solutions", () => {
    let result = main([[3, 0, 3], [0, 0, 0], [3, 0, 3]], null)
    expect(result.valid).toBe(false);
})

// Recognising an invalid puzzle with an initial impossible island
test("Puzzle with invalid start islands", () => {
    let result = main([[2, 0, 0], [0, 1, 0]], null)
    expect(result.valid).toBe(false)
})

test("Empty Hashi is identified as invalid", () => {
    let result = main([[0, 0, 0], [0, 0, 0], [0, 0, 0]], null)
    expect(result.valid).toBe(false);
})
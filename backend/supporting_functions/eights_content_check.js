module.exports=function checkContent8sPuzzle(puzzle) {
    const EightsSolverMain = require('../AI/EightsSolver.js');

    //check mandatory fields of puzzle are present and that values are of the correct type
    if (!(puzzle.hasOwnProperty('puzzle-type') && puzzle.hasOwnProperty('values') && typeof puzzle["puzzle-type"] === "string" && Array.isArray(puzzle.values))) {
        return false;
    }
    //if non-mandatory fields are present, check they are of the correct type
    if ((puzzle.hasOwnProperty('creator-id') && typeof puzzle['creator-id'] !== "string") || (puzzle.hasOwnProperty('checker-id') && typeof puzzle['checker-id'] !== "string") || (puzzle.hasOwnProperty('difficulty') && typeof puzzle['difficulty'] !== "number")) {
        return false;
    }

    // Check that the puzzle-type is correct for a eights puzzle
    if (puzzle["puzzle-type"] !== "8s_puzzle") {
        return false;
    }

    // Check that difficulty is in the correct range
    if (puzzle.difficulty > 100 || puzzle.difficulty < 0) {
        return false;
    }

    let noColumns = puzzle.values.length;
    let noRows = puzzle.values[0].length;

    // Our current implementation only works with 3x3 puzzles but we can remove this later on to allow more puzzles of
    // different sizes
    if (noColumns !== 3 || noColumns != noRows) {
        return false;
    }

    // Check that the puzzle is a square and that each row is an Array
    for (let currentRow = 0; currentRow < noColumns; currentRow++) {
        // Checks that the number of entries in each row is equal to the number of columns
        if (!Array.isArray(puzzle.values[currentRow]) || puzzle.values[currentRow].length !== noColumns) {
            return false;
        }
    }

    const eightsValues = new Set([]);
    for (let i = 1; i < noColumns * noRows; i++) {
        eightsValues.add(i);
    }
    
    //check that puzzle contains unique numbers
    const start = new Set([]);
    for (let i = 0; i < noColumns; i++) {
        for (let j = 0; j < noRows; j++) {
            start.add(puzzle.values[i][j]);
        }
    }

    //check all values are unique
    if (start.size !== noColumns * noRows) {
        return false;
    }

    //check that the numbers are in the correct range
    for (let i = 1; i < noColumns * noRows; i++) {
        if (!start.has(i)) {
            return false;
        }
    }

    //check that there is a blank square
    if (!start.has(null)) {
        return false;
    }

    //check that solution can be reached from starting position
    if (!EightsSolverMain(puzzle.values)) {
        return false;
    }

    return true;
}
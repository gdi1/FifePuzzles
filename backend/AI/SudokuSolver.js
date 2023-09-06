// Required global Variables
let puzzle;
let solution;
let cellsToFill;
// Flag to indicate if we have found a solution for the current puzzle
let hasSolution;
// Counter to check if we had to make a choice somewhere to solve this sudoku
let choicesMade;

// We organise the PuzzleBlocks based on the number of possibilities a cell has for numbers
let cellOrganiser;

class PuzzleBlock {
    constructor(ax, ay, puzzle) {

        // The coordinates of this PuzzleBlock
        this.x = ax;
        this.y = ay;

        // The coordinates of the top left corner of the square this PuzzleBlock is located
        this.topX = ax - (ax % 3);
        this.topY = ay - (ay % 3);

        // The possible values this puzzle block can take
        // The index represents the value (index 0 = value 1 etc.) and the boolean variables represent if the value is valid
        // in its column, row, and box respectively
        this.possibilities = [[true, true, true], [true, true, true], [true, true, true], [true, true, true], [true, true, true], [true, true, true], [true, true, true], [true, true, true], [true, true, true]];
        this.possibilitiesLeft = 9;

        // Check the column to remove possibilities
        for (let currentX = 0; currentX < 9; currentX++) {
            // Checks if the current cell is a number
            if (typeof puzzle[currentX][ay] === "number" && puzzle[currentX][ay] > 0 && puzzle[currentX][ay] < 10) {
                this.possibilities[puzzle[currentX][ay] - 1][0] = false;
            }
        }

        // Check the row to remove possibilities
        for (let currentY = 0; currentY < 9; currentY++) {
            if (typeof puzzle[ax][currentY] === "number" && puzzle[ax][currentY] > 0 && puzzle[ax][currentY] < 10) {
                this.possibilities[puzzle[ax][currentY] - 1][1] = false;
            }
        }

        // Check the box to remove possibilities
        for (let currentBlockX = this.topX; currentBlockX < this.topX + 3; currentBlockX++) {
            for (let currentBlockY = this.topY; currentBlockY < this.topY + 3; currentBlockY++) {
                if (typeof puzzle[currentBlockX][currentBlockY] === "number" && puzzle[currentBlockX][currentBlockY] > 0 && puzzle[currentBlockX][currentBlockY] < 10) {
                    this.possibilities[puzzle[currentBlockX][currentBlockY] - 1][2] = false;
                }
            }
        }

        // Check each possibility to see how many possible values the cell can have
        for (let possibilityIndex = 0; possibilityIndex < 9; possibilityIndex++) {
            // If the value isn't possible in any one direction then it isn't a possibility at all for the current cell
            if (!this.possibilities[possibilityIndex][0] || !this.possibilities[possibilityIndex][1] || !this.possibilities[possibilityIndex][2]) {
                this.possibilitiesLeft--;
            }
        }
    }

    // Used to add a possible value back to the cell when we are undoing previously made moves
    addPossibility(newPossibility, directionChecked) {

        let alreadyPossible = false;

        if (this.possibilities[newPossibility - 1][0] && this.possibilities[newPossibility - 1][1] && this.possibilities[newPossibility - 1][2]) {
            alreadyPossible = true;
        }

        // The possibility is now valid in the direction that was affected
        this.possibilities[newPossibility - 1][directionChecked] = true;

        // If the possibility is valid in all 3 directions then it becomes a valid possibility again
        if (!alreadyPossible && this.possibilities[newPossibility - 1][0] && this.possibilities[newPossibility - 1][1] && this.possibilities[newPossibility - 1][2]) {
            this.possibilitiesLeft++;
            // Flag to indicate the number of possibilities has increased
            return true;
        }

        // Flag to indicate the number of possibilities hasn't increased
        return false;
    }

    // Used to indicate when a cell has been filled in and as such it no longer valid in a certain direction for the current cell
    removePossibility(possibilityToRemove, directionChecked) {

        // Flag to indicate if the number of possibilities in the cell decreased
        let possibilitiesDecreased = false;

        // Checks if the possibility was possible before the new cell inputted it as a value
        if (this.possibilities[possibilityToRemove - 1][0] && this.possibilities[possibilityToRemove - 1][1] && this.possibilities[possibilityToRemove - 1][2]) {
            this.possibilitiesLeft--;
            possibilitiesDecreased = true;
        }

        // The possibility is no longer valid in this cell due to it being used in the inidcated direction
        this.possibilities[possibilityToRemove - 1][directionChecked] = false;

        return possibilitiesDecreased;
    }

    // Iterates through the possibility array when there is only one possibility and returns the one possibility
    getPossibility() {

        let currentIndex = 0;
        // Iterates through the possibility array until the oissibility with 3 trues in all directions is found
        while (!this.possibilities[currentIndex][0] || !this.possibilities[currentIndex][1] || !this.possibilities[currentIndex][2]) {
            currentIndex++;
        }

        // Returns the only possibility avaliable for this cell
        return currentIndex + 1;
    }
}

// Checks that the solution we find is the same as the provided solution otherwise the puzzle is invalid
function checkAgainstSolution() {

    // Iterate through the solution and puzzle and check that all the values are the same
    for (let currentX = 0; currentX < 9; currentX++) {
        for (let currentY = 0; currentY < 9; currentY++) {

            // Check for a discrepancy
            if (puzzle[currentX][currentY] !== solution[currentX][currentY]) {
                // The solution and found solution are different so the puzzle is invalid
                return false;
            }
        }
    }

    // The solutions are identical so we can assume for now that the puzzle is still valid
    return true;
}

function createPuzzleBlocks() {

    // Start by iterating through the puzzle grid to get the list of cells that need solving
    for (let currentPuzzleX = 0; currentPuzzleX < 9; currentPuzzleX++) {
        for (let currentPuzzleY = 0; currentPuzzleY < 9; currentPuzzleY++) {

            // Check if the current cell doesn't have a starting value
            if (puzzle[currentPuzzleX][currentPuzzleY] === 0 || puzzle[currentPuzzleX][currentPuzzleY] < 1 || puzzle[currentPuzzleX][currentPuzzleY] > 9) {

                // Creates a puzzleBlock object to store the information about the possibilities of the current cell
                let currentPuzzleBlock = new PuzzleBlock(currentPuzzleX, currentPuzzleY, puzzle);
                //We have found another cell which we need to fill in
                cellsToFill++;
                // Adds the puzzle block to the puzzle array so we can update it as we add answers to the puzzle
                puzzle[currentPuzzleX][currentPuzzleY] = currentPuzzleBlock;

                // Checks that the cell has possibilities
                if (currentPuzzleBlock.possibilitiesLeft > 0) {
                    // Updates the array of PuzzleBlocks for the number of possibilities by adding the new cell block
                    cellOrganiser.get(currentPuzzleBlock.possibilitiesLeft).push(currentPuzzleBlock);
                }
                // There is a cell with no initial possible values meaning that the puzzle is invalid
                else {
                    return false;
                }
            }
        }
    }
    // All cells have possible inputs so the puzzle looks valid at the start
    return true;
}

function revertArray() {

    // Iterate through the sudoku puzzle
    for (let currentX = 0; currentX < 9; currentX++) {
        for (let currentY = 0; currentY < 9; currentY++) {
            // Check if we have a puzzleCell object
            if (typeof puzzle[currentX][currentY] === "object") {
                // Revert it back to a null entry to put the puzzle array back in the initial state
                puzzle[currentX][currentY] = 0;
            }
        }
    }
}

function moveCell(puzzleCell, direction) {

    // Gets the array containing the old PuzzleBlock so we can remove it
    let arrayToRemoveBlock = cellOrganiser.get(puzzleCell.possibilitiesLeft + direction);

    // Find puzzleCell in its old Map array
    let currentIndex = 0;

    while (arrayToRemoveBlock[currentIndex] !== puzzleCell) {
        currentIndex++;
    }

    // Splice the PuzzleBlock out of the old Array
    arrayToRemoveBlock.splice(currentIndex, 1);

    // Add the puzzleCell to its new possibility array
    cellOrganiser.get(puzzleCell.possibilitiesLeft).push(puzzleCell);
}

function removePossibilites(currentCell, value) {

    let puzzleCell;

    // Look at the column
    for (let currentX = 0; currentX < 9; currentX++) {

        puzzleCell = puzzle[currentX][currentCell.y];
        if (typeof puzzleCell === "object") {

            // If we reduced the number of possible values the cell can have and the cell has some cell possibilities then we
            // change its position in the map
            if (puzzleCell.removePossibility(value, 0) && puzzleCell.possibilitiesLeft > 0) {
                // We need to move PuzzleBlock to a lower Map array
                moveCell(puzzleCell, 1);
            }
            // Checks if the cell has no more possible inputs
            else if (puzzleCell.possibilitiesLeft === 0) {
                // We have reached an invalid state where there is a cell with no possible values
                return false;
            }
        }
    }

    // Look at the row
    for (let currentY = 0; currentY < 9; currentY++) {

        puzzleCell = puzzle[currentCell.x][currentY];
        if (typeof puzzleCell === "object") {

            // If we reduced the number of possible values the cell can have and the cell has some cell possibilities then we
            // change its position in the map
            if (puzzleCell.removePossibility(value, 1) && puzzleCell.possibilitiesLeft > 0) {
                // We need to move PuzzleBlock to a lower Map array
                moveCell(puzzleCell, 1);
            }
            // Checks if the cell has no more possible inputs
            else if (puzzleCell.possibilitiesLeft === 0) {
                // We have reached an invalid state where there is a cell with no possible values
                return false;
            }
        }
    }

    // Look at the square
    for (let currentX = currentCell.topX; currentX < currentCell.topX + 3; currentX++) {
        for (let currentY = currentCell.topY; currentY < currentCell.topY + 3; currentY++) {

            puzzleCell = puzzle[currentX][currentY];
            if (typeof puzzleCell === "object") {

                // If we reduced the number of possible values the cell can have and the cell has some cell possibilities then we
                // change its position in the map
                if (puzzleCell.removePossibility(value, 2) && puzzleCell.possibilitiesLeft > 0) {
                    // We need to move PuzzleBlock to a lower Map array
                    moveCell(puzzleCell, 1);
                }
                // Checks if the cell has no more possible inputs
                else if (puzzleCell.possibilitiesLeft === 0) {
                    // We have reached an invalid state where there is a cell with no possible values
                    return false;
                }
            }
        }
    }

    // We are still in a valid game state where all cells have a possible input
    return true;
}

function addPossibilities(currentCell) {

    // Get the value that was inputted in the cell
    let input = puzzle[currentCell.x][currentCell.y];
    let puzzleCell;

    // Checks the column
    for (let currentX = 0; currentX < 9; currentX++) {

        puzzleCell = puzzle[currentX][currentCell.y];

        // Check if removing the input from the puzzle added a new possibility to the current empty cell
        if (typeof puzzleCell === "object" && puzzleCell.addPossibility(input, 0) && puzzleCell.possibilitiesLeft > 1) {
            // Move the puzzleCell to a higher Map array
            moveCell(puzzleCell, -1);
        }
    }

    // Checks the row
    for (let currentY = 0; currentY < 9; currentY++) {

        puzzleCell = puzzle[currentCell.x][currentY];

        // Check if removing the input from the puzzle added a new possibility to the current empty cell
        if (typeof puzzleCell === "object" && puzzleCell.addPossibility(input, 1) && puzzleCell.possibilitiesLeft > 1) {
            // Move the puzzleCell to a higher Map array
            moveCell(puzzleCell, -1);
        }
    }

    // Look at the square
    for (let currentX = currentCell.topX; currentX < currentCell.topX + 3; currentX++) {
        for (let currentY = currentCell.topY; currentY < currentCell.topY + 3; currentY++) {

            puzzleCell = puzzle[currentX][currentY];

            // Check if removing the input from the puzzle added a new possibility to the current empty cell
            if (typeof puzzleCell === "object" && puzzleCell.addPossibility(input, 2) && puzzleCell.possibilitiesLeft > 1) {
                // Move the puzzleCell to a higher Map array
                moveCell(puzzleCell, -1);
            }
        }
    }

    // Now that we have emptied the cell, we put its PuzzleBlock back in
    puzzle[currentCell.x][currentCell.y] = currentCell;
}

function solve() {

    // Stores the blocks which we have to restore if we need to try a different move path
    let filledInBlocks = [];

    // Fill in any cells which only have a single possibility and update other cells until we either run out of guaranteed cells or the puzzle is solved
    let guaranteedCells = cellOrganiser.get(1);

    let currentCell;

    // We start by filling in guaranteed cells until we have run out of guaranteeded cells
    while (guaranteedCells.length > 0) {

        // Pop a cell with a guaranteed value
        currentCell = guaranteedCells.pop();
        // We have filled in a cell
        cellsToFill--;

        // We add the current cell's block to the array of blocks that may need restoring
        filledInBlocks.push(currentCell);

        // We replace the block in the puzzle with its possibility
        let input = currentCell.getPossibility();
        puzzle[currentCell.x][currentCell.y] = input;

        // We need to remove possibilites from other empty cells due to us filling in the current cell
        if (!removePossibilites(currentCell, input)) {

            // We were led to an invalid state from filling in the current cell
            // We need to undo the moves made at this recursive step to change an earlier choice made
            while (filledInBlocks.length > 0) {

                // Get the newest move we just made
                currentCell = filledInBlocks.pop();

                // Add the possibility back to the cells which were affected by this move
                addPossibilities(currentCell);

                // Put this cell back into the map of cells we need to fill
                cellOrganiser.get(currentCell.possibilitiesLeft).push(currentCell);
                cellsToFill++;
            }
            // We return true to show that while the choice didn't lead to a solution, we should still attempt to find one
            return true;
        }
    }

    // We have found a solution to the sudoku puzzle
    if (cellsToFill === 0) {

        let result = true;

        // Check that we haven't already found a solution
        if (!hasSolution) {

            hasSolution = true;

            if (solution !== null) {
                // If the solution we find is different to the provided solution then the puzzle is invalid
                if (!checkAgainstSolution()) {
                    result = false;
                }
            }
        }
        // The sudoku has multiple solutions and as such is invalid
        else {
            console.log("Invalid sudoku - Multiple solutions");
            // false is the flag I use to show that the entire sudoku is invalid and no further attempt should be made to solve it
            result = false;
        }
        // We undo the moves we have made so that we are at the correct game state when we unwind this call
        while (filledInBlocks.length > 0) {

            // Get the last move we made
            currentCell = filledInBlocks.pop();
            // Undo the effects it had on other cells possibilities
            addPossibilities(currentCell);

            // Put this cell back into the map of cells we need to fill
            cellOrganiser.get(currentCell.possibilitiesLeft).push(currentCell);
            cellsToFill++;
        }

        return result;
    }

    // Otherwise, we haven't solved the sudoku yet and will need to try guessing the next value in a cell with few possibilities
    let currentPossibleValues = 2;
    let cellArray = cellOrganiser.get(currentPossibleValues);

    // Finds an Array in the map with cells we can guess possible values for
    while (cellArray.length === 0) {
        currentPossibleValues++;
        cellArray = cellOrganiser.get(currentPossibleValues);
    }

    // Choose an arbitrary cell to choose the possibilities from
    currentCell = cellArray.pop();
    cellsToFill--;

    // Increment the counter of cells we had to make guess choices for
    choicesMade++;

    // The number of values we have tried
    let valuesTried = 0;
    // The index of the value we are currently trying
    let valueIndex = 0;

    // We need to try all the possible values of our chosen cell
    while (valuesTried < currentPossibleValues) {

        // Check if the current value is a possible input for our cell
        if (currentCell.possibilities[valueIndex][0] && currentCell.possibilities[valueIndex][1] && currentCell.possibilities[valueIndex][2]) {

            // Inputs the chosen possible value in the sudoku
            puzzle[currentCell.x][currentCell.y] = valueIndex + 1;

            // Checks that the chosen input leads to a valid game state
            if (removePossibilites(currentCell, valueIndex + 1)) {

                // If solve() returns false then we have an invalid puzzle and shouldn;t spend any more tiem attempting to solve it
                if (!solve()) {

                    // Undos the effects of the move
                    addPossibilities(currentCell);

                    // We stop using our chosen cell and will return to an earlier game state
                    cellsToFill++;
                    cellOrganiser.get(currentCell.possibilitiesLeft).push(currentCell);
                    choicesMade--;

                    // Undos all the guaranteed moves we made at the start of this recursive call
                    while (filledInBlocks.length > 0) {
                        currentCell = filledInBlocks.pop();
                        addPossibilities(currentCell);

                        cellOrganiser.get(currentCell.possibilitiesLeft).push(currentCell);
                        cellsToFill++;

                    }

                    return false;
                }
            }

            // Increment the counter of possible moves we have tried for the cell
            valuesTried++;

            // Undos the effects of the move
            addPossibilities(currentCell);
        }

        // Increments to the next possible move
        valueIndex++;
    }

    // We stop using our chosen cell and will return to an earlier game state
    cellsToFill++;
    cellOrganiser.get(currentCell.possibilitiesLeft).push(currentCell);
    choicesMade--;

    // Undos all the guaranteed moves we made at the start of this recursive call
    while (filledInBlocks.length > 0) {
        currentCell = filledInBlocks.pop();
        addPossibilities(currentCell);

        cellOrganiser.get(currentCell.possibilitiesLeft).push(currentCell);
        cellsToFill++;

    }

    // Return true to show that we should continue searching for solutions
    return true;
}

function SudokuDFSmain(puzzleToSolve, puzzleSolution) {

    // Set the global variables to their default starting state
    puzzle = puzzleToSolve;
    solution = puzzleSolution;
    cellsToFill = 0;
    hasSolution = false;
    choicesMade = 0;

    cellOrganiser = new Map([
        [1, []],
        [2, []],
        [3, []],
        [4, []],
        [5, []],
        [6, []],
        [7, []],
        [8, []],
        [9, []]
    ]);

    // The first thing we do is populate the Sudoku puzzle with the block elements about the cells we need to fill in
    if (!createPuzzleBlocks()) {
        console.log("The initial sudoku puzzle contains cells with no possible values and as such is invalid");
        revertArray();
        return { valid: false, errorMessage: "The initial sudoku puzzle contains cells with no possible values and as such is invalid" };
    }

    // We know that there exists no sudoku puzzles with less than 17 filled in cells so we can use that to quickly identify some invalid cases
    if (cellsToFill > 64) {
        console.log("Sudoku puzzles need at least 17 cells filled in to be solvable");
        revertArray();
        return { valid: false, errorMessage: "Sudoku puzzles need at least 17 cells filled in to be solvable" };
    }

    // We then try to solve the sudoku puzzle
    let result = solve();

    revertArray();

    // If solve() returns false then it has found the sudoku to be invalid
    if (!result) {
        console.log("The sudoku is invalid");
        return { valid: false, errorMessage: "The sudoku is invalid" };
    }
    // If result is true and hasSolution is true then the sudoku puzzle is valid and only has 1 solution
    else if (hasSolution) {
        console.log("A solution has been found for the sudoku puzzle and it is valid");
        return { valid: true, errorMessage: "A solution has been found for the sudoku puzzle and it is valid" };
    }
    // hasSolution is false so the puzzle has no solutions
    else {
        console.log("No solutions exist for this sudoku puzzle");
        return { valid: false, errorMessage: "No solutions exist for this sudoku puzzle" };
    }
}

module.exports = SudokuDFSmain;
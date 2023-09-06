// Program implements the A* algorithm described at https://studres.cs.st-andrews.ac.uk/CS3105/Lectures/L04-Search-2.pdf for the eights puzzle

// A map used to track the states we have already tried
let visitedStates;

// Map showing storing the end coordinates of numbers for the solution
const numberLocations = new Map([
    [1, [0, 0]],
    [2, [0, 1]],
    [3, [0, 2]],
    [4, [1, 0]],
    [5, [1, 1]],
    [6, [1, 2]],
    [7, [2, 0]],
    [8, [2, 1]],
    [null, [2, 2]]
]);

// List of moves that can be made
let movesToMake;

// Node to store data on making a move
class MoveNode {
    constructor(puzzleState, numberOfMoves, distances, movesMade, spaceCoordinates) {
        // Store the puzzle state
        this.puzzle = puzzleState;
        // Store how many moves it took to reach this state
        this.numberOfMoves = numberOfMoves;
        // Stores the Manhattan distance to the answer
        this.distance = distances;
        // Stores the heuristic score by adding the moves taken and the Manhatten distance together
        this.score = numberOfMoves + distances;
        // The list of moves made to reach this part
        this.movesMade = movesMade;
        // The coordinates of the null space in this puzzle state
        this.spaceCoordinates = spaceCoordinates;
    }
}

// Calculates the Manhattan distance of the starting puzzle layout
function calculateDistance(puzzle) {

    // The total Manhattan Distance
    let distanceTotal = 0;
    let dataToReturn = [0, 0, 0];

    // Iterate through the whole puzzle layout
    for (let currentX = 0; currentX < 3; currentX++) {
        for (let currentY = 0; currentY < 3; currentY++) {

            // Check we aren't on the empty square
            if (puzzle[currentX][currentY] !== null) {
                // Get the current value of the puzzle
                let currentValue = puzzle[currentX][currentY];
                // Get the index which it should be at for the solution
                let expectedCoordinates = numberLocations.get(currentValue);
                // Adds the x and y difference to the total Manhattan Distance
                distanceTotal += Math.abs(currentX - expectedCoordinates[0]);
                distanceTotal += Math.abs(currentY - expectedCoordinates[1]);
            }
            // We have found the null square and will store its location
            else {
                dataToReturn[1] = currentX;
                dataToReturn[2] = currentY;
            }
        }
    }

    // Store the Manhatten distance
    dataToReturn[0] = distanceTotal;

    return dataToReturn;
}

function makeNextState(currentMove, newState, moveMade) {

    // Check if we have already reached this puzzle state
    if (!visitedStates.has(newState.toString())) {

        // Add this state to the list of states we have tried
        visitedStates.set(newState.toString(), true);

        // Get the list of moves made so far
        let movesSoFar = currentMove.movesMade.slice();
        // Add the most recent move
        movesSoFar.push(moveMade);
        // Calculate the data on the most recent state
        let moveData = calculateDistance(newState);

        // Create a new move node for the next move
        let newNode = new MoveNode(newState, currentMove.numberOfMoves + 1, moveData[0], movesSoFar, [moveData[1], moveData[2]]);

        // Check if the puzzle has been solved
        if (moveData[0] === 0) {
            return true;
        }

        // The index of where we will store the new node in the list of movesToMake
        let insertionIndex = 0;
        // Flag for if we have found the right place to insert the new node
        let locationFound = false;

        // Look throught the list to find where the new node is inserted by the heuristic score
        while (!locationFound && insertionIndex < movesToMake.length) {

            // Get the current node from the list
            let currentMoveNode = movesToMake[insertionIndex];

            // Check if we have found the right location to insert the new node
            if (newNode.score < currentMoveNode.score) {
                // Splice the new node into the list
                movesToMake.splice(insertionIndex, 0,newNode);
                locationFound = true;
            }

            insertionIndex++;
        }

        // We haven't found a location to insert the new node so it is pushed onto the end
        if (!locationFound) {
            movesToMake.push(newNode);
        }
    }

    return false;
}

function copyGrid(puzzle) {

    // Create a copy of the puzzle grid for the new node
    let puzzleCopy = [];

    for (let i = 0; i < 3; i++) {
        puzzleCopy.push(puzzle[i].slice())
    }

    return puzzleCopy;
}

function EightsSolverMain(startingPuzzle) {
    visitedStates = new Map();
    movesToMake = [];
    // Get data on the starting node
    let startData = calculateDistance(startingPuzzle);
    // Record the first state as having being visited
    visitedStates.set(startingPuzzle.toString(), true);

    // Create a node for the start state
    let startNode = new MoveNode(startingPuzzle, 0, startData[0], [], [startData[1], startData[2]]);

    // Push the new node to the front of the list of moves
    movesToMake.push(startNode);

    // Flag for if the puzzle has been solved
    let puzzleSolved = false;

    // Check if the puzzle is already solved
    if (startData[0] === 0) {
        puzzleSolved = true;
    }

    // Keep expanding moves until we either find a path to the solution or we have no more possible states to visit
    while (!puzzleSolved && movesToMake.length > 0) {
        // Get the node from the start of the list (the one with the smallest heuristic score)
        let currentNode = movesToMake.shift();

        // Get the location of the empty square in the puzzle
        let gapSpace = currentNode.spaceCoordinates;
        let puzzle = currentNode.puzzle;
        let gapX = gapSpace[0];
        let gapY = gapSpace[1];

        // Flags for if any of the moves result in reaching the solution
        let leftSolve = false;
        let rightSolve = false;
        let upSolve = false;
        let downSolve = false;

        // Check if there is a move above the gap and if so, make it
        if (gapX - 1 > -1) {
            let puzzleCopy = copyGrid(puzzle);
            puzzleCopy[gapX][gapY] = puzzleCopy[gapX - 1][gapY];
            puzzleCopy[gapX - 1][gapY] = null;
            leftSolve = makeNextState(currentNode, puzzleCopy, puzzleCopy[gapX][gapY]);
        }
        // Check if there is a move below the gap and if so, make it
        if (gapX + 1 < 3) {
            let puzzleCopy = copyGrid(puzzle);
            puzzleCopy[gapX][gapY] = puzzleCopy[gapX + 1][gapY];
            puzzleCopy[gapX + 1][gapY] = null;
            rightSolve = makeNextState(currentNode, puzzleCopy, puzzleCopy[gapX][gapY]); 
        }
        // Check if there is a move to the left of the gap and if so, make it
        if (gapY - 1 > -1) {
            let puzzleCopy = copyGrid(puzzle);
            puzzleCopy[gapX][gapY] = puzzleCopy[gapX][gapY - 1];
            puzzleCopy[gapX][gapY - 1] = null;
            upSolve = makeNextState(currentNode, puzzleCopy, puzzleCopy[gapX][gapY]);
        }
        // Check if there is a move to the right of the gap and if so, make it
        if (gapY + 1 < 3) {
            let puzzleCopy = copyGrid(puzzle);
            puzzleCopy[gapX][gapY] = puzzleCopy[gapX][gapY + 1];
            puzzleCopy[gapX][gapY + 1] = null;
            downSolve = makeNextState(currentNode, puzzleCopy, puzzleCopy[gapX][gapY]);
        }
        // Check if any of the moves resulted in a solution
        puzzleSolved = leftSolve || rightSolve || upSolve || downSolve;
    }

    if (puzzleSolved) {
        console.log("Solved puzzle");
        return true;
    }
    else {
        console.log("No Solutions");
        return false;
    }
}

module.exports = EightsSolverMain;
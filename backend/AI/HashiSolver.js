const checkConnection = require("./HashiConnectionChecker");

// h1 = Single Horizontal h2 = Double Horizontal v1 = Single Vertical v2 = Double Vertical
const h1 = 11;
const h2 = 12;
const v1 = 21;
const v2 = 22;
let xMax;
let yMax;

// Used to easily find the opposite direction
const oppositeDirectionMap = new Map([
    ["L", "R"],
    ["R", "L"],
    ["U", "D"],
    ["D", "U"]
]);

// Stores the number of combinations an island can have based on its position in the grid
const combinationReference = [
    // 2 bridges need building
    [[2, 3, 0], [3, 4, 6], [0, 5, 7], [0, 6, 8], [0, 0, 9], [0, 0, 10]],
    // 3 bridges need building
    [[2, 3, 4], [0, 5, 7], [0, 7, 10], [0, 0, 13], [0, 0, 16]],
    // 4 bridges need building
    [[0, 3, 4], [0, 6, 8], [0, 0, 13], [0, 0, 19]],
    // 5 bridges need building
    [[0, 3, 4], [0, 0, 9], [0, 0, 16]],
    // 6 bridges need building
    [[0, 0, 4], [0, 0, 10]],
    // 7 bridges need building
    [[0, 0, 4]]
]

// The possible combinations an island has
const combinationKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 16, 19];

let printPuzzle;

let puzzle;

let solution;

// Keeps track of the chains of islands that have been formed
let chains;
// How many chains we have currently, needs to be 1 for a proper solution
let numberOfChains;
// Islands that need bridges building
let islandsToSolve;
// Store islands against how many combinations they have
let islandOrganiser;
// Islands that we can build some guaranteed bridges for but can't complete
let partialIslands;
// History of bridges that have been built
let bridgeHistory;
let hasASolution;

class IslandData {

    constructor(ay, ax, chainId) {
        // The coordinates of this island
        this.x = ax;
        this.y = ay;
        // The value of this island
        this.value = puzzle[ay][ax];
        // How many more bridges are required to complete the island
        this.bridgesLeft = this.value;
        // Map which stores the directions of where the adjacent islands are as keys and data about the island as the value
        this.adjacentIslands = new Map();
        // The number of possible bridges that can be built
        this.possibleBridges = 0;
        // The number of islands that bridges can be built to
        this.possibleIslands = 0;
        // The number of islands which double connections can be built to
        this.numberOfDoubleConnections = 0;
        // Flag as to whether this island is currently in the partialMoves list
        this.isInPartialList = false;
        // How many bridge configurations are possible for this island
        this.combinations = 0;
        // The current chain this island belongs to
        this.id = chainId;
        // The history of chains that this island has belonged to
        this.idHistory = [];
    }

    addIsland(newIsland, direction) {

        let bridges = 0;

        // If the island only has a value of 1 then it only provides 1 possible bridge
        if (newIsland.value === 1 || this.value === 1) {
            this.possibleBridges++;
            bridges = 1;
        }
        // If the island has any other value then it is possible to build 2 bridges to it.
        else {
            this.possibleBridges += 2;
            bridges = 2;
            this.numberOfDoubleConnections++;
        }

        // Stores the new island, the number of bridges between the islands, and how many possible bridges there can be against the direction
        // the island is in
        this.adjacentIslands.set(direction, [newIsland, 0, bridges]);
        this.possibleIslands++;
    }

    // Used when first finding our the combinations of the island at the start of the puzzle
    findCombinations() {

        // Check if the island no longer has enough possible bridges to be satisfied
        if (this.possibleBridges < this.bridgesLeft) {
            return false;
        }

        // If an island only needs to build 1 bridge then the number of combinations is the number of nodes that the island can be connected to
        else if (this.bridgesLeft === 1) {
            this.combinations = this.possibleIslands;
        }

        // If the number of possible bridges is equal to the number of bridges required then there is only a single possible combination
        else if (this.bridgesLeft === this.possibleBridges) {
            this.combinations = 1;
        }

        // We need to lookup the number of combinations avaliable using the combination table
        else {

            let bridgesRequiredIndex = this.bridgesLeft - 2;
            let possibleBridgesIndex = this.possibleBridges - (this.bridgesLeft + 1);
            let neighboursIndex = this.possibleIslands - 2;
            this.combinations = combinationReference[bridgesRequiredIndex][possibleBridgesIndex][neighboursIndex];
        }

        // Add this island to the correct entry for the number of combinations it has
        islandOrganiser.get(this.combinations).push(this);

        // While we can't solve this island for certain yet, there are some bridges that we can build for certain
        if (this.bridgesLeft === this.possibleBridges - 1 && this.numberOfDoubleConnections > 0) {
            partialIslands.push(this);
            this.isInPartialList = true;
        }

        return true;
    }

    // Used when updating the number of combinations avaliable
    updateCombinations() {

        // Stores the new possibilities for the island in its new state
        let newCombinations;
        let newInPartial = false;

        // Check if the island is finished
        if (this.bridgesLeft === 0) {
            // There will be no more combinations for this island
            newCombinations = 0;
            // If the island hasn't already been marked as solved then reduce the number of islands to solve
            if (this.combinations !== 0) {
                islandsToSolve--;
            }

        }

        // Check if the island no longer has enough possible bridges to be satisfied
        else if (this.possibleBridges < this.bridgesLeft) {
            return false;
        }

        // If an island only needs to build 1 bridge then the number of combinations is the number of nodes that the island can be connected to
        else if (this.bridgesLeft === 1) {
            newCombinations = this.possibleIslands;
        }

        // If the number of possible bridges is equal to the number of bridges required then there is only a single possible combination
        else if (this.bridgesLeft === this.possibleBridges) {
            newCombinations = 1;
        }

        // We need to lookup the number of combinations avaliable using the combination table
        else {
            let bridgesRequiredIndex = this.bridgesLeft - 2;
            let possibleBridgesIndex = this.possibleBridges - (this.bridgesLeft + 1);
            let neighboursIndex = this.possibleIslands - 2;
            newCombinations = combinationReference[bridgesRequiredIndex][possibleBridgesIndex][neighboursIndex];
        }

        // While we can't solve this island for certain yet, there are some bridges that we can build for certain
        if (this.bridgesLeft === this.possibleBridges - 1 && this.numberOfDoubleConnections > 0 && newCombinations > 1) {
            newInPartial = true;
        }

        // Check if the number of combinations has changed
        if (this.combinations !== newCombinations) {

            // We need to remove the duplicate island from the organiser before inserting the new state of the island
            if (this.combinations !== -1 && this.combinations !== 0) {

                let arrayToRemoveIsland = islandOrganiser.get(this.combinations);

                let currentIndex = 0;
                while (arrayToRemoveIsland[currentIndex] !== this) {
                    currentIndex++;
                }

                arrayToRemoveIsland.splice(currentIndex, 1);
            }

            // Check if this island needs solving again now
            if (this.combinations === 0 && newCombinations > 0) {
                islandsToSolve++;
            }

            // Update the combinations of this island
            this.combinations = newCombinations;

            // Add the island to the correct array in the organiser
            if (newCombinations !== 0) {
                islandOrganiser.get(newCombinations).push(this);
            }
        }

        // The data object needs removing from the partial certain moves list
        if (this.isInPartialList && !newInPartial) {

            let currentIndex = 0;
            while (partialIslands[currentIndex] !== this) {
                currentIndex++;
            }

            partialIslands.splice(currentIndex, 1);
        }

        // This object needs adding to the partial certain moves list
        else if (!this.isInPartialList && newInPartial) {
            partialIslands.push(this);
        }

        this.isInPartialList = newInPartial;

        return true;
    }

    updateBlockage(direction, adjustNeighbour) {

        // Check if there was a neighbour island in that direction
        if (this.adjacentIslands.has(direction)) {

            // Get the neighbour which has been blocked
            let blockedNeighbour = this.adjacentIslands.get(direction);

            // The island will be blocked for the first time
            if (blockedNeighbour[2] > 0) {
                // We have lost an island possibility
                this.possibleIslands--;
                // The island has lost possible bridges
                this.possibleBridges -= blockedNeighbour[2];
                // The chain has lost possible bridges
                chains[this.id][1] -= blockedNeighbour[2];
                // If there were 2 possible connections to the blocked island then we've lost a double connection
                if (blockedNeighbour[2] === 2) {
                    this.numberOfDoubleConnections--;
                }

                // The island is now blocked
                blockedNeighbour[2] = -1;
            }

            // Another blockage is added to an alreayd know blockage
            else {
                blockedNeighbour[2]--;
            }

            // Get the neighbour from the data
            let neighbourObject = blockedNeighbour[0];

            // Find the new combinations of this island
            let personalResult = this.updateCombinations();

            // Check if the neighbour also needs adjusting
            if (adjustNeighbour) {

                // Assume the blockage is due to a horizontal bridge
                let oppositeDirection = oppositeDirectionMap.get(direction);

                // Have the neighbour update itself due to the blockage but tell it to not ask its neighbour to fix itself since it already has done
                let neighbourResult = neighbourObject.updateBlockage(oppositeDirection, false);

                // If either island is now unsolvable then return false
                return (personalResult && neighbourResult);
            }
            // If not looking at the neighbour then just return own result
            else {
                return personalResult;
            }
        }

        // No blockage to update so just return true
        return true;
    }

    updateBuild(direction, bridgesBuilt, updateNeighbour) {  

        // There are less bridges that need building now
        this.bridgesLeft -= bridgesBuilt;

        // Updates entry on how many bridges connect the islands
        let connectionData = this.adjacentIslands.get(direction);
        // Check if we have lost a double connection
        if (connectionData[2] === 2) {
            this.numberOfDoubleConnections--;
        }
        // Add the bridges built and reduce the possible bridges
        connectionData[1] += bridgesBuilt;
        connectionData[2] -= bridgesBuilt;

        // If no possible bridges left now, a possible island has been lost
        if (connectionData[2] === 0) {
            this.possibleIslands--;
        }

        // There are less possible bridges to be built
        this.possibleBridges -= bridgesBuilt;

        // Keeps track of if the current build resulted in a valid new state or not
        let personalResult = true;

        // Check if we need to update the opposite destination island
        if (updateNeighbour) {

            let oppositeDirection = oppositeDirectionMap.get(direction);

            // Update the opposite neighbour and keep track if it was a valid build
            personalResult = connectionData[0].updateBuild(oppositeDirection, bridgesBuilt, false) && personalResult;
        }

        // If this island has no more bridges to be built then it is solved and needs removing from its other neighbours
        if (this.bridgesLeft === 0) {

            // No more possible building locations
            this.possibleBridges = 0;
            this.possibleIslands = 0;
            this.numberOfDoubleConnections = 0;

            // Go through the directions that islands are present for this island
            this.adjacentIslands.forEach(function(value, key) {

                // Get the opposite of the current direction
                let oppositeDirection = oppositeDirectionMap.get(key);
                // The island we are currently looking at
                let currentEditIsland = value[0];
                // The data about the connection the current island has to this island
                let oppositeEntry = currentEditIsland.adjacentIslands.get(oppositeDirection);

                // Check if the current island isn't finished or blocked off
                if (currentEditIsland.possibleBridges > 0 && oppositeEntry[2] > -1) {

                    // Remove the possible island connections
                    currentEditIsland.possibleBridges -= oppositeEntry[2];

                    // Check if there were potential bridges to build
                    if (oppositeEntry[2] > 0) {

                        // A potential island has been lost
                        currentEditIsland.possibleIslands--;

                        // If there were 2 potential bridges then the island lost a double connection
                        if (oppositeEntry[2] === 2) {
                            currentEditIsland.numberOfDoubleConnections--;
                        }

                        // Bridges can now be built
                        oppositeEntry[2] = 0;
                    }

                    // Update the number of combinations for the finished island
                    value[2] = 0;

                    // Update how many combinations this island has
                    personalResult = currentEditIsland.updateCombinations() && personalResult;
                }
            });
        }

        // If this island now only has 1 bridge left, then its neighbours need their possibilities reducing if they are double connections
        else if (this.bridgesLeft === 1 && this.numberOfDoubleConnections > 0) {

            // No more double connections can be made to this island
            this.numberOfDoubleConnections = 0;

            // Used to access this island
            let functionAccess = this;

            // Go throught the islands this island can connect to
            this.adjacentIslands.forEach(function(value, key) {

                // Get the current island and the direction that relates to this island
                let oppositeIsland = value[0];
                let oppositeDirection = oppositeDirectionMap.get(key);

                // Only update the value if it has a possible double connection
                if (value[2] === 2) {

                    // Only 1 bridge can be built now
                    value[2] = 1;
                    // We lose a possible bridge
                    functionAccess.possibleBridges--;
                    // The opposite island also loses a possible bridge and double connection
                    oppositeIsland.adjacentIslands.get(oppositeDirection)[2] = 1;
                    oppositeIsland.numberOfDoubleConnections--;
                    oppositeIsland.possibleBridges--;
                    // Update the combinations for the opposite island
                    personalResult = oppositeIsland.updateCombinations() && personalResult;
                }
            });
        }

        return this.updateCombinations() && personalResult;
    }

    removeBridge(direction, numberOfBridges, updateNeighbour) {

        // Get the data on the neighbour the removed bridge connects to
        let neighbourData = this.adjacentIslands.get(direction);
        // The neighbour island
        let neighbour = neighbourData[0];
        // How many bridges were originally left on this island
        let oldBridgesLeft = this.bridgesLeft;
        let doubleConnectionFlag = false;

        if (neighbourData[2] < 2) {
            doubleConnectionFlag = true;

            //Check if there were originally no more possible connections to to island
            if (neighbourData[2] === 0) {
                // We have regained a possible island to build to
                this.possibleIslands++;
            }
        }

        // We remove the number of bridges built
        neighbourData[1] -= numberOfBridges;
        // The bridges removed become possible bridges
        neighbourData[2] += numberOfBridges;
        if (neighbourData[2] === 2 && doubleConnectionFlag) {
            this.numberOfDoubleConnections++;
        }
        // The need to build more bridges now
        this.bridgesLeft += numberOfBridges;
        // The number of possible bridges to build increases
        this.possibleBridges += numberOfBridges;
        
        // The number of bridges we now have give us more options to the other islands as well
        if (oldBridgesLeft < 2) {

            let functionAccess = this;

            // The island now has the ability to have double connections
            if (oldBridgesLeft === 0 && numberOfBridges === 2) {

                this.adjacentIslands.forEach(function(value, key) {

                    // The island has to not be the one which we already broke the bridge for, must not be blocked, and must not already be fully connected
                    if (key !== direction && value[2] > -1 && value[1] !== 2) {

                        let currentIsland = value[0];
                        let oppositeDirection = oppositeDirectionMap.get(key);

                        // We can make 1 possible connection to the island
                        if (currentIsland.bridgesLeft === 1 || (value[1] === 1 && currentIsland.bridgesLeft > 1)) {

                            // Both islands recieve 1 new possible island and bridge
                            functionAccess.possibleIslands++;
                            currentIsland.possibleIslands++;

                            functionAccess.possibleBridges++;
                            currentIsland.possibleBridges++;

                            value[2] = 1;
                            currentIsland.adjacentIslands.get(oppositeDirection)[2] = 1;
                        }

                        // We can make 2 new possible connection to the island
                        else if (currentIsland.bridgesLeft > 1) {

                            // Both islands gain a new possible island and 2 possible bridges which is a double connection
                            functionAccess.possibleIslands++;
                            currentIsland.possibleIslands++;
                        
                            functionAccess.numberOfDoubleConnections++;
                            currentIsland.numberOfDoubleConnections++;

                            functionAccess.possibleBridges += 2;
                            currentIsland.possibleBridges += 2;

                            value[2] = 2;
                            currentIsland.adjacentIslands.get(oppositeDirection)[2] = 2;
                        }
                        currentIsland.updateCombinations();
                    }

                });
            }

            // The island can now complete its pairs to get double connections
            else if (oldBridgesLeft === 1 && numberOfBridges > 0) {

                this.adjacentIslands.forEach(function(value, key) {

                    // Check that the current island isn't the one which had the bridge broken to it, isn't blocked or already complete
                    if (key !== direction && value[2] > -1 && value[1] !== 2) {

                        let currentIsland = value[0];
                        let oppositeDirection = oppositeDirectionMap.get(key);

                        // We can make 1 possible connection to the island
                        if (currentIsland.bridgesLeft > 0) {

                            // Check if the current island can be given a double connection
                            if (value[2] === 1 && currentIsland.bridgesLeft > 1 && value[1] === 0) {

                                functionAccess.possibleBridges++;
                                currentIsland.possibleBridges++;
                                functionAccess.numberOfDoubleConnections++;
                                currentIsland.numberOfDoubleConnections++;
                                value[2] = 2;
                                currentIsland.adjacentIslands.get(oppositeDirection)[2] = 2;
                            }

                            // We can provide a single possible connection
                            else if (value[2] === 0) {

                                // The islands get a new possible bridge and island
                                functionAccess.possibleBridges++;
                                currentIsland.possibleBridges++;    
                                functionAccess.possibleIslands++;
                                currentIsland.possibleIslands++;
                                value[2] = 1;
                                currentIsland.adjacentIslands.get(oppositeDirection)[2] = 1;
                            }
                            currentIsland.updateCombinations();
                        }

                    }

                });
            }
            
            // We can make single connections
            else if (oldBridgesLeft === 0 && numberOfBridges === 1) {

                this.adjacentIslands.forEach(function(value, key) {

                    // Check that the current island isn't the one which had the bridge broken to it, isn't blocked or already complete
                    if (key !== direction && value[2] > -1 && value[1] !== 2) {

                        // Get the data for the current island
                        let currentIsland = value[0];
                        let oppositeDirection = oppositeDirectionMap.get(key);

                        // Check that the current island is accepting more connections
                        if (currentIsland.bridgesLeft > 0) {

                            // Both islands have a new possible island
                            functionAccess.possibleIslands++;
                            currentIsland.possibleIslands++;

                            // They each have a new bridge
                            functionAccess.possibleBridges++;
                            currentIsland.possibleBridges++;
                            // 1 possible bridge
                            value[2] = 1;
                            currentIsland.adjacentIslands.get(oppositeDirection)[2] = 1;
                            // Update combinations
                            currentIsland.updateCombinations();
                        }
                    }

                });
            }
        }

        // Check if we also need to update the neighbour
        if (updateNeighbour) {
            // Update the neighbour but give it the flag to not clear it's neighbour (this island)
            neighbour.removeBridge(oppositeDirectionMap.get(direction), numberOfBridges, false);
        }
        this.updateCombinations();
    }

    reestablishConnection(direction, updateNeighbour) {

        // Check if there is an island in the specified direction
        if (this.adjacentIslands.has(direction)) {

            let directionData = this.adjacentIslands.get(direction);
            directionData[2]++;
            // Get the island that we are reconnecting to
            let reconnectionIsland = directionData[0];

            if (directionData[2] === 0) {


                // Check if the island can form new connections
                if (this.bridgesLeft > 0 && reconnectionIsland.bridgesLeft > 0) {

                    // We can make 1 possible connection
                    if (reconnectionIsland.bridgesLeft === 1 || this.bridgesLeft === 1) {
                        this.possibleBridges++;
                        this.possibleIslands++;
                        this.adjacentIslands.get(direction)[2] = 1;
                    }
                    // We can make a possible double connection
                    else if (reconnectionIsland.bridgesLeft > 1) {
                        this.possibleBridges += 2;
                        this.possibleIslands++;
                        this.numberOfDoubleConnections++;
                        this.adjacentIslands.get(direction)[2] = 2;
                    }
                    // Update combinations
                    this.updateCombinations();
                }
            }

            // Update the opposite island
            if (updateNeighbour) {
    
                reconnectionIsland.reestablishConnection(oppositeDirectionMap.get(direction), false);
            }
        }

    }
}

function createIslandData() {

    let chainId = 0;

    // Iterates through the whole puzzle
    for (let currentPuzzleX = 0; currentPuzzleX < xMax; currentPuzzleX++) {
        for (let currentPuzzleY = 0; currentPuzzleY < yMax; currentPuzzleY++) {

            // Checks if the current cell is an island
            if (puzzle[currentPuzzleY][currentPuzzleX] !== 0) {
                // Creates an island data object
                let currentIslandData = new IslandData(currentPuzzleY, currentPuzzleX, chainId);
                // Pushes the island as a chain of length 1 to the list of chains
                chains.push([[currentIslandData]]);
                // Increments the chain id for the next island
                chainId++;
                // Puts the island data object into the puzzle
                puzzle[currentPuzzleY][currentPuzzleX] = currentIslandData;

                islandsToSolve++;
            }
        }
    }
    numberOfChains = chainId;
}

function createConnections() {

    // Iterate through the puzzle grid
    for (let currentPuzzleX = 0; currentPuzzleX < xMax; currentPuzzleX++) {
        for (let currentPuzzleY = 0; currentPuzzleY < yMax; currentPuzzleY++) {

            // Check if we have reached an island
            if (puzzle[currentPuzzleY][currentPuzzleX] !== 0) {

                // Get the current island
                let currentIsland = puzzle[currentPuzzleY][currentPuzzleX];

                // Check if the island has a neighbour to the right
                let findX = currentPuzzleX + 1;
                // There must be at least 1 gap between islands to draw the bridges
                if (findX < xMax && puzzle[currentPuzzleY][findX] === 0) {

                    while (findX < xMax && puzzle[currentPuzzleY][findX] === 0) {
                        findX++;
                    }

                    // Check we found an island
                    if (findX < xMax) {
                        // Get the island
                        let neighbourIsland = puzzle[currentPuzzleY][findX];
                        // Adds the island as a neighbour to the current island
                        currentIsland.addIsland(neighbourIsland, "R");
                        // Adds the current island as a neighbour to the found island
                        neighbourIsland.addIsland(currentIsland, "L");
                    }
                }


                // Check if the island has a neighbour below it
                let findY = currentPuzzleY + 1;

                if (findY < yMax && puzzle[findY][currentPuzzleX] === 0) {

                    while (findY < yMax && puzzle[findY][currentPuzzleX] === 0) {
                        findY++;
                    }

                    // Check we found an island
                    if (findY < yMax) {
                        // Get the island
                        let neighbourIsland = puzzle[findY][currentPuzzleX];
                        // Adds the island as a neighbour to the current island
                        currentIsland.addIsland(neighbourIsland, "D");
                        // Adds the current island as a neighbour to the found island
                        neighbourIsland.addIsland(currentIsland, "U");
                    }
                }

                // Find how many combinations we have for the current island
                if (!currentIsland.findCombinations()) {
                    return false;
                }

                // Store how many possibile connections a chain has next to it so that we can identify early if a chain has locked itself off from
                // the rest of the islands
                chains[currentIsland.id].push(currentIsland.possibleBridges);
                chains[currentIsland.id].push([0]);
            }
        }
    }

    return true;
}

function buildBridge(numberOfBridges, direction, source) {

    // Keeps track of if the build was valid
    let buildResult = true;

    let x = source.x;
    let y = source.y;

    // Check if we're buidling a horizontal bridge
    if (direction === "L" || direction === "R") {

        // We assume we're only building one bridge
        let bridgeBase = h1;
        // Flag for if we are connecting two islands together for the first time
        let newBridge = true;

        // Assume we're going to the right
        let bridgeDirection = 1;
        // Check and change if we're going left
        if (direction === "L") {
            bridgeDirection = -1
        }

        // We're adding an extra bridge to an existing connection so we use h2 but aren't making a new connection
        if (puzzle[y][x + bridgeDirection] === h1) {
            bridgeBase = h2;
            newBridge = false;
        }

        // If we're building 2 bridges then we will be using h2
        if (numberOfBridges === 2) {
            bridgeBase = h2;
        }

        let offSet = bridgeDirection;

        // We build the bridge in the puzzle until 
        while (typeof(puzzle[y][x + offSet]) !== "object" || puzzle[y][x + offSet] === 0) {

            // Put in the new bridge
            puzzle[y][x + offSet] = bridgeBase;
            printPuzzle[y][x + offSet] = bridgeBase;

            // If we've built a new bridge then we need to check if we've removed a possibility for other islands
            if (newBridge) {

                let yOffSet = 1;

                while (y + yOffSet < yMax && typeof(puzzle[y + yOffSet][x + offSet]) !== "object") {
                    yOffSet++;
                }

                if (y + yOffSet < yMax && typeof(puzzle[y + yOffSet][x + offSet]) === "object") {
                    buildResult = puzzle[y + yOffSet][x + offSet].updateBlockage("U", true) && buildResult;
                }
            }

            // Update to move to the next cell to look for a possible blocked island
            offSet += bridgeDirection;
        }

        // Update the connected islands due to the new bridge
        buildResult = source.updateBuild(direction, numberOfBridges, true) && buildResult;
        
        // If we have built a new connection then we will want to check if we have joined two chains togethe
        chainIslands(source, puzzle[y][x + offSet]); 
    }

    // The same process but building a vertical bridge
    else {

        // Assume we're building a vertical single bridge down
        let bridgeBase = v1;

        let bridgeDirection = 1;
        let newBridge = true;

        // Change direction if needed
        if (direction === "U") {
            bridgeDirection = -1;
        }

        // Change number of bridges built to 2
        if (numberOfBridges === 2) {
            bridgeBase = v2;
        }

        // Adds an extra bridge to a preexisting connection
        if (puzzle[y + bridgeDirection][x] === v1) {
            bridgeBase = v2;
            newBridge = false;
        }

        let offSet = bridgeDirection;

        // Build the bridge until we reach the desination island
        while (typeof(puzzle[y + offSet][x]) !== "object") {

            // Build the bridge
            puzzle[y + offSet][x] = bridgeBase;
            printPuzzle[y + offSet][x] = bridgeBase;

            // If we've built a new bridge then we need to check if we've removed a possibility for other islands
            if (newBridge) {

                // Look to the right
                let xOffSet = 1;

                // Keep looking until we either find an non empty gap or reach the edge of the puzzle
                while (x + xOffSet < xMax && typeof(puzzle[y + offSet][x + xOffSet]) !== "object") {
                    xOffSet++;

                }

                // Check that we have found an island object and not an integer bridge representation
                if (x + xOffSet < xMax && typeof(puzzle[y + offSet][x + xOffSet]) === "object") {
                    buildResult = puzzle[y + offSet][x + xOffSet].updateBlockage("L", true) && buildResult;
                }
            }

            // Update where we look next for blocked islands
            offSet += bridgeDirection;
        } 

        // Update the connected islands
        buildResult = source.updateBuild(direction, numberOfBridges, true) && buildResult;

        // If we have built a new connection then we will want to check if we have joined two chains together
        chainIslands(source, puzzle[y + offSet][x]);  
    }

    return buildResult;
}

function breakBridge(numberOfBridges, direction, source) {

    let x = source.x;
    let y = source.y;

    // Breaking a horizontal bridge
    if (direction === "L" || direction === "R") {

        // Assume it's to the right
        let bridgeDirection = 1;

        // Change direction if need be
        if (direction === "L") {
            bridgeDirection = -1;
        }

        // Get the number we will be replacing the bridges with
        let baseBridge = puzzle[y][x + bridgeDirection] - numberOfBridges;

        // If the value of base bridge === 10 then we are completely removing the bridge and putting in a 0
        if (baseBridge % 10 === 0) {
            baseBridge = 0;
        }

        let xOffset = x + bridgeDirection;

        // Traverse the bridge until we reach the island
        while (typeof(puzzle[y][xOffset]) !== "object") {

            // Replace with the new bridge value
            puzzle[y][xOffset] = baseBridge;
            printPuzzle[y][xOffset] = baseBridge;

            // If we are completely removing the bridge then we need to check if any blockages have been removed
            if (baseBridge === 0) {

                // Look down to check if there is an island that may bhave been blocked
                let yOffset = y + 1;
                while (yOffset < yMax && typeof(puzzle[yOffset][xOffset]) !== "object") {
                    yOffset++
                }

                // We found the island and will try to remove the blockage
                if (yOffset < yMax && typeof(puzzle[yOffset][xOffset]) === "object") {
                    puzzle[yOffset][xOffset].reestablishConnection("U", true);
                }
            }

            // Move onto looking at the next cell
            xOffset += bridgeDirection;
        }
    }

    // Breaking a vertical bridge
    else {

        // Assume the bridge goes down
        let bridgeDirection = 1;

        // Change the direction if need be
        if (direction === "U") {
            bridgeDirection = -1;
        }

        // Get new value of the bridge
        let baseBridge = puzzle[y + bridgeDirection][x] - numberOfBridges;

        if (baseBridge % 10 === 0) {
            baseBridge = 0;
        }

        let yOffset = y + bridgeDirection;

        // Traverse the bridge until we reach the other island
        while (typeof(puzzle[yOffset][x]) !== "object") {

            // Replace bridge with new value
            puzzle[yOffset][x] = baseBridge;
            printPuzzle[yOffset][x] = baseBridge;

            // Check blockages if completely removing bridge
            if (baseBridge === 0) {

                // Look for island to the right
                let xOffset = x + 1;
                while (xOffset < xMax && typeof(puzzle[yOffset][xOffset]) !== "object") {
                    xOffset++;
                }

                // We've found an island and will try updating its blockages
                if (xOffset < xMax && typeof(puzzle[yOffset][xOffset]) === "object") {
                    puzzle[yOffset][xOffset].reestablishConnection("L", true);
                }
            }

            // Move onto the next bridge cell
            yOffset += bridgeDirection;
        }
    }

    // Uodate th eilsands ti remove the bridge
    source.removeBridge(direction, numberOfBridges, true);
}

function chainIslands(source, destination) {

    //
    if (source.id !== destination.id) {

        let sourceChain = chains[source.id][0];
        let destinationChain = chains[destination.id][0];

        if (sourceChain.length < destinationChain.length) {

            let chainId = destinationChain[0].id;

            for (let currentIndex = 0; currentIndex < destinationChain.length; currentIndex++) {
                destinationChain[currentIndex].idHistory.push(chainId);
            }

            while (sourceChain.length > 0) {

                let currentIsland = sourceChain.pop();
                currentIsland.idHistory.push(currentIsland.id); 
                currentIsland.id = chainId;
                destinationChain.push(currentIsland); 
            }

            chains[destination.id][2].push(0);
        }

        else {

            let chainId = sourceChain[0].id;

            for (let currentIndex = 0; currentIndex < sourceChain.length; currentIndex++) {
                sourceChain[currentIndex].idHistory.push(chainId);
            }

            while (destinationChain.length > 0) {
                let currentIsland = destinationChain.pop();
                currentIsland.idHistory.push(currentIsland.id); 
                currentIsland.id = chainId;
                sourceChain.push(currentIsland); 
            }

            chains[source.id][2].push(0);
        }

        numberOfChains--;
    }

    else {
        chains[source.id][2][chains[source.id][2].length - 1]++;
    }
}

function buildAll(sourceIsland) {

    // The current entry in bridgeHistory that we will add these bridge builds to
    let bridgeHistoryIndex = bridgeHistory.length - 1;

    // Keeps track of if any of the builds are invalid
    let result = true;

    // Iterate through all the islands this island is adjacent to
    sourceIsland.adjacentIslands.forEach(function(value, key) {
        // Check there are possible bridges to build
        if (value[2] > 0) {
            // Add the data about this new bridge construction
            bridgeHistory[bridgeHistoryIndex].push([value[2], key, sourceIsland]);
            // Build the bridge and check if the bridge led to an invalid state
            if (!buildBridge(value[2], key, sourceIsland)) {
                // Return false
                result = false;
                return;
            }
        }
    });

    // Return if the bridge construction was successful
    return result;
}

function linkDoubles(sourceIsland) {

    let bridgeHistoryIndex = bridgeHistory.length - 1;

    // Check if the island has a double connection to the left and builds a single bridge if so
    if (sourceIsland.adjacentIslands.has("L") && sourceIsland.adjacentIslands.get("L")[2] === 2) {
        bridgeHistory[bridgeHistoryIndex].push([1, "L", sourceIsland]);
        if (!buildBridge(1, "L", sourceIsland)) {
            return false;
        }

    }

    // Check if the island has a double connection to the right and builds a single bridge if so
    if (sourceIsland.adjacentIslands.has("R") && sourceIsland.adjacentIslands.get("R")[2] === 2) {
        bridgeHistory[bridgeHistoryIndex].push([1, "R", sourceIsland]);
        if (!buildBridge(1, "R", sourceIsland)) {
            return false;
        }
    }

    // Check if the island has a double connection above and builds a single bridge if so
    if (sourceIsland.adjacentIslands.has("U") && sourceIsland.adjacentIslands.get("U")[2] === 2) {
        bridgeHistory[bridgeHistoryIndex].push([1, "U", sourceIsland]);
        if (!buildBridge(1, "U", sourceIsland)) {
            return false;
        }

    }

    // Check if the island has a double connection below and builds a single bridge if so
    if (sourceIsland.adjacentIslands.has("D") && sourceIsland.adjacentIslands.get("D")[2] === 2) {
        bridgeHistory[bridgeHistoryIndex].push([1, "D", sourceIsland]);
        if (!buildBridge(1, "D", sourceIsland)) {
            return false;
        }

    }

    return true;
}

function revertState() {
    
    // Get the history of bridges built in this current guess section
    let bridgesToBreak = bridgeHistory.pop();
    
    // Break all of the bridges at this stage
    while (bridgesToBreak.length > 0) {

        // Get some bridge data
        let currentBridgeData = bridgesToBreak.pop();
        // Break the selected bridge
        breakBridge(currentBridgeData[0], currentBridgeData[1], currentBridgeData[2]);
    }
}

function tryCombinations(selectedIsland) {

    // Maps selected numbers to a direction of bridge
    let numberDirectionMap = new Map();
    // NUmbers to be used as keys in NumberDirectionMap
    // I use that even numbers n represent a certain direction and that n + 1 represents the second bridge in that direction
    let numbersToUse = [];
    // How many combinations need trying
    let combinationsToTry = selectedIsland.combinations;
    // The new number of combinations for this island
    selectedIsland.combinations = -1;

    // The current value of n we're using
    let currentBase = 0;
    // Go through the direction avaliable to this island
    selectedIsland.adjacentIslands.forEach(function(value, key) {

        // Check there are possible bridges in the current direction
        if (value[2] > 0) {

            // Set a new mapping between number and direction
            numberDirectionMap.set(currentBase, key);
            numbersToUse.push(currentBase);
    
            // If there are 2 possible connections then also add n + 1 to the possible values
            if (value[2] === 2) {
                numberDirectionMap.set(currentBase + 1, key);
                numbersToUse.push(currentBase + 1);
            }
    
            // Move onto the next even n for the next direction
            currentBase += 2;
        }
    });

    // The bridges currently selected for this combination (indices to the numbers in numbersToUse)
    let selectedBridges = [];

    // Keeps track of if the current combination is valid and worth trying to solve
    let validCombination = true;
    // How many bridges this island needs
    let bridgesToChoose = selectedIsland.bridgesLeft;

    // Builds the first initial set of bridges
    for (let currentIndexValue = 0; currentIndexValue < bridgesToChoose; currentIndexValue++) {
        selectedBridges.push(currentIndexValue);
        validCombination = buildBridge(1, numberDirectionMap.get(numbersToUse[currentIndexValue]), selectedIsland) && validCombination;
    }

    // Combinations we've tried solving
    let combinationsTried = 0;

    // The index of the next bridge that needs breaking
    let bridgeIndex = selectedBridges.length;

    // Try all the possible combinations
    while (combinationsTried < combinationsToTry) {

        // Try to solve from this combination if it is valid
        if (validCombination) {
            // If a an invalid solution is found then solving ends straight away
            if (!solveHashi()) {
                return false;
            }
            // Revert back from the current solve
            revertState();
        }

        // We've tried another combination
        combinationsTried++;

        // Check if we need to find another combination
        if (combinationsTried < combinationsToTry) {

            // Used for finding next combination
            validCombination = true;
            let foundNextCombination = false;
            let offset = 0;

            while (!foundNextCombination) {

                // Break the last bridge in the selected list of bridges
                bridgeIndex--;
                breakBridge(1, numberDirectionMap.get(numbersToUse[selectedBridges[bridgeIndex]]), selectedIsland);

                // Move onto the next bridge number
                selectedBridges[bridgeIndex]++;
                // If the bridge number is odd then we know we don't have the even base to allow it so we need to increment the bridge value again
                if (selectedBridges[bridgeIndex] < numbersToUse.length && numbersToUse[selectedBridges[bridgeIndex]] % 2 === 1) {
                    selectedBridges[bridgeIndex]++;
                }
                // Check if the new bridge value is valid
                if (selectedBridges[bridgeIndex] < numbersToUse.length - offset) {
                    foundNextCombination = true;
                }
                // We will move onto the next bridge to break which has a lower limit than the current bridge that was broken
                offset++;
            }

            // We need to rebuild the new bridges
            let baseIndex = selectedBridges[bridgeIndex] + 1;
            // Build the current bridge that we just updated
            validCombination = buildBridge(1, numberDirectionMap.get(numbersToUse[selectedBridges[bridgeIndex]]), selectedIsland) && validCombination;
            bridgeIndex++;
            
            // Set new values for any extra bridges we broke by incrementing their index by 1 each time
            for (bridgeIndex; bridgeIndex < selectedBridges.length; bridgeIndex++) {

                selectedBridges[bridgeIndex] = baseIndex;
                validCombination = buildBridge(1, numberDirectionMap.get(numbersToUse[baseIndex]), selectedIsland) && validCombination;
                baseIndex++;
            } 
        }

        // We need to just break the last combination tried
        else {
            while (bridgeIndex > 0) {
                bridgeIndex--;
                breakBridge(1, numberDirectionMap.get(numbersToUse[selectedBridges[bridgeIndex]]), selectedIsland);
            }
        }
    }

    return true;
}

function solveHashi() {

    // The array of islands which we know all the bridges for
    let guaranteedIslands = islandOrganiser.get(1);
    // The island which we are currently building bridges off from
    let currentIsland;
    bridgeHistory.push([]);

    // We keep going until we've ran out of islands that we can build certain bridges off of
    while (guaranteedIslands.length > 0 || partialIslands.length > 0) {

        // Go through all the islands which only have a single possible layout
        while (guaranteedIslands.length > 0) {

            currentIsland = guaranteedIslands.pop();
            currentIsland.combinations = -1;
            if (!buildAll(currentIsland)) {
                return true;
            }
        }

        // Go through all the islands that we can build some of the bridges for certainS
        while (partialIslands.length > 0) {

            currentIsland = partialIslands.pop();
            currentIsland.isInPartialList = false;
            if (!linkDoubles(currentIsland)) {
                return true;
            }
            
        }
    }

    // We have reached a solved state
    if (islandsToSolve === 0) {

        // Check that all the islands are connected together
        if (checkConnection(printPuzzle)) {
            // Check that the puzzle matches the provided solution
            if (checkSolution(printPuzzle)) {
                // We have found a way to the orovided solution
                hasASolution = true;
                return true;
            }
            // There is more than one solution or the provided solution is invalid
            else {
                return false;
            }
        }
        // The solution isn't fully connected and incorrect so we continue the search
        else {
            return true;
        }

    }

    // We need to continue trying to solve by finding a new island to guess bridges for
    else {

        // Used to keep track of finding the next nide to try
        let keyIndex = 0;
        let foundNode = false;
        let selectedNode;
    
        // Iterate throught he island organiser starting with the lowest possible combination islands
        while (!foundNode && keyIndex < combinationKeys.length) {
    
            // Check that there are islands with the urrent number of combinations
            if (islandOrganiser.get(combinationKeys[keyIndex]).length > 0) {
                // Get an arbitrary island from the organiser 
                selectedNode = islandOrganiser.get(combinationKeys[keyIndex]).pop();
                // We've found our next combination try island
                foundNode = true;
            }
            // Move onto the next combination value
            else {
                keyIndex++;
            }
        }
    
        // Try all of the combinations of our selected island
        return tryCombinations(selectedNode); 
    }

}

function createCopy() {

    // Create a copy of the array which won't contain the IslandData objects for use on the chain checker
    for (let y = 0; y < puzzle.length; y++) {
        let currentRow = [];
        for (let x = 0; x < puzzle[0].length; x++) {
            currentRow.push(puzzle[y][x]);
        }
        printPuzzle.push(currentRow);
    }
}

function resetPuzzle() {

    // Remove the IslandData objects at the end of solving
    for (let x = 0; x < xMax; x++) {
        for (let y = 0; y < yMax; y++) {
            if (typeof(puzzle[y][x]) === "object") {
                puzzle[y][x] = puzzle[y][x].value;
            }
            else {
                puzzle[y][x] = 0;
            }
        }
    }
}

function checkSolution() {

    // If the solutoon is null then use the solver to store the soluton it found
    if (solution === null) {
        solution = [];
        for (let y = 0; y < yMax; y++) {
            let newRow = [];
            for (let x = 0; x < xMax; x++) {
                newRow.push(printPuzzle[y][x]);
            }
            solution.push(newRow);
        }
    }
    // Check the found solution is identical to the provided solution
    else {
        for (let y = 0; y < yMax; y++) {
            for (let x = 0; x < xMax; x++) {
                if (printPuzzle[y][x] !== solution[y][x]) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

function HashiSolverMain(puzzleToSolve, solutionOfPuzzle) {

    // Reset the global variables
    puzzle = puzzleToSolve;
    solution = solutionOfPuzzle;
    printPuzzle = [];
    xMax = puzzle[0].length;
    yMax = puzzle.length;
    numberOfChains = 0;
    chains = [];
    islandsToSolve = 0;
    islandOrganiser = new Map();
    partialIslands = [];
    bridgeHistory = [];
    hasASolution = false;

    for (let keyIndex = 0; keyIndex < combinationKeys.length; keyIndex++) {
        islandOrganiser.set(combinationKeys[keyIndex], []);
    }

    createCopy();

    // Create the island data objects in the puzzle
    createIslandData();
    if (islandsToSolve < 2) {
        resetPuzzle()
        return {valid: false, errorMessage: "The hashi is invalid"}
    }
    // Find the connections between islands in the puzzle
    if (!createConnections()) {
        resetPuzzle();
        return {valid: false, errorMessage: "The hashi is invalid"}
    }
    // Start to solve
    let result = solveHashi();
    resetPuzzle();

    if (!result) {
        return {valid: false, errorMessage: "The hashi is invalid"}
    }
    else if (!hasASolution) {
        return {valid: false, errorMessage: "The hashi doesn't have a solution"};
    }
    else {
        return {valid: true, errorMessage: "A solution has been found for the puzzle and it is valid"};
    }
}

module.exports = HashiSolverMain;
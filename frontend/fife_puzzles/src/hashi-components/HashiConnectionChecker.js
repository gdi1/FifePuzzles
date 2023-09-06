// h1 = Single Horizontal h2 = Double Horizontal v1 = Single Vertical v2 = Double Vertical
const h1 = 11;
const h2 = 12;
const v1 = 21;
const v2 = 22;

let maxX;
let maxY;

let chains;
let numberOfChains;
let islands;

class IslandHolder {

    // Stores the coordinates of the island and the chain that it belongs to
    constructor(x, y, chainId) {

        this.x = x;
        this.y = y;
        this.chainId = chainId;
    }
}

function reader(solution) {

    // Counter to give each island a unique chain ID
    let chainIndex = 0;

    // Iterate through the solution
    for (let currentY = 0; currentY < maxY; currentY++) {
        for (let currentX = 0; currentX < maxX; currentX++) {

            // Check if the current cell is an island (Will have a value in the range 1-8)
            if (solution[currentY][currentX] > 0 && solution[currentY][currentX] < 9) {

                // Create a new IslandHolder to store the data about this island
                let newIsland = new IslandHolder(currentX, currentY, chainIndex);

                // Store the IslandHolder in the solution
                solution[currentY][currentX] = newIsland;

                // Add this island to our list of islands
                islands.push(newIsland);
                // Add this island to the list of chains as a chain by itself
                chains.push([newIsland]);
                // Increment the chain ID value for the next island
                chainIndex++;
            }
        }
    }
    // Set the number of islands in the solution to the current number of unique chains
    numberOfChains = chainIndex;
}

function mergeChains(chain1, chain2) {

    if (chain1 !== chain2) {

        if (chains[chain1].length > chains[chain2].length) {

            while (chains[chain2].length > 0) {

                let currentIsland = chains[chain2].pop();
                currentIsland.chainId = chain1;
                chains[chain1].push(currentIsland);
            }
        }

        else {

            while (chains[chain1].length > 0) {

                let currentIsland = chains[chain1].pop();
                currentIsland.chainId = chain2;
                chains[chain2].push(currentIsland);
            }
        }
        numberOfChains--;
    }
}

function checkChains(solution) {

    // Iterates through the islands
    for (let islandIndex = 0; islandIndex < islands.length; islandIndex++) {

        // Get the information about the current island
        let currentIsland = islands[islandIndex];
        let currentChainIndex = currentIsland.chainId;
        let x = currentIsland.x;
        let y = currentIsland.y;

        // Check if the island has a connection to the island on its right
        if (x + 1 < maxX && (solution[y][x + 1] === h1 || solution[y][x + 1] === h2)) {

            // Traverses the bridge until the island is reached
            let xIncrement = 2;
            while (solution[y][x + xIncrement] === h1 || solution[y][x + xIncrement] === h2) {
                xIncrement++;
            }

            // Get the island to the right of this island
            let neighbourIsland = solution[y][x + xIncrement];

            // The chain ID of the 
            let neighbourChain = neighbourIsland.chainId;
            mergeChains(currentChainIndex, neighbourChain);
            currentChainIndex = currentIsland.chainId;
        }

        if (y + 1 < maxY && (solution[y + 1][x] === v1 || solution[y + 1][x] === v2)) {

            let yIncrement = 2;
            while (solution[y + yIncrement][x] === v1 || solution[y + yIncrement][x] === v2) {
                yIncrement++;
            }

            let neighbourIsland = solution[y + yIncrement][x];

            let neighbourChain = neighbourIsland.chainId;
            mergeChains(currentChainIndex, neighbourChain);
        }
    }
}

function copySolution(solution) {

    // The array that will hold the copy
    let solutionCopy = [];

    // Iterate through each array in the 2d solution array and use slice to make a copy to add to the solution copy
    for (let solutionIndex = 0; solutionIndex < maxY; solutionIndex++) {
        solutionCopy.push(solution[solutionIndex].slice())
    }

    return solutionCopy;
}

export default function HashiConnectionChecker(solution) {

    // Array to store the chains we have found in the solution
    chains = [];
    // Counter of how many unique chains we have
    numberOfChains = 0;
    // List of islands in the solution
    islands = [];
    // The dimensions of the puzzle
    maxX = solution[0].length;
    maxY = solution.length;

    // Create a copy so as to not alter the provided solution
    let solutionCopy = copySolution(solution);

    // Find the islands in the solution
    reader(solutionCopy);
    // Check the chains between the islands
    checkChains(solutionCopy);

    if (numberOfChains === 1) {
        return true;
    }
    else {
        return false;
    }
}

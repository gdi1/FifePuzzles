module.exports=function findDifficulty(puzzle) {
    const noRows = puzzle.length;
    const noColumns = puzzle[0].length;

    //make copy of puzzle state to keep track of number of bridges connected to a number
    let noBridges = [];
    for (let i = 0; i < noRows; i++) {
        noBridges[i] = [];
        for (let j = 0; j < noColumns; j++) {
            noBridges[i][j] = puzzle[i][j];
        }
    }

    let tempPuzzle = [];
    let tempNoBridges = [];
    let count = 0;
    let countTesting = 0;
    let changed = true;
    let solved = false;
    let cont = true;
    let testing = false;
    let lastTest1 = 0;
    let lastTest2 = 0;
    let lastTestDirection = "";
    while (cont) {
        changed = true;
        while (changed) {
            if (testing) {
                countTesting++;
            }
            else {
                count++;
            }

            //make copy of puzzle state for comparison later
            let copyValues = [];
            for (let i = 0; i < noRows; i++) {
                copyValues[i] = [];
                for (let j = 0; j < noColumns; j++) {
                    copyValues[i][j] = puzzle[i][j];
                }
            }

            //call solver function
            puzzle = difficultySolver(puzzle, noBridges);

            //check if any changes have been made, if not, then exit loop
            if (JSON.stringify(copyValues) === JSON.stringify(puzzle) ){//|| count == 1) {
                changed = false;
                
                // for (let i = 0; i < noRows; i++) {
                //     let str1 = "";
                //     for (let j = 0; j < noColumns; j++) {
                //         str1 += puzzle[i][j] + ", ";
                //     }
                //     console.log(str1);
                // }
                
                // console.log("");
                // for (let i = 0; i < noRows; i++) {
                //     let str2 = "";
                //     for (let j = 0; j < noColumns; j++) {
                //         str2 += noBridges[i][j] + ", ";
                //     }
                //     console.log(str2);
                // }

                // console.log(count);
                // console.log(copyValues, puzzle, noBridges);
                // console.log(changed);
            }
        }

        //check if puzzle has been solved
        solved = true;
        for (let i = 0; i < noRows; i++) {
            for (let j = 0; j < noColumns; j++) {
                if ((noBridges[i][j] > 0)) {
                    solved = false;
                }
            }
        }

        //if puzzle has been solved, then exit
        if (solved) {
            //check that puzzle has no islands
            let connected = [];
            let connectedCopy = [];
            for (let i = 0; i < noRows; i++) {
                connected[i] = [];
                connectedCopy[i] = [];
                for (let j = 0; j < noColumns; j++) {
                    connected[i][j] = false;
                }
            }

            //count number of numbers connected to first number
            let first = true;
            let connectedChanged = true;
            while (connectedChanged) {
                //make copy of connected for comparison later
                for (let i = 0; i < noRows; i++) {
                    for (let j = 0; j < noColumns; j++) {
                        connectedCopy[i][j] = connected[i][j];
                    }
                }
                for (let i = 0; i < noRows; i++) {
                    for (let j = 0; j < noColumns; j++) {
                        if (puzzle[i][j] > 0 && puzzle[i][j] < 10) {
                            if (first) {
                                connected[i][j] = true;
                                first = false;
                            }
                            else {
                                //check bridge to the right
                                if (puzzle[i][j + 1] !== undefined) {
                                    if (puzzle[i][j + 1] == 11 || puzzle[i][j + 1] == 12) {
                                        let k = 1;
                                        while (puzzle[i][j + k] == 11 || puzzle[i][j + k] == 12) {
                                            k++;
                                        }

                                        //if number at end of bridge is connected, then original number is connected
                                        if (connected[i][j + k]) {
                                            connected[i][j] = true;
                                            continue;
                                        }
                                    }
                                }

                                //check bridge to the left
                                if (puzzle[i][j - 1] !== undefined) {
                                    if (puzzle[i][j - 1] == 11 || puzzle[i][j - 1] == 12) {
                                        let k = 1;
                                        while (puzzle[i][j - k] == 11 || puzzle[i][j - k] == 12) {
                                            k++;
                                        }

                                        //if number at end of bridge is connected, then original number is connected
                                        if (connected[i][j - k]) {
                                            connected[i][j] = true;
                                            continue;
                                        }
                                    }
                                }

                                //check bridge downwards
                                if (puzzle[i + 1] !== undefined) {
                                    if (puzzle[i + 1][j] == 21 || puzzle[i + 1][j] == 22) {
                                        let k = 1;
                                        while (puzzle[i + k][j] == 21 || puzzle[i + k][j] == 22) {
                                            k++;
                                        }

                                        //if number at end of bridge is connected, then original number is connected
                                        if (connected[i + k][j]) {
                                            connected[i][j] = true;
                                            continue;
                                        }
                                    }
                                }

                                //check bridge upwards
                                if (puzzle[i - 1] !== undefined) {
                                    if (puzzle[i - 1][j] == 21 || puzzle[i - 1][j] == 22) {
                                        let k = 1;
                                        while (puzzle[i - k][j] == 21 || puzzle[i - k][j] == 22) {
                                            k++;
                                        }

                                        //if number at end of bridge is connected, then original number is connected
                                        if (connected[i - k][j]) {
                                            connected[i][j] = true;
                                            continue;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                //check if connected has been changed
                if (JSON.stringify(connectedCopy) === JSON.stringify(connected)){
                    connectedChanged = false;
                }
            }

            //check each number is connected
            cont = false;
            for (let i = 0; i < noRows; i++) {
                for (let j = 0; j < noColumns; j++) {
                    if (puzzle[i][j] > 0 && puzzle[i][j] < 10 && !connected[i][j]) {
                        cont = true;
                        solved = false;
                    }
                }
            }
        }
        //otherwise, test a random bridge
        if (!solved) {
            //revert last test made
            if (testing) {
                for (let i = 0; i < noRows; i++) {
                    for (let j = 0; j < noColumns; j++) {
                        puzzle[i][j] = tempPuzzle[i][j];
                        noBridges[i][j] = tempNoBridges[i][j];
                    }
                }
                countTesting = 0;

                // if (lastTestDirection == "east") {
                //     noBridges[lastTest1][lastTest2]++;
                //     noBridges[lastTest1][lastTest2 + lastTestDistance]++;
                // }
                // else {
                //     noBridges[lastTest1][lastTest2]++;
                //     noBridges[lastTest1 + lastTestDistance][lastTest2]++;
                // }
                
            }
            //make a copy of puzzle before testing bridge
            for (let i = 0; i < noRows; i++) {
                tempPuzzle[i] = [];
                tempNoBridges[i] = [];
                for (let j = 0; j < noColumns; j++) {
                    tempPuzzle[i][j] = puzzle[i][j];
                    tempNoBridges[i][j] = noBridges[i][j];
                }
            }

            //find next bridge to test
            let i = lastTest1;
            let j = lastTest2;
            testing = false;
            while (i < noRows && !testing) {
                while (j < noColumns && !testing) {
                    if (puzzle[i][j] > 0 && puzzle[i][j] < 10 && noBridges[i][j] !== 0) {
                        let nextNumber = false;
                        while (!nextNumber && !testing) {
                            if (lastTestDirection == "") {
                                //check if a bridge can be made to the right
                                let k = 0;
                                let possibleBridge = true;
                                while (possibleBridge) {
                                    k++;
                                    if (puzzle[i][j + k] === undefined) {
                                        possibleBridge = false;
                                        break;
                                    }
                                    if (puzzle[i][j + k] > 0 && puzzle[i][j + k] < 10) {
                                        break;
                                    }
                                    if (puzzle[i][j + k] > 11) {
                                        possibleBridge = false;
                                        break;
                                    }
                                }
                                if (possibleBridge) {
                                    testing = true;
                                    lastTest1 = i;
                                    lastTest2 = j;
                                    lastTestDirection = "east";
                                    break;
                                }
                                else {
                                    lastTestDirection = "east";
                                }
                            }
                            else if (lastTestDirection == "east") {
                                //check if a bridge can be made downwards
                                k = 0;
                                possibleBridge = true;
                                while (possibleBridge) {
                                    k++;
                                    if (puzzle[i + k] === undefined) {
                                        possibleBridge = false;
                                        break;
                                    }
                                    if (puzzle[i + k][j] > 0 && puzzle[i + k][j] < 10) {
                                        break;
                                    }
                                    if (puzzle[i + k][j] == 11 || puzzle[i + k][j] == 12 || puzzle[i + k][j] == 22) {
                                        possibleBridge = false;
                                        break;
                                    }
                                }
                                if (possibleBridge) {
                                    testing = true;
                                    lastTest1 = i;
                                    lastTest2 = j;
                                    lastTestDirection = "south";
                                }
                                else {
                                    lastTestDirection = "south";
                                }
                            }
                            else {
                                lastTestDirection = "";
                                nextNumber = true;
                            }
                        }
                    }
                    if (!testing) {
                        j++;
                    }
                }
                if (!testing) {
                    i++;
                }
                if (i !== noRows && !testing) {
                    j = 0;
                }
            }

            //if there are no more bridges to test, then exit and return difficulty
            if (i == noRows && j == noColumns && !testing) {
                cont = false;
            }
            else {
                //add bridge to test to puzzle
                if (lastTestDirection == "east") {
                    //build one bridge to the right
                    let k = 0;
                    let end = false;

                    while (!end) {
                        k++;
                        if (puzzle[lastTest1][lastTest2 + k] > 0 && puzzle[lastTest1][lastTest2 + k] < 10) {
                            end = true;
                            break;
                        }
                        if (puzzle[lastTest1][lastTest2 + k] == 11) {
                            puzzle[lastTest1][lastTest2 + k] = 12;
                        }
                        else {
                            puzzle[lastTest1][lastTest2 + k] = 11;
                        }
                    }

                    //update noBridges to reflect added bridge
                    noBridges[lastTest1][lastTest2]--;
                    noBridges[lastTest1][lastTest2 + k]--;
                }
                else if (lastTestDirection == "south") {
                    //build one bridge downwards
                    k = 0;
                    let end = false;

                    while (!end) {
                        k++;
                        if (puzzle[lastTest1 + k][lastTest2] > 0 && puzzle[lastTest1 + k][lastTest2] < 10) {
                            end = true;
                            break;
                        }
                        if (puzzle[lastTest1 + k][lastTest2] == 21) {
                            puzzle[lastTest1 + k][lastTest2] = 22;
                        }
                        else {
                            puzzle[lastTest1 + k][lastTest2] = 21;
                        }
                    }

                    //update noBridges to reflect added bridge
                    noBridges[lastTest1][lastTest2]--;
                    noBridges[lastTest1 + k][lastTest2]--;
                }
            }
        }
    }

    // for (let i = 0; i < noRows; i++) {
    //     let row = "";
    //     for (let j = 0; j < noColumns; j++) {
    //         row = row + "\t" + puzzle[i][j];
    //     }
    //     console.log(row);
    // }

    //count number of numbers
    let noNumbers = 0;
    for (let i = 0; i < noRows; i++) {
        for (let j = 0; j < noColumns; j++) {
            if (puzzle[i][j] > 0 && puzzle[i][j] < 10) {
                noNumbers++;
            }
        }
    }

    //calculate score for puzzle
    if (solved && !testing) {
        //if puzzle has been solved without searching, calculate a score based on how many loops were required to solve and how many numbers there are
        let score = Math.round((count / 2 + Math.sqrt(noNumbers) / 2) / 2);
        if (score < 1) {
            return 1;
        }
        else if (score > 5){
            return 5;
        }
        else {
            return score;
        }
    }
    //else if puzzle has been solved but required some search, then is a slightly harder puzzle
    else if (solved && testing) {
        let score = Math.round((count + countTesting * 1.5 + Math.sqrt(noNumbers) / 2) / 2);
        if (score < 2) {
            return 2;
        }
        else if (score > 9){
            return 9;
        }
        else {
            return score;
        }
    }
    //else puzzle has not yet been solved and is a harder puzzle, create a score base on how many numbers there are
    else {
        let score = Math.round(Math.sqrt(noNumbers * 2))
        if (score < 6) {
            return 6;
        }
        else if (score > 10){
            return 10;
        }
        else {
            return score;
        }
    }
}

function difficultySolver(puzzle, noBridges) {
    //loop once over the puzzle, solving some of the puzzle
    for (let i = 0; i < puzzle.length; i++) {
        for (let j = 0; j < puzzle[0].length; j++) {
            let totalNoPossibleBridges = 0;
            let noPossibleBridgesRight = 0;
            let noPossibleBridgesLeft = 0;
            let noPossibleBridgesDown = 0;
            let noPossibleBridgesUp = 0;

            //is square a number
            // console.log(i, j);
            if (puzzle[i][j] > 0 && puzzle[i][j] < 10) {
                //check if a bridge can be made to the right
                let k = 0;
                let possibleBridge = true;
                while (possibleBridge) {
                    k++;
                    if (puzzle[i][j + k] === undefined) {
                        possibleBridge = false;
                        break;
                    }
                    if (puzzle[i][j + k] > 0 && puzzle[i][j + k] < 10) {
                        break;
                    }
                    if (puzzle[i][j + k] > 11) {
                        possibleBridge = false;
                        break;
                    }
                }

                //find the number of possible bridges that can be made to the right
                if (possibleBridge) {
                    if (noBridges[i][j + k] == 0) {
                        noPossibleBridgesRight = 0;
                    }
                    else if (puzzle[i][j + 1] == 11 || noBridges[i][j + k] == 1) {
                        noPossibleBridgesRight = 1;
                    }
                    else {
                        noPossibleBridgesRight = 2;
                    }
                }

                //check to make sure that an island is not made between current square and square it can connect to
                if (noPossibleBridgesRight > 0 && (puzzle[i][j] == 1 || puzzle[i][j] == 2) && puzzle[i][j] == puzzle[i][j + k]) {
                    //if an island were to be made between two 1s, then no bridge can be made
                    if (puzzle[i][j] == 1) {
                        noPossibleBridgesRight--;
                    }
                    //if and island were to be made between two 2s, then only 1 bridge can be made
                    if (puzzle[i][j] == 2 && noBridges[i][j + k] == 2) {
                        noPossibleBridgesRight--;
                    }
                }

                //check if a bridge can be made to the left
                k = 0;
                possibleBridge = true;
                while (possibleBridge) {
                    k++;
                    if (puzzle[i][j - k] === undefined) {
                        possibleBridge = false;
                        break;
                    }
                    if (puzzle[i][j - k] > 0 && puzzle[i][j - k] < 10) {
                        break;
                    }
                    if (puzzle[i][j - k] > 11) {
                        possibleBridge = false;
                        break;
                    }
                }

                //find the number of possible bridges that can be made to the left
                if (possibleBridge) {
                    if (noBridges[i][j - k] == 0) {
                        noPossibleBridgesLeft = 0;
                    }
                    else if (puzzle[i][j - 1] == 11 || noBridges[i][j - k] == 1) {
                        noPossibleBridgesLeft = 1;
                    }
                    else {
                        noPossibleBridgesLeft = 2;
                    }
                }

                //check to make sure that an island is not made between current square and square it can connect to
                if (noPossibleBridgesLeft > 0 && (puzzle[i][j] == 1 || puzzle[i][j] == 2) && puzzle[i][j] == puzzle[i][j - k]) {
                    //if an island were to be made between two 1s, then no bridge can be made
                    if (puzzle[i][j] == 1) {
                        noPossibleBridgesLeft--;
                    }
                    //if and island were to be made between two 2s, then only 1 bridge can be made
                    if (puzzle[i][j] == 2 && noBridges[i][j - k] == 2) {
                        noPossibleBridgesLeft--;
                    }
                }

                //check if a bridge can be made downwards
                k = 0;
                possibleBridge = true;
                while (possibleBridge) {
                    k++;
                    if (puzzle[i + k] === undefined) {
                        possibleBridge = false;
                        break;
                    }
                    if (puzzle[i + k][j] > 0 && puzzle[i + k][j] < 10) {
                        break;
                    }
                    if (puzzle[i + k][j] == 11 || puzzle[i + k][j] == 12 || puzzle[i + k][j] == 22) {
                        possibleBridge = false;
                        break;
                    }
                }

                //find the number of possible bridges that can be made downwards
                if (possibleBridge) {
                    if (noBridges[i + k][j] == 0) {
                        noPossibleBridgesDown = 0;
                    }
                    else if (puzzle[i + 1][j] == 21 || noBridges[i + k][j] == 1) {
                        noPossibleBridgesDown = 1;
                    }
                    else {
                        noPossibleBridgesDown = 2;
                    }
                }

                //check to make sure that an island is not made between current square and square it can connect to
                if (noPossibleBridgesDown > 0 && (puzzle[i][j] == 1 || puzzle[i][j] == 2) && puzzle[i][j] == puzzle[i + k][j]) {
                    //if an island were to be made between two 1s, then no bridge can be made
                    if (puzzle[i][j] == 1) {
                        noPossibleBridgesDown--;
                    }
                    //if and island were to be made between two 2s, then only 1 bridge can be made
                    if (puzzle[i][j] == 2 && noBridges[i + k][j] == 2) {
                        noPossibleBridgesDown--;
                    }
                }

                //check if a bridge can be made upwards
                k = 0;
                possibleBridge = true;
                while (possibleBridge) {
                    k++;
                    if (puzzle[i - k] === undefined) {
                        possibleBridge = false;
                        break;
                    }
                    if (puzzle[i - k][j] > 0 && puzzle[i - k][j] < 10) {
                        break;
                    }
                    if (puzzle[i - k][j] == 11 || puzzle[i - k][j] == 12 || puzzle[i - k][j] == 22) {
                        possibleBridge = false;
                        break;
                    }
                }

                //find the number of possible bridges that can be made upwards
                if (possibleBridge) {
                    if (noBridges[i - k][j] == 0) {
                        noPossibleBridgesUp = 0;
                    }
                    else if (puzzle[i - 1][j] == 21 || noBridges[i - k][j] == 1) {
                        noPossibleBridgesUp = 1;
                    }
                    else {
                        noPossibleBridgesUp = 2;
                    }
                }

                //check to make sure that an island is not made between current square and square it can connect to
                if (noPossibleBridgesUp > 0 && (puzzle[i][j] == 1 || puzzle[i][j] == 2) && puzzle[i][j] == puzzle[i - k][j]) {
                    //if an island were to be made between two 1s, then no bridge can be made
                    if (puzzle[i][j] == 1) {
                        noPossibleBridgesUp--;
                    }
                    //if and island were to be made between two 2s, then only 1 bridge can be made
                    if (puzzle[i][j] == 2 && noBridges[i - k][j] == 2) {
                        noPossibleBridgesUp--;
                    }
                }

                //find total of possible bridges that can be made to current number
                totalNoPossibleBridges = noPossibleBridgesRight + noPossibleBridgesLeft + noPossibleBridgesDown + noPossibleBridgesUp;
                // console.log(totalNoPossibleBridges, noPossibleBridgesRight, noPossibleBridgesLeft, noPossibleBridgesDown, noPossibleBridgesUp);

                //store noBridges in temp variable so noBridges can be updated without intefering with the next bridge to be built
                let tempNoBridges = noBridges[i][j];

                //for every, case where there is 2 possible bridges in one direction(s) and 1 possible bridge in another, remove the 1 possible bridge(s) in those direction(s)
                switch(noPossibleBridgesRight + ","  + noPossibleBridgesLeft + "," + noPossibleBridgesDown + "," + noPossibleBridgesUp) {
                    case "0,0,0,0": break;
                    case "0,0,0,1": break;
                    case "0,0,0,2": break;
                    case "0,0,1,0": break;
                    case "0,0,1,1": break;
                    case "0,0,2,0": break;
                    case "0,0,2,2": break;
                    case "0,1,0,0": break;
                    case "0,1,0,1": break;
                    case "0,1,1,0": break;
                    case "0,1,1,1": break;
                    case "0,2,0,0": break;
                    case "0,2,0,2": break;
                    case "0,2,2,0": break;
                    case "0,2,2,2": break;
                    case "1,0,0,0": break;
                    case "1,0,0,1": break;
                    case "1,0,1,0": break;
                    case "1,0,1,1": break;
                    case "1,1,0,0": break;
                    case "1,1,0,1": break;
                    case "1,1,1,0": break;
                    case "1,1,1,1": break;
                    case "2,0,0,0": break;
                    case "2,0,0,2": break;
                    case "2,0,2,0": break;
                    case "2,0,2,2": break;
                    case "2,2,0,0": break;
                    case "2,2,0,2": break;
                    case "2,2,2,0": break;
                    case "2,2,2,2": break;
                    default: 
                        if (noPossibleBridgesRight == 1) {
                            noPossibleBridgesRight = 0;
                            tempNoBridges--;
                        }
                        if (noPossibleBridgesLeft == 1) {
                            noPossibleBridgesLeft = 0;
                            tempNoBridges--;
                        }
                        if (noPossibleBridgesDown == 1) {
                            noPossibleBridgesDown = 0;
                            tempNoBridges--;
                        }
                        if (noPossibleBridgesUp == 1) {
                            noPossibleBridgesUp = 0;
                            tempNoBridges--;
                        }
                }

                //find total number of possible directions that a bridge can be made
                let totalNoPossibleDirections = 0;
                if (noPossibleBridgesRight > 0) {
                    totalNoPossibleDirections++;
                }
                if (noPossibleBridgesLeft > 0) {
                    totalNoPossibleDirections++;
                } 
                if (noPossibleBridgesDown > 0) {
                    totalNoPossibleDirections++;
                } 
                if (noPossibleBridgesUp > 0) {
                    totalNoPossibleDirections++;
                }

                //check if bridges can be made
                if (((Math.ceil(tempNoBridges / 2) == totalNoPossibleDirections || totalNoPossibleBridges == tempNoBridges) && tempNoBridges > 1) || (totalNoPossibleDirections == 1 && tempNoBridges == 1)) {
                    //check how many bridges can be made to the right
                    if (noPossibleBridgesRight > 0) {
                        if (noPossibleBridgesRight == 1 || tempNoBridges / 2 == totalNoPossibleDirections - 0.5) {
                            //build one bridge to the right
                            let k = 0;
                            let end = false;

                            while (!end) {
                                k++;
                                if (puzzle[i][j + k] > 0 && puzzle[i][j + k] < 10) {
                                    end = true;
                                    break;
                                }
                                if (puzzle[i][j + k] == 11) {
                                    puzzle[i][j + k] = 12;
                                }
                                else {
                                    puzzle[i][j + k] = 11;
                                }
                            }

                            //update noBridges to reflect added bridge
                            noBridges[i][j]--;
                            noBridges[i][j + k]--;
                        }
                        else {
                            //build two bridges to the right
                            k = 0;
                            let end = false;

                            while (!end) {
                                k++;
                                if (puzzle[i][j + k] > 0 && puzzle[i][j + k] < 10) {
                                    end = true;
                                    break;
                                }
                                puzzle[i][j + k] = 12;
                            }

                            //update noBridges to reflect added bridge
                            noBridges[i][j] = noBridges[i][j] - 2;
                            noBridges[i][j + k] = noBridges[i][j + k] - 2;
                        }
                    }

                    //check how many bridges can be made to the left
                    if (noPossibleBridgesLeft > 0) {
                        if (noPossibleBridgesLeft == 1 || tempNoBridges / 2 == totalNoPossibleDirections - 0.5) {
                            //build one bridge to the left
                            k = 0;
                            let end = false;

                            while (!end) {
                                k++;
                                if (puzzle[i][j - k] > 0 && puzzle[i][j - k] < 10) {
                                    end = true;
                                    break;
                                }
                                if (puzzle[i][j - k] == 11) {
                                    puzzle[i][j - k] = 12;
                                }
                                else {
                                    puzzle[i][j - k] = 11;
                                }
                            }

                            //update noBridges to reflect added bridge
                            noBridges[i][j]--;
                            noBridges[i][j - k]--;
                        }
                        else {
                            //build two bridges to the left
                            k = 0;
                            let end = false;

                            while (!end) {
                                k++;
                                if (puzzle[i][j - k] > 0 && puzzle[i][j - k] < 10) {
                                    end = true;
                                    break;
                                }
                                puzzle[i][j - k] = 12;
                            }

                            //update noBridges to reflect added bridge
                            noBridges[i][j] = noBridges[i][j] - 2;
                            noBridges[i][j - k] = noBridges[i][j - k] - 2;
                        }
                    }

                    //check how many bridges can be made downwards
                    if (noPossibleBridgesDown > 0) {
                        if (noPossibleBridgesDown == 1 || tempNoBridges / 2 == totalNoPossibleDirections - 0.5) {
                            //build one bridge downwards
                            k = 0;
                            let end = false;

                            while (!end) {
                                k++;
                                if (puzzle[i + k][j] > 0 && puzzle[i + k][j] < 10) {
                                    end = true;
                                    break;
                                }
                                if (puzzle[i + k][j] == 21) {
                                    puzzle[i + k][j] = 22;
                                }
                                else {
                                    puzzle[i + k][j] = 21;
                                }
                            }

                            //update noBridges to reflect added bridge
                            noBridges[i][j]--;
                            noBridges[i + k][j]--;
                        }
                        else {
                            //build two bridges downwards
                            k = 0;
                            let end = false;

                            while (!end) {
                                k++;
                                if (puzzle[i + k][j] > 0 && puzzle[i + k][j] < 10) {
                                    end = true;
                                    break;
                                }
                                puzzle[i + k][j] = 22;
                            }

                            //update noBridges to reflect added bridge
                            noBridges[i][j] = noBridges[i][j] - 2;
                            noBridges[i + k][j] = noBridges[i + k][j] - 2;
                        }
                    }

                    //check how many bridges can be made upwards
                    if (noPossibleBridgesUp > 0) {
                        if (noPossibleBridgesUp == 1 || tempNoBridges / 2 == totalNoPossibleDirections - 0.5) {
                            //build one bridge upwards
                            k = 0;
                            let end = false;

                            while (!end) {
                                k++;
                                if (puzzle[i - k][j] > 0 && puzzle[i - k][j] < 10) {
                                    end = true;
                                    break;
                                }
                                if (puzzle[i - k][j] == 21) {
                                    puzzle[i - k][j] = 22;
                                }
                                else {
                                    puzzle[i - k][j] = 21;
                                }
                            }

                            //update noBridges to reflect added bridge
                            noBridges[i][j]--;
                            noBridges[i - k][j]--;
                        }
                        else {
                            //build two bridges upwards
                            k = 0;
                            let end = false;

                            while (!end) {
                                k++;
                                if (puzzle[i - k][j] > 0 && puzzle[i - k][j] < 10) {
                                    end = true;
                                    break;
                                }
                                puzzle[i - k][j] = 22;
                            }

                            //update noBridges to reflect added bridge
                            noBridges[i][j] = noBridges[i][j] - 2;
                            noBridges[i - k][j] = noBridges[i - k][j] - 2;
                        }
                    }
                }
            }
        }
    }

    return puzzle;
}
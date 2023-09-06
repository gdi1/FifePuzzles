module.exports = function checkContentHashi(puzzle) {
    const checkConnection = require('../AI/HashiConnectionChecker.js');

    //check mandatory fields of puzzle are present and that values are of the correct type
    if (!(puzzle.hasOwnProperty('puzzle-type') && puzzle.hasOwnProperty('values') && puzzle.hasOwnProperty('solution') && typeof puzzle["puzzle-type"] === "string" && Array.isArray(puzzle.values) && Array.isArray(puzzle.solution))) {
        return false;
    }
    //if non-mandatory fields are present, check they are of the correct type
    if ((puzzle.hasOwnProperty('creator-id') && typeof puzzle['creator-id'] !== "string") || (puzzle.hasOwnProperty('checker-id') && typeof puzzle['checker-id'] !== "string") || (puzzle.hasOwnProperty('difficulty') && typeof puzzle['difficulty'] !== "number")) {
        return false;
    }

    // Check that the puzzle-type is correct for a hashi puzzle
    if (puzzle["puzzle-type"] !== "hashi") {
        return false;
    }

    // Check that difficulty is in the correct range
    if (puzzle.difficulty > 100 || puzzle.difficulty < 0) {
        return false;
    }

    let noRows = puzzle.values.length;
    let noColumns = puzzle.values[0].length;

    //check that each column and rows is of equal length
    for (let i = 0; i < noRows; i++) {
        if (puzzle.values[i].length != noColumns) {
            return false;
        }
    }

    //check that size of hashi is valid
    if (!(noColumns==7 && noRows==10) && !(noColumns==8 && noRows==11) && !(noColumns==9 && noRows==13)){
        return false;
    }

    //check that values is same size as solution
    if (noRows !== puzzle.solution.length || noColumns !== puzzle.solution[0].length) {
        return false;
    }

    //check that values contains no bridges
    for (let i = 0; i < noRows; i++) {
        for (let j = 0; j < noColumns; j++) {
            if (typeof(puzzle.values[i][j]) === "number" && typeof(puzzle.solution[i][j]) === "number") {
                if (puzzle.values[i][j] > 10) {
                    return false;
                }
            }
        }
    }

    //check that values and solution only contain appropriate values
    let appropriateValues = [1,2,3,4,5,6,7,8,null,0,11,12,21,22];
    for (let i = 0; i < noRows; i++) {
        for (let j = 0; j < noColumns; j++) {
            if((!(appropriateValues.includes(puzzle.values[i][j])) || !(appropriateValues.includes(puzzle.solution[i][j])))){
                return false;
            }
        }
    }

    //check that values has the same numbers as solution
    for (let i = 0; i < noRows; i++) {
        for (let j = 0; j < noColumns; j++) {
            //check that solution has no extra numbers
            if ((puzzle.values[i][j] == null || puzzle.values[i][j] == 0) && (puzzle.solution[i][j] !== null && puzzle.solution[i][j] !== 0) && puzzle.solution[i][j] < 10) {
                return false;
            }
            if ((puzzle.values[i][j] !== null && puzzle.values[i][j] !== 0) && puzzle.values[i][j] !== puzzle.solution[i][j]) {
                return false;
            }
        }
    }

    //check that every number has the correct number of bridges connected to it and is not directly next to any number
    for (let i = 0; i < noRows; i++) {
        for (let j = 0; j < noColumns; j++) {
            if ((puzzle.solution[i][j] !== null && puzzle.solution[i][j] !== 0) && puzzle.solution[i][j] < 10) {
                let bridges = 0;
                //find number of bridges connected to number
                if (puzzle.solution[i + 1]) {
                    if (puzzle.solution[i + 1][j] !== null && puzzle.solution[i + 1][j] !== 0) {
                        //check that number is not directly next to another number
                        if (puzzle.solution[i + 1][j] < 10) {
                            return false;
                        }
                        //check bridge is connected to number
                        if (puzzle.solution[i + 1][j] > 20) {
                            //add number of bridges present in square
                            if (puzzle.solution[i + 1][j] % 2 == 0) {
                                bridges = bridges + 2;
                            }
                            else {
                                bridges++;
                            }
                        }
                    }
                }

                if (puzzle.solution[i - 1]) {
                    if (puzzle.solution[i - 1][j] !== null && puzzle.solution[i - 1][j] !== 0) {
                        //check that number is not directly next to another number
                        if (puzzle.solution[i - 1][j] < 10) {
                            return false;
                        }
                        //check bridge is connected to number
                        if (puzzle.solution[i - 1][j] > 20) {
                            //add number of bridges present in square
                            if (puzzle.solution[i - 1][j] % 2 == 0) {
                                bridges = bridges + 2;
                            }
                            else {
                                bridges++;
                            }
                        }
                    }
                }

                if (puzzle.solution[i][j + 1]) {
                    if (puzzle.solution[i][j + 1] !== null && puzzle.solution[i][j + 1] !== 0) {
                        //check that number is not directly next to another number
                        if (puzzle.solution[i][j + 1] < 10) {
                            return false;
                        }
                        //check bridge is connected to number
                        if (puzzle.solution[i][j + 1] < 20) {
                            //add number of bridges present in square
                            if (puzzle.solution[i][j + 1] % 2 == 0) {
                                bridges = bridges + 2;
                            }
                            else {
                                bridges++;
                            }
                        }
                    }
                }

                if (puzzle.solution[i][j - 1]) {
                    if (puzzle.solution[i][j - 1] !== null && puzzle.solution[i][j - 1] !== 0) {
                        //check that number is not directly next to another number
                        if (puzzle.solution[i][j - 1] < 10) {
                            return false;
                        }
                        //check bridge is connected to number
                        if (puzzle.solution[i][j - 1] < 20) {
                            //add number of bridges present in square
                            if (puzzle.solution[i][j - 1] % 2 == 0) {
                                bridges = bridges + 2;
                            }
                            else {
                                bridges++;
                            }
                        }
                    }
                }

                //check number matches number of bridges
                if (puzzle.solution[i][j] !== bridges) {
                    return false;
                }
            }
        }
    }

    //check that every bridge is valid
    for (let i = 0; i < noRows; i++) {
        for (let j = 0; j < noColumns; j++) {
            if ((puzzle.solution[i][j] !== null && puzzle.solution[i][j] !== 0) && puzzle.solution[i][j] < 10) {
                //check if there is a bridge to the right
                if (puzzle.solution[i][j + 1]) {
                    if (puzzle.solution[i][j + 1] !== null && puzzle.solution[i][j + 1] !== 0) {
                        //check bridge is horizontal
                        if (puzzle.solution[i][j + 1] == 11 || puzzle.solution[i][j + 1] == 12) {
                            let bridge = puzzle.solution[i][j + 1];

                            //check bridge continues till it reaches a number
                            let k = 2;
                            let end = false;
                            while (!end) {
                                if (!puzzle.solution[i][j + k]) {
                                    end = true;
                                    break;
                                }
                                if (puzzle.solution[i][j + k] !== bridge) {
                                    end = true;
                                    break;
                                }
                                k++;
                            }

                            //check that bridge ends at a number
                            if (!puzzle.solution[i][j + k]) {
                                return false;
                            }
                            if ((puzzle.solution[i][j + k] == null || puzzle.solution[i][j + k] == 0) || puzzle.solution[i][j + k] > 10) {
                                return false;
                            }
                        }
                    }
                }

                //check if there is a bridge below
                if (puzzle.solution[i + 1]) {
                    if (puzzle.solution[i + 1][j] !== null && puzzle.solution[i + 1][j] !== 0) {
                        //check bridge is vertical
                        if (puzzle.solution[i + 1][j] == 21 || puzzle.solution[i + 1][j] == 22) {
                            let bridge = puzzle.solution[i + 1][j];

                            //check bridge continues till it reaches a number
                            let k = 2;
                            let end = false;
                            while (!end) {
                                if (!puzzle.solution[i + k][j]) {
                                    end = true;
                                    break;
                                }
                                if (puzzle.solution[i + k][j] !== bridge) {
                                    end = true;
                                    break;
                                }
                                k++;
                            }

                            //check that bridge ends at a number
                            if (!puzzle.solution[i + k][j]) {
                                return false;
                            }
                            if ((puzzle.solution[i + k][j] == null || puzzle.solution[i + k][j] == 0) || puzzle.solution[i + k][j] > 10) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }

    console.log(checkConnection(puzzle.solution))
    //check that every number is connected to every other number
    if (!checkConnection(puzzle.solution)) {
        return false;
    }

    return true;
}
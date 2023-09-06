module.exports=function findDifficulty(puzzle) {
    const noColumns = puzzle.length;
    const noRows = puzzle[0].length;

    //check that number of columns is equal to number of rows and that each row and column have the same length
    for (let i = 0; i < noColumns; i++) {
        if (noColumns != puzzle[i].length) {
            //atleast one row is not equal to number of columns
            console.log("Error, sodoku is not valid.");
            return 0;
        }
    }

    const sudokuValues = new Set([])
    for (let i = 1; i <= noColumns; i++) {
        sudokuValues.add(i);
    }

    //store each column as set
    const columns = [];
    for (let i = 0; i < noColumns; i++) {
        columns[i] = new Set(puzzle[i]);
        columns[i].forEach(x => {if(!sudokuValues.has(x)) {columns[i].delete(x)}});
    }

    //store each row as set
    const rows = [];
    for (let i = 0; i < noRows; i++) {
        rows[i] = new Set();
        for (let j = 0; j < noColumns; j++) {
            rows[i].add(puzzle[j][i]);
        }
        rows[i].forEach(x => {if(!sudokuValues.has(x)) {rows[i].delete(x)}});
    }

    //calculate dimensions of big square
    //calculate factors of size of sodoku
    const factors = new Set();
    for (let i = 2; i <= noColumns / 2; i++) {
        if (noColumns % i == 0) {
            factors.add(i);
        }
    }

    //find factors that multiply to value of smaller dimension
    const bothFactors = new Set();
    const iterator = factors.values();
    const iterator2 = factors.values();
    for (const x of iterator) {
        for (const y of iterator2) {
            if (x * y == noColumns) {
                bothFactors.add([x, y]);
            }
        }
    }

    //find the smallest difference between two factors that multiply to value of smaller dimension
    let smallestDifference = noColumns;
    const bothIterator = bothFactors.values();
    for (const x of bothIterator) {
        const difference = x[0] - x[1];

        if (difference < smallestDifference) {
            smallestDifference = difference;
        }
    }

    //find two factors that have the smallest difference
    let columnFactor = null;
    let rowFactor = null;
    const bothIterator2 = bothFactors.values();
    for (const x of bothIterator2) {
        const difference = x[0] - x[1];

        if (difference == smallestDifference) {
            rowFactor = x[0];
            columnFactor = x[1];
        }
    }

    //calculate number of big squares as columns and rows
    let noColumnSquares = noColumns / columnFactor;
    let noRowSquares = noRows / rowFactor;

    //store each big square as set
    const squares = [];
    for (let i = 0; i < noColumnSquares; i++) {
        for (let j = 0; j < noRowSquares; j++) {
            squares[(i * noRowSquares) + j] = new Set();
            for (let k = 0; k < columnFactor; k++) {
                for (let l = 0; l < rowFactor; l++) {
                    squares[(i * noRowSquares) + j].add(puzzle[(i * columnFactor) + k][(j * rowFactor) + l]);
                }
            }
            squares[(i * noRowSquares) + j].forEach(x => {if(!sudokuValues.has(x)) {squares[(i * noRowSquares) + j].delete(x)}});
        }
    }

    //loop for all individual squares
    let possibleValues = [];
    for (let i = 0; i < noColumns; i++) {
        possibleValues[i] = [];
        for (let j = 0; j < noRows; j++) {
            possibleValues[i][j] = new Set();
            //if square is blank
            if(!sudokuValues.has(puzzle[i][j])) {
                //then find all possible values for blank square
                //find current big square
                let square = (Math.floor(i / columnFactor) * columnFactor) + (Math.floor(j / rowFactor));

                //add row, column and big square all to one set
                let takenValues = new Set();
                columns[i].forEach(x => takenValues.add(x));
                rows[j].forEach(x => takenValues.add(x));
                squares[square].forEach(x => takenValues.add(x));

                //find inverse of taken values to get possible values
                for (let k = 1; k <= noColumns; k++) {
                    //if value is not already present, add it
                    if(!takenValues.has(k)) {
                        possibleValues[i][j].add(k);
                    }
                }
            }
            //else set value of square to only possible value
            else {
                possibleValues[i][j].add(puzzle[i][j]);
            }
        }
    }

    let count = 1;
    let changed = true;
    while (changed) {
        count++;
        //copy possible values
        const copyPossibleValues =[];
        for (let i = 0; i < noColumns; i++) {
            copyPossibleValues[i] = [];
            for (let j = 0; j < noRows; j++) {
                copyPossibleValues[i][j] = new Set();
                possibleValues[i][j].forEach(x => copyPossibleValues[i][j].add(x));
            }
        }

        possibleValues = findDifficultyAlgorithm1(possibleValues, noColumnSquares, noRowSquares);

        //check if any changes have been made, if not, then exit loop
        changed = false;
        for (let i = 0; i < noColumns; i++) {
            for (let j = 0; j < noRows; j++) {
                if ((possibleValues[i][j].size != copyPossibleValues[i][j].size)) {
                    changed = true;
                }
            }
        }
    }

    //if puzzle has been solved using first method, then it is an easy puzzle
    let solved = true;
    for (let i = 0; i < noColumns; i++) {
        for (let j = 0; j < noRows; j++) {
            if ((possibleValues[i][j].size != 1)) {
                solved = false;
            }
        }
    }

    if (solved) {
        //if puzzle has been solved, calculate a score based on how many loops were required to solve
        // console.log(count);
        let score = Math.round(count / Math.sqrt((noColumns + noRows) / 2));
        if (score < 1) {
            return 1;
        }
        else if (score > 4){
            return 4;
        }
        else {
            return score
        }
    }

    //if puzzle has not been solved, add another technique to solve puzzle
    changed = true;
    while (changed) {
        count = count + 2;
        //copy possible values
        const copyPossibleValues =[];
        for (let i = 0; i < noColumns; i++) {
            copyPossibleValues[i] = [];
            for (let j = 0; j < noRows; j++) {
                copyPossibleValues[i][j] = new Set();
                possibleValues[i][j].forEach(x => copyPossibleValues[i][j].add(x));
            }
        }

        possibleValues = findDifficultyAlgorithm2(possibleValues, noColumnSquares, noRowSquares);
        possibleValues = findDifficultyAlgorithm1(possibleValues, noColumnSquares, noRowSquares);

        //check if any changes have been made, if not, then exit loop
        changed = false;
        for (let i = 0; i < noColumns; i++) {
            for (let j = 0; j < noRows; j++) {
                if ((possibleValues[i][j].size != copyPossibleValues[i][j].size)) {
                    changed = true;
                }
            }
        }
    }

    //if puzzle has been solved using second method, then it is an medium puzzle
    solved = true;
    for (let i = 0; i < noColumns; i++) {
        for (let j = 0; j < noRows; j++) {
            if ((possibleValues[i][j].size != 1)) {
                solved = false;
            }
        }
    }

    if (solved) {
        //if puzzle has been solved, check how many loops were required to solve
        // console.log(count);
        let score = Math.round(count / Math.sqrt((noColumns + noRows) / 2));
        if (score < 5) {
            return 5;
        }
        else if (score > 9){
            return 9
        }
        else {
            return score
        }
    }
    //else puzzle has not yet been solved and is a hard puzzle
    else {
        // for (let i = 0; i < size; i++) {
        //     for (let j = 0; j < size; j++) {
        //         console.log(possibleValues[i][j]);
        //     }
        //     console.log( );
        // }
        // console.log(count);
        return 10;
    }
    

    
}

function findDifficultyAlgorithm1(possibleValues, noColumnSquares, noRowSquares) {
    const noColumns = possibleValues.length;
    const noRows = possibleValues[0].length;
    const columnFactor = noColumns / noColumnSquares;
    const rowFactor = noRows / noRowSquares;

    //store determined values in each column as set
    const columns = [];
    for (let i = 0; i < noColumns; i++) {
        columns[i] = new Set();
        for (let j = 0; j < noRows; j++) {
            if(possibleValues[i][j].size == 1) {
                possibleValues[i][j].forEach(x => columns[i].add(x));
            }
        }
    }

    //store determined values in each row as set
    const rows = [];
    for (let i = 0; i < noRows; i++) {
        rows[i] = new Set();
        for (let j = 0; j < noColumns; j++) {
            if(possibleValues[j][i].size == 1) {
                possibleValues[j][i].forEach(x => rows[i].add(x));
            }
        }
    }

    //store determined values in each big square as set
    const squares = [];
    for (let i = 0; i < noColumnSquares; i++) {
        for (let j = 0; j < noRowSquares; j++) {
            squares[(i * noRowSquares) + j] = new Set();
            for (let k = 0; k < columnFactor; k++) {
                for (let l = 0; l < rowFactor; l++) {
                    if(possibleValues[(i * columnFactor) + k][(j * rowFactor) + l].size == 1) {
                        possibleValues[(i * columnFactor) + k][(j * rowFactor) + l].forEach(x => squares[(i * noRowSquares) + j].add(x));
                    }
                }
            }
        }
    }

    //loop for all individual squares
    for (let i = 0; i < noColumns; i++) {
        for (let j = 0; j < noRows; j++) {
            //if value of square is not determined
            if (possibleValues[i][j].size != 1) {
                possibleValues[i][j].clear();
                //then find all possible values for that square
                //find current big square
                let square = (Math.floor(i / columnFactor) * columnFactor) + (Math.floor(j / rowFactor));

                //add row, column and square all to one set
                let takenValues = new Set();
                columns[i].forEach(x => takenValues.add(x));
                rows[j].forEach(x => takenValues.add(x));
                squares[square].forEach(x => takenValues.add(x));

                //find inverse of taken values to get possible values
                for (let k = 1; k <= noColumns; k++) {
                    //if value is not already present, add it
                    if(!takenValues.has(k)) {
                        possibleValues[i][j].add(k);
                    }
                }
            }
        }
    }

    return possibleValues;
}

function findDifficultyAlgorithm2(possibleValues, noColumnSquares, noRowSquares) {
    const noColumns = possibleValues.length;
    const noRows = possibleValues[0].length;
    const columnFactor = noColumns / noColumnSquares;
    const rowFactor = noRows / noRowSquares;

    //check if any individual square in a column has a unique possible value that no other square in that column has
    for (let i = 0; i < noColumns; i++) {
        for (let j = 0; j < noRows; j++) {
            if (possibleValues[i][j].size != 1) {
                const iterator = possibleValues[i][j].values();

                for (const x of iterator) {
                    let unique = true;
                    for (let k = 0; k < noRows; k++) {
                        if (j != k) {
                            if (possibleValues[i][k].has(x)) {
                                unique = false;
                            }
                        }
                    }
                    // if value is unique, then set square to that value
                    if (unique) {
                        possibleValues[i][j].clear();
                        possibleValues[i][j].add(x);
                        break;
                    }
                }
            }
        }
    }

    //check if any individual square in a row has a unique possible value that no other square in that row has
    for (let i = 0; i < noRows; i++) {
        for (let j = 0; j < noColumns; j++) {
            if (possibleValues[j][i].size != 1) {
                const iterator = possibleValues[j][i].values();

                for (const x of iterator) {
                    let unique = true;
                    for (let k = 0; k < noColumns; k++) {
                        if (j != k) {
                            if (possibleValues[k][i].has(x)) {
                                unique = false;
                            }
                        }
                    }
                    //if value is unique, then set square to that value
                    if (unique) {
                        possibleValues[j][i].clear();
                        possibleValues[j][i].add(x);
                        break;
                    }
                }
            }
        }
    }

    //check if any individual square in a big square has a unique possible value that no other square in that big square has
    for (let i = 0; i < noColumnSquares; i++) {
        for (let j = 0; j < noRowSquares; j++) {
            for (let k = 0; k < columnFactor; k++) {
                for (let l = 0; l < rowFactor; l++) {
                    if (possibleValues[(i * columnFactor) + k][(j * rowFactor) + l].size != 1) {
                        const iterator = possibleValues[(i * columnFactor) + k][(j * rowFactor) + l].values();

                        for (const x of iterator) {
                            let unique = true;
                            for (let m = 0; m < columnFactor; m++) {
                                for (let n = 0; n < rowFactor; n++) {
                                    if (k * rowFactor + l != m * rowFactor + n) {
                                        if (possibleValues[(i * columnFactor) + m][(j * rowFactor) + n].has(x)) {
                                            unique = false;
                                        }
                                    }
                                }
                            }
                            //if value is unique, then set square to that value
                            if (unique) {
                                possibleValues[(i * columnFactor) + k][(j * rowFactor) + l].clear();
                                possibleValues[(i * columnFactor) + k][(j * rowFactor) + l].add(x);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    
    return possibleValues;
}
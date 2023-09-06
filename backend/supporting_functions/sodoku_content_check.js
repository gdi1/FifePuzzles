module.exports=function checkContent(puzzle) {

    //check mandatory fields of puzzle are present and that values are of the correct type
    if (puzzle.hasOwnProperty('puzzle-type') && puzzle.hasOwnProperty('values') && puzzle.hasOwnProperty('solution') && typeof puzzle["puzzle-type"] === "string" && Array.isArray(puzzle.values) && Array.isArray(puzzle.solution)) {

        //if non-mandatory fields are present, check they are of the correct type
        if ((puzzle.hasOwnProperty('creator-id') && typeof puzzle['creator-id'] !== "string") || (puzzle.hasOwnProperty('checker-id') && typeof puzzle['checker-id'] !== "string") || (puzzle.hasOwnProperty('difficulty') && typeof puzzle['difficulty'] !== "number")) {
            return false;
        }

        // Check that the puzzle-type is correct for a sudoku
        if (puzzle["puzzle-type"] !== "sudoku") {
            return false;
        }

        // Check that difficulty is in the correct range
        if (puzzle.difficulty > 100 || puzzle.difficulty < 0) {
            return false;
        }

        let noColumns = puzzle.values.length;

        // Our current implementation only works with 9x9 puzzles but we can remove this later on to allow more square sudokus of
        // different sizes
        // Check that the solution shared the same numbers of columns
        if (noColumns !== 9 || noColumns !== puzzle.solution.length) {
            return false;
        }

        // Check that the puzzle is a square and that each row is an Array
        for (let currentRow = 0; currentRow < noColumns; currentRow++) {
            // Checks that the number of entries in each row is equal to the number of columns
            if (!Array.isArray(puzzle.values[currentRow]) || !Array.isArray(puzzle.solution[currentRow]) || puzzle.values[currentRow].length !== noColumns || puzzle.solution[currentRow].length !== noColumns) {
                return false;
            }
        }

        let noRows = puzzle.values[0].length;

        const sudokuValues = new Set([])
        for (let i = 1; i <= noColumns; i++) {
            sudokuValues.add(i);
        }
        
        //check solution matches starting position of puzzle
        for (let i = 0; i < noColumns; i++) {
            for (let j = 0; j < noRows; j++) {

                // Check that the solution only contains numbers
                if (typeof puzzle.solution[i][j] !== "number") {
                    return false;
                }

                

                //for non-null values, check values at the start equal values in the solution and that they are numbers
                if(sudokuValues.has(puzzle.values[i][j])) {
                    if (puzzle.values[i][j] != puzzle.solution[i][j] || typeof puzzle.values[i][j] !== "number") {
                        return false;
                    }
                }
            }
        }

        //check solution is correct
        //check each column is correct
        for (let i = 0; i < noColumns; i++) {
            if (!checkSection(puzzle.solution[i])) {
                return false;
            }
        }

        //check each row is correct
        for (let i = 0; i < noRows; i++) {
            const row = [];
            for (let j = 0; j < noColumns; j++) {
                row[j] = puzzle.solution[j][i];
            }
            if (!checkSection(row)) {
                return false;
            }
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



        //check each square is correct
        for (let i = 0; i < noColumnSquares; i++) {
            for (let j = 0; j < noRowSquares; j++) {
                const square = [];
                for (let k = 0; k < columnFactor; k++) {
                    for (let l = 0; l < rowFactor; l++) {
                        square[(k * rowFactor) + l] = puzzle.solution[(i * columnFactor) + k][(j * rowFactor) + l];
                    }
                }
                if (!checkSection(square)) {
                    return false;
                }
            }
        }

        //check that starting position has at least one blank square
        let blanksquare = false;
        for (let i = 0; i < noColumns; i++) {
            for (let j = 0; j < noRows; j++) {
                if (puzzle.values[i][j] == null || puzzle.values[i][j] == 0) {
                    blanksquare = true;
                }
            }
        }
        if (!blanksquare) {
            console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

            return false;
        }
    }
    else {
        return false;
    }

    return true;
}

function checkSection(array) {
    for (let i = 0; i < array.length; i++) {
        //check values in section are in correct range for size of puzzle 
        if (array[i] < 1 || array[i] > array.length) {
            return false;
        }
    }
    //check values in section are all unique
    let section = new Set(array);
    if (section.size != array.length) {
        return false;
    }

    return true;
}
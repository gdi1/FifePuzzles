const app = require("../app");
const supertest = require("supertest");
const User = require("../Models/User");
const mongoose = require("mongoose");
const Sudoku = require("../Models/Sudoku_Model");
const PuzzleSolved = require("../Models/PuzzleSolved");
const jwt = require("jsonwebtoken");
const { aggregate } = require("../Models/PuzzleSolved");

describe("Tests for the SolvedPuzzlesController", () => {

    beforeEach(() => {
        request = supertest(app);
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Get the types of puzzles solved", async() => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
        });

        let lastWeek = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 6).setHours(
              0,
              0,
              0,
              0
            )
          );

        let dayInLastWeek = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3).setHours(
              0,
              0,
              0,
              0
            )
          );

          let lastMonth = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 29).setHours(
              0,
              0,
              0,
              0
            )
          );
          let last3Months = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 89).setHours(
              0,
              0,
              0,
              0
            )
          );
          let lastYear = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 364).setHours(
              0,
              0,
              0,
              0
            )
          );

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
        .spyOn(User, "findOne")
        .mockImplementationOnce(({ userID }) =>
        user.userID === userID ? Promise.resolve(user) : null);

        const lastWeekTypes = [{_id: lastWeek, puzzleCount: [{puzzleType: "sudoku", count: 4}, {puzzleType: "eights_puzzle", count: 7}, {puzzleType: "hashi", count: 0}]}, 
            {_id: dayInLastWeek, puzzleCount: [{puzzleType: "sudoku", count: 1}, {puzzleType: "eights_puzzle", count: 2}, {puzzleType: "hashi", count: 5}]}]
        const lastMonthTypes = [{_id: lastMonth, puzzleCount: [{puzzleType: "sudoku", count: 2}, {puzzleType: "eights_puzzle", count: 1}, {puzzleType: "hashi", count: 1}]},
            {_id: lastWeek, puzzleCount: [{puzzleType: "sudoku", count: 4}, {puzzleType: "eights_puzzle", count: 7}, {puzzleType: "hashi", count: 0}]},
            {_id: dayInLastWeek, puzzleCount: [{puzzleType: "sudoku", count: 1}, {puzzleType: "eights_puzzle", count: 2}, {puzzleType: "hashi", count: 5}]}]
        const last3MonthsTypes = [{_id: last3Months, puzzleCount: [{puzzleType: "sudoku", count: 6}, {puzzleType: "eights_puzzle", count: 15}, {puzzleType: "hashi", count: 9}]},
            {_id: lastMonth, puzzleCount: [{puzzleType: "sudoku", count: 2}, {puzzleType: "eights_puzzle", count: 1}, {puzzleType: "hashi", count: 1}]},
            {_id: lastWeek, puzzleCount: [{puzzleType: "sudoku", count: 4}, {puzzleType: "eights_puzzle", count: 7}, {puzzleType: "hashi", count: 0}]},
            {_id: dayInLastWeek, puzzleCount: [{puzzleType: "sudoku", count: 1}, {puzzleType: "eights_puzzle", count: 2}, {puzzleType: "hashi", count: 5}]}]
        const allTimeTypes = [{_id: lastYear, puzzleCount: [{puzzleType: "sudoku", count: 1}, {puzzleType: "eights_puzzle", count: 1}, {puzzleType: "hashi", count: 1}]},
            {_id: last3Months, puzzleCount: [{puzzleType: "sudoku", count: 6}, {puzzleType: "eights_puzzle", count: 15}, {puzzleType: "hashi", count: 9}]},
            {_id: lastMonth, puzzleCount: [{puzzleType: "sudoku", count: 2}, {puzzleType: "eights_puzzle", count: 1}, {puzzleType: "hashi", count: 1}]},
            {_id: lastWeek, puzzleCount: [{puzzleType: "sudoku", count: 4}, {puzzleType: "eights_puzzle", count: 7}, {puzzleType: "hashi", count: 0}]},
            {_id: dayInLastWeek, puzzleCount: [{puzzleType: "sudoku", count: 1}, {puzzleType: "eights_puzzle", count: 2}, {puzzleType: "hashi", count: 5}]}]

        jest.spyOn(PuzzleSolved, "aggregate").mockImplementationOnce(() => Promise.resolve(lastWeekTypes));
        jest.spyOn(PuzzleSolved, "aggregate").mockImplementationOnce(() => Promise.resolve(lastMonthTypes));
        jest.spyOn(PuzzleSolved, "aggregate").mockImplementationOnce(() => Promise.resolve(last3MonthsTypes));
        jest.spyOn(PuzzleSolved, "aggregate").mockImplementationOnce(() => Promise.resolve(allTimeTypes));

        const response = await request
            .get("/solved-puzzles/type")
            .set("Cookie", ["jwt=token"])
        
        expect(response.body.status).toBe("success")

        let allTimeSudokuSum = 0;
        let allTimeEightsSum = 0;
        let allTimeHashiSum = 0;

        for (let i = 0; i < response.body.data.allTimeArray.length; i++) {
            let currentEntry = response.body.data.allTimeArray[i].count;
            allTimeSudokuSum += currentEntry.sudoku
            allTimeEightsSum += currentEntry.eights_puzzle
            allTimeHashiSum += currentEntry.hashi
        }

        expect(allTimeSudokuSum).toBe(14)
        expect(allTimeEightsSum).toBe(26)
        expect(allTimeHashiSum).toBe(16)
    })

    test("Get the difficulty of puzzles solved", async() => {
        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
        });

        let lastWeek = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 6).setHours(
              0,
              0,
              0,
              0
            )
          );

        let dayInLastWeek = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3).setHours(
              0,
              0,
              0,
              0
            )
          );

          let lastMonth = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 29).setHours(
              0,
              0,
              0,
              0
            )
          );
          let last3Months = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 89).setHours(
              0,
              0,
              0,
              0
            )
          );
          let lastYear = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 364).setHours(
              0,
              0,
              0,
              0
            )
          );

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
        .spyOn(User, "findOne")
        .mockImplementationOnce(({ userID }) =>
        user.userID === userID ? Promise.resolve(user) : null);

        const lastWeekTypes = [{_id: lastWeek, puzzleCount: [{difficulty: "easy", count: 4}, {difficulty: "medium", count: 7}, {difficulty: "hard", count: 0}]}, 
            {_id: dayInLastWeek, puzzleCount: [{difficulty: "easy", count: 1}, {difficulty: "medium", count: 2}, {difficulty: "hard", count: 5}]}]
        const lastMonthTypes = [{_id: lastMonth, puzzleCount: [{difficulty: "easy", count: 2}, {difficulty: "medium", count: 1}, {difficulty: "hard", count: 1}]},
            {_id: lastWeek, puzzleCount: [{difficulty: "easy", count: 4}, {difficulty: "medium", count: 7}, {difficulty: "hard", count: 0}]},
            {_id: dayInLastWeek, puzzleCount: [{difficulty: "easy", count: 1}, {difficulty: "medium", count: 2}, {difficulty: "hard", count: 5}]}]
        const last3MonthsTypes = [{_id: last3Months, puzzleCount: [{difficulty: "easy", count: 6}, {difficulty: "medium", count: 15}, {difficulty: "hard", count: 9}]},
            {_id: lastMonth, puzzleCount: [{difficulty: "easy", count: 2}, {difficulty: "medium", count: 1}, {difficulty: "hard", count: 1}]},
            {_id: lastWeek, puzzleCount: [{difficulty: "easy", count: 4}, {difficulty: "medium", count: 7}, {difficulty: "hard", count: 0}]},
            {_id: dayInLastWeek, puzzleCount: [{difficulty: "easy", count: 1}, {difficulty: "medium", count: 2}, {difficulty: "hard", count: 5}]}]
        const allTimeTypes = [{_id: lastYear, puzzleCount: [{difficulty: "easy", count: 1}, {difficulty: "medium", count: 1}, {difficulty: "hard", count: 1}]},
            {_id: last3Months, puzzleCount: [{difficulty: "easy", count: 6}, {difficulty: "medium", count: 15}, {difficulty: "hard", count: 9}]},
            {_id: lastMonth, puzzleCount: [{difficulty: "easy", count: 2}, {difficulty: "medium", count: 1}, {difficulty: "hard", count: 1}]},
            {_id: lastWeek, puzzleCount: [{difficulty: "easy", count: 4}, {difficulty: "medium", count: 7}, {difficulty: "hard", count: 0}]},
            {_id: dayInLastWeek, puzzleCount: [{difficulty: "easy", count: 1}, {difficulty: "medium", count: 2}, {difficulty: "hard", count: 5}]}]

        jest.spyOn(PuzzleSolved, "aggregate").mockImplementationOnce(() => Promise.resolve(allTimeTypes));
        jest.spyOn(PuzzleSolved, "aggregate").mockImplementationOnce(() => Promise.resolve(lastWeekTypes));
        jest.spyOn(PuzzleSolved, "aggregate").mockImplementationOnce(() => Promise.resolve(lastMonthTypes));
        jest.spyOn(PuzzleSolved, "aggregate").mockImplementationOnce(() => Promise.resolve(last3MonthsTypes));


        const response = await request
            .get("/solved-puzzles/difficulty")
            .set("Cookie", ["jwt=token"])
        
        expect(response.body.status).toBe("success")

        let allTimeEasySum = 0;
        let allTimeMediumSum = 0;
        let allTimeHardSum = 0;

        for (let i = 0; i < response.body.data.allTimeArray.length; i++) {
            let currentEntry = response.body.data.allTimeArray[i].count;
            allTimeEasySum += currentEntry.easy
            allTimeMediumSum += currentEntry.medium
            allTimeHardSum += currentEntry.hard
        }

        expect(allTimeEasySum).toBe(14)
        expect(allTimeMediumSum).toBe(26)
        expect(allTimeHardSum).toBe(16)
    })

    test("Add a new solve for a puzzle", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
        .spyOn(User, "findOne")
        .mockImplementationOnce(({ userID }) =>
        user.userID === userID ? Promise.resolve(user) : null);

        let puzzle = new Sudoku({
            "puzzle-type": "sudoku",
            _id: new mongoose.Types.ObjectId()
        })

        jest.spyOn(Sudoku, "findOne")
        .mockImplementationOnce(({_id}) => puzzle._id.toString() === _id.toString() ? Promise.resolve(puzzle) : undefined);

        const today = new Date(new Date().setHours(0, 0, 0, 0));
        let newSolvedPuzzle = new PuzzleSolved({
            date: today,
            user: user._id,
            puzzle: puzzle._id,
            puzzleType: "sudoku"
        })

        jest.spyOn(PuzzleSolved, "create").mockImplementationOnce(() => Promise.resolve(newSolvedPuzzle))

        const response = await request
            .post("/solved-puzzles/addPuzzleSolvedRecord")
            .set("Cookie", ["jwt=token"])
            .send({
                "puzzleID": puzzle._id,
                "puzzleType": "sudoku"
            })

        expect(response.body.status).toBe("success")
        expect(response.body.data.newSolvedPuzzle.user.toString()).toBe(user._id.toString())
        expect(response.body.data.newSolvedPuzzle.puzzle.toString()).toBe(puzzle._id.toString())
    })

    test("Try to add a solve for an invalid puzzle", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
        .spyOn(User, "findOne")
        .mockImplementationOnce(({ userID }) =>
        user.userID === userID ? Promise.resolve(user) : null);   
        
        let puzzle = new Sudoku({
            "puzzle-type": "sudoku",
            _id: new mongoose.Types.ObjectId()
        })

        jest.spyOn(Sudoku, "findOne")
        .mockImplementationOnce(({_id}) => puzzle._id.toString() === _id.toString() ? Promise.resolve(puzzle) : undefined);

        const response = await request
            .post("/solved-puzzles/addPuzzleSolvedRecord")
            .set("Cookie", ["jwt=token"])
            .send({
                "puzzleID": new mongoose.Types.ObjectId(),
                "puzzleType": "sudoku"
            })

        expect(response.body.status).toBe("fail")
        expect(response.body.message).toBe("Puzzle ID and type do not match!")
    })
})
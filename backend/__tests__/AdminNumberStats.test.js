const app = require("../app");
const supertest = require("supertest");
const User = require("../Models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Sudoku = require("../Models/Sudoku_Model");
const Hashi = require("../Models/Hashi_Model");
const PuzzleSolved = require("../Models/PuzzleSolved");
const UserCount = require("../Models/UserCount");

describe("Tests for checking stat numbers for admins", () => {

    beforeEach(() => {
        request = supertest(app);
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Try getting a sudoku puzzle", async () => {

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
          recentSearchedPuzzles: [{
            puzzle: new mongoose.Types.ObjectId(),
            puzzleType: "sudoku"
          }],
          userID: "G26-id",
          isGuest: false,
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        const sudoku = new Sudoku({
            _id: new mongoose.Types.ObjectId()
        })

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);


        jest.spyOn(Sudoku, "findOne").mockImplementationOnce(() => Promise.resolve(sudoku));

        jest.spyOn(PuzzleSolved, "count").mockImplementationOnce(() => Promise.resolve(3));

        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .get(`/users/puzzle?puzzleID=${sudoku._id}&puzzleType=sudoku`)
            .set("Cookie", [`jwt=token`])
        
        expect(response.body.status).toBe("success");
        expect(response.body.data.puzzle._id.toString()).toBe(sudoku._id.toString());
        expect(response.body.data.numberOfUsersThatSolvedIt).toBe(3)
        expect(user.recentSearchedPuzzles.length).toBe(2);
        expect(user.recentSearchedPuzzles[0].puzzle.toString()).toBe(sudoku._id.toString());
    })

    test("Getting a puzzle that is in the user's recent searches", async() => {
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
          recentSearchedPuzzles: [{
            puzzle: new mongoose.Types.ObjectId(),
            puzzleType: "sudoku"
          }],
          userID: "G26-id",
          isGuest: false,
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        const sudoku = new Sudoku({
            _id: user.recentSearchedPuzzles[0].puzzle
        })

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);


        jest.spyOn(Sudoku, "findOne").mockImplementationOnce(() => Promise.resolve(sudoku));

        jest.spyOn(PuzzleSolved, "count").mockImplementationOnce(() => Promise.resolve(3));

        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .get(`/users/puzzle?puzzleID=${sudoku._id}&puzzleType=sudoku`)
            .set("Cookie", [`jwt=token`])
        
        expect(response.body.status).toBe("success");
        expect(response.body.data.puzzle._id.toString()).toBe(sudoku._id.toString());
        expect(response.body.data.numberOfUsersThatSolvedIt).toBe(3)
        expect(user.recentSearchedPuzzles.length).toBe(1);
    })

    test("User has multiple recent searches", async () => {
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
            recentSearchedPuzzles: [{
                puzzle: new mongoose.Types.ObjectId(),
                puzzleType: "sudoku"
            },
            {
                puzzle: new mongoose.Types.ObjectId(),
                puzzleType: "hashi"  
            }],
            userID: "G26-id",
            isGuest: false,
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        const hashi = new Hashi({
            _id: user.recentSearchedPuzzles[1].puzzle
        })

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);


        jest.spyOn(Hashi, "findOne").mockImplementationOnce(() => Promise.resolve(hashi));

        jest.spyOn(PuzzleSolved, "count").mockImplementationOnce(() => Promise.resolve(3));

        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .get(`/users/puzzle?puzzleID=${hashi._id}&puzzleType=hashi`)
            .set("Cookie", [`jwt=token`])
        
        expect(response.body.status).toBe("success");
        expect(response.body.data.puzzle._id.toString()).toBe(hashi._id.toString());
        expect(response.body.data.numberOfUsersThatSolvedIt).toBe(3)
        expect(user.recentSearchedPuzzles.length).toBe(2);
        expect(user.recentSearchedPuzzles[0].puzzle).toBe(hashi._id);
    })

    test("Try to get an invalid puzzle ID", async () => {
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
            recentSearchedPuzzles: [{
                puzzle: new mongoose.Types.ObjectId(),
                puzzleType: "sudoku"
            },
            {
                puzzle: new mongoose.Types.ObjectId(),
                puzzleType: "hashi"  
            }],
            userID: "G26-id",
            isGuest: false,
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


        jest.spyOn(Hashi, "findOne").mockImplementationOnce(() => Promise.resolve(null));

        const response = await request
            .get(`/users/puzzle?puzzleID=${user.recentSearchedPuzzles[1].puzzle}&puzzleType=hashi`)
            .set("Cookie", [`jwt=token`])

            expect(response.body.status).toBe("fail");
            expect(response.body.message).toBe("Could not find puzzle")
    })

    test("Get a user", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          recentSearchedUsers: [],
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        const userToFind = new User({
            name: "finder",
            email: "finder@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "creator",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
        });

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            userToFind.userID === userID ? Promise.resolve(userToFind) : null);
        jest.spyOn(PuzzleSolved, "aggregate")
            .mockImplementationOnce(() => Promise.resolve([
                {_id: "sudoku", count: 3},
                {_id: "eights_puzzle", count: 2},
                {_id: "hashi", count: 4}]
            ))
        
        jest.spyOn(PuzzleSolved, "aggregate")
            .mockImplementationOnce(() => Promise.resolve([
                {_id: "easy", count: 2},
                {_id: "medium", count: 5},
                {_id: "hard", count:2}
            ]))

        jest.spyOn(UserCount, "aggregate")
            .mockImplementationOnce(() => Promise.resolve([
                {_id: {month: 3, year: 2021}, count: 1},
                {_id: {month: 6, year: 2022}, count: 2},
                {_id: {month: 1, year: 2023}, count: 5},
                {_id: {month: 3, year: 2023}, count: 1}
            ]))
        
        jest.spyOn(UserCount, "aggregate")
            .mockImplementationOnce(() => Promise.resolve([
                {_id: {month: 1, year: 2023}, count: 5},
                {_id: {month: 3, year: 2023}, count: 1}
            ]))

        jest.spyOn(UserCount, "aggregate")
            .mockImplementationOnce(() => Promise.resolve([
                {_id: {month: 6, year: 2022}, count: 2},
                {_id: {month: 1, year: 2023}, count: 5},
                {_id: {month: 3, year: 2023}, count: 1}
            ]))

        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));
        
        const response = await request
            .get("/users/G26-id2")
            .set("Cookie", [`jwt=token`])

        expect(response.body.status).toBe("success");
        expect(user.recentSearchedUsers.length).toBe(1)
    })

    test("Invalid user ID", async () => {

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

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        const userToFind = new User({
            name: "finder",
            email: "finder@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "creator",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
        });

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            userToFind.userID === userID ? Promise.resolve(userToFind) : null);
        
        const response = await request
            .get("/users/G26-id3")
            .set("Cookie", [`jwt=token`])

        expect(response.body.status).toBe("fail");
        expect(response.body.message).toBe("Could not find user")
    })

    test("Get number of users that solved a puzzle", async () => {

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
    
        jest.spyOn(PuzzleSolved, "count").mockImplementationOnce(() => Promise.resolve(5));

        const response = await request
            .post("/users/number-of-solvers-puzzle")
            .set("Cookie", [`jwt=token`])
            .send({
                "puzzleID": "G26PUZ-ID",
                "puzzleType": "sudoku"
            })
        
        expect(response.body.status).toBe("success");
        expect(response.body.data.numberOfUsersThatSolvedIt).toBe(5);
    })

    test("Admin gets the users they've recently searched", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            recentSearchedUsers: [
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId(),
                new mongoose.Types.ObjectId()
            ],
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
            }))
        
        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);

        jest.spyOn(User, "findOne").mockImplementationOnce(() => User.findOne({}));
        jest.spyOn(mongoose.Query.prototype, "populate").mockImplementationOnce(() => Promise.resolve(user));
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .get("/users/recent-searched-users")
            .set("Cookie", ["jwt=token"])

        expect(response.body.status).toBe("success")
        expect(response.body.data.recentSearchedUsers.length).toBe(3)
        expect(response.body.data.recentSearchedUsers[0].toString()).toBe(user.recentSearchedUsers[0].toString())
    })

    test("Admin searches for recent users but has no recent users", async () => {
        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            recentSearchedUsers: [],
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
            }))
        
        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);

        jest.spyOn(User, "findOne").mockImplementationOnce(() => User.findOne({}));
        jest.spyOn(mongoose.Query.prototype, "populate").mockImplementationOnce(() => Promise.resolve(user));
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .get("/users/recent-searched-users")
            .set("Cookie", ["jwt=token"])

        expect(response.body.status).toBe("success")
        expect(response.body.data.recentSearchedUsers.length).toBe(0)
    })

    test("Get recently searched puzzles", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            recentSearchedPuzzles: [
                {puzzle: new mongoose.Types.ObjectId(), type: "sudoku"},
                {puzzle: new mongoose.Types.ObjectId(), type: "eights_puzzle"},
                {puzzle: new mongoose.Types.ObjectId(), type: "hashi"}
            ],
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
            }))
        
        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);

        jest.spyOn(User, "findOne").mockImplementationOnce(() => User.findOne({}));
        jest.spyOn(mongoose.Query.prototype, "populate").mockImplementationOnce(() => Promise.resolve(user));
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .get("/users/recent-searched-puzzles")
            .set("Cookie", ["jwt=token"])

        expect(response.body.status).toBe("success");
        expect(response.body.data.recentSearchedPuzzles.length).toBe(3)
        expect(response.body.data.recentSearchedPuzzles[0].puzzle.toString()).toBe(user.recentSearchedPuzzles[0].puzzle.toString())
    })

    test("Get recently searched puzzles when admin hasn't searched for any puzzles", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            recentSearchedPuzzles: [],
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
            }))
        
        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);

        jest.spyOn(User, "findOne").mockImplementationOnce(() => User.findOne({}));
        jest.spyOn(mongoose.Query.prototype, "populate").mockImplementationOnce(() => Promise.resolve(user));
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .get("/users/recent-searched-puzzles")
            .set("Cookie", ["jwt=token"])

        expect(response.body.status).toBe("success");
        expect(response.body.data.recentSearchedPuzzles.length).toBe(0)
    })

    test("Ban a user", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const userToBan = new User({
            name: "BanMe",
            email: "BanMe@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "creator",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            active: true,
            banSubject: null,
            banMessage: null
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
        }))

        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);
        jest.spyOn(User, "findOne").mockImplementationOnce(({_id}) => userToBan.userID === _id ? Promise.resolve(userToBan) : null);
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .post("/users/resolve-ban")
            .set("Cookie", ["jwt=token"])
            .send({
                "message": "You have been selected as a subject for a test ban",
                "subject": "Testing ban",
                "userID": userToBan.userID
            })

        expect(response.body.status).toBe("success");
        expect(response.body.data.user.active).toBe(false);
        expect(response.body.data.user.banMessage.subject).toBe("Testing ban")
        expect(response.body.data.user.banMessage.message).toBe("You have been selected as a subject for a test ban")
    })

    test("Check default messages can be used for banning", async() => {
        
        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const userToBan = new User({
            name: "BanMe",
            email: "BanMe@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "creator",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            active: true,
            banMessage: null
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
        }))

        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);
        jest.spyOn(User, "findOne").mockImplementationOnce(({_id}) => userToBan.userID === _id ? Promise.resolve(userToBan) : null);
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .post("/users/resolve-ban")
            .set("Cookie", ["jwt=token"])
            .send({
                "message": null,
                "subject": null,
                "userID": userToBan.userID
            })

        expect(response.body.status).toBe("success");
        expect(response.body.data.user.active).toBe(false);
        expect(response.body.data.user.banMessage.subject).toBe("Banned account")
        expect(response.body.data.user.banMessage.message).toBe("Your account has been permanently banned.")
    })

    test("Unban a user", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const userToBan = new User({
            name: "BanMe",
            email: "BanMe@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "creator",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            active: false,
            messages: []
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
        }))

        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);
        jest.spyOn(User, "findOne").mockImplementationOnce(({_id}) => userToBan.userID === _id ? Promise.resolve(userToBan) : null);
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .post("/users/resolve-ban")
            .set("Cookie", ["jwt=token"])
            .send({
                "message": "You have been selected as a subject for a test unban",
                "subject": "Testing unban",
                "userID": userToBan.userID
            })

        expect(response.body.status).toBe("success");
        expect(response.body.data.user.active).toBe(true);
        expect(response.body.data.user.messages[0].subject).toBe("Testing unban")
        expect(response.body.data.user.messages[0].message).toBe("You have been selected as a subject for a test unban")
    })

    test("Unban a user with default messages", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const userToBan = new User({
            name: "BanMe",
            email: "BanMe@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "creator",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            active: false,
            messages: []
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
        }))

        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);
        jest.spyOn(User, "findOne").mockImplementationOnce(({_id}) => userToBan.userID === _id ? Promise.resolve(userToBan) : null);
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .post("/users/resolve-ban")
            .set("Cookie", ["jwt=token"])
            .send({
                "message": null,
                "subject": null,
                "userID": userToBan.userID
            })

        expect(response.body.status).toBe("success");
        expect(response.body.data.user.active).toBe(true);
        expect(response.body.data.user.messages[0].subject).toBe("Account reactivation.")
        expect(response.body.data.user.messages[0].message).toBe("Your account has been reactivated upon recent actions.")
    })

    test("Try to ban a user that doesn't exist", async() => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const userToBan = new User({
            name: "BanMe",
            email: "BanMe@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "creator",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            active: true,
            banSubject: null,
            banMessage: null
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
        }))

        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);
        jest.spyOn(User, "findOne").mockImplementationOnce(({_id}) => userToBan.userID === _id ? Promise.resolve(userToBan) : null);
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .post("/users/resolve-ban")
            .set("Cookie", ["jwt=token"])
            .send({
                "message": "You have been selected as a subject for a test ban",
                "subject": "Testing ban",
                "userID": "G26-id4"
            })

        expect(response.body.status).toBe("fail");
        expect(response.body.message).toBe("Could not find user");
    })

    test("Disable a puzzle", async() => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const puzzleCreator = new User({
            name: "creator",
            email: "creator@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "creator",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            messages: []
        })

        const puzzle = new Sudoku({
            _id: new mongoose.Types.ObjectId(),
            active: true,
            "creator-id":  puzzleCreator.userID
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
        }))

        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);
        jest.spyOn(Sudoku, "findOne").mockImplementationOnce(({_id}) => puzzle._id.toString() === _id.toString() ? Promise.resolve(puzzle) : null);
        jest.spyOn(Sudoku.prototype, "save").mockImplementationOnce(() => Promise.resolve(true))
        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => puzzleCreator.userID === userID ? Promise.resolve(puzzleCreator): null)
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true))

        const response = await request
            .post("/users/toggle-puzzle-status")
            .set("Cookie", ["jwt=token"])
            .send({
                "puzzleID": puzzle._id,
                "puzzleType": "sudoku",
                "message": "disabling this sudoku for a test",
                "subject": "Test disable"
            })

        expect(response.body.status).toBe("success")
        expect(response.body.data.puzzle.active).toBe(false)
        expect(response.body.data.puzzleCreator.messages[0].subject).toBe("Test disable")
        expect(response.body.data.puzzleCreator.messages[0].message).toBe("disabling this sudoku for a test")
    })

    test("Reenable a puzzle", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const puzzleCreator = new User({
            name: "creator",
            email: "creator@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "creator",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            messages: []
        })

        const puzzle = new Sudoku({
            _id: new mongoose.Types.ObjectId(),
            active: false,
            "creator-id":  puzzleCreator.userID
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
        }))

        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);
        jest.spyOn(Sudoku, "findOne").mockImplementationOnce(({_id}) => puzzle._id.toString() === _id.toString() ? Promise.resolve(puzzle) : null);
        jest.spyOn(Sudoku.prototype, "save").mockImplementationOnce(() => Promise.resolve(true))
        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => puzzleCreator.userID === userID ? Promise.resolve(puzzleCreator): null)
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(true))

        const response = await request
            .post("/users/toggle-puzzle-status")
            .set("Cookie", ["jwt=token"])
            .send({
                "puzzleID": puzzle._id,
                "puzzleType": "sudoku",
                "message": "reenabling this sudoku for a test",
                "subject": "Test reenable"
            })

        expect(response.body.status).toBe("success")
        expect(response.body.data.puzzle.active).toBe(true)
        expect(response.body.data.puzzleCreator.messages[0].subject).toBe("Test reenable")
        expect(response.body.data.puzzleCreator.messages[0].message).toBe("reenabling this sudoku for a test")
    })

    test("Try to disable a puzzle that doesn't exist", async() => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);

        const user = new User({
            name: "Blabla",
            email: "Blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "administrator",
            groupID: 26,
            userID: "G26-id",
            isGuest: false
        })

        const puzzle = new Sudoku({
            _id: new mongoose.Types.ObjectId(),
            active: true,
        })

        const now = new Date();
        jest.spyOn(jwt, "verify")
            .mockImplementationOnce(() => ({
                displayName: user.name,
                groupID: user.groupID,
                userID: user.userID,
                role: "administrator",
                iat: parseInt(now.getTime() / 1000)
        }))

        jest.spyOn(User, "findOne").mockImplementationOnce(({userID}) => user.userID === userID ? Promise.resolve(user) : null);
        jest.spyOn(Sudoku, "findOne").mockImplementationOnce(({_id}) => puzzle._id.toString() === _id.toString() ? Promise.resolve(puzzle) : null);

        const response = await request
            .post("/users/toggle-puzzle-status")
            .set("Cookie", ["jwt=token"])
            .send({
                "puzzleID": new mongoose.Types.ObjectId(),
                "puzzleType": "sudoku",
                "message": "Disabling this sudoku for a test",
                "subject": "Test disable"
            })

        expect(response.body.status).toBe("fail")
        expect(response.body.message).toBe("Could not find puzzle")
    })
})
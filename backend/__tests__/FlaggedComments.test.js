const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const flaggedComment = require("../Models/FlaggedCommentTicket");
const feedbackModel = require("../Models/Feedback_Model")
const Sudoku = require("../Models/Sudoku_Model");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const { use } = require("../app");
const { expectCt } = require("helmet");
const { create } = require("../Models/User");
const e = require("express");

describe("test Flagged Puzzle Controller", () => {
    let query;
    let request;

    beforeAll(async () => {
        process.env = {
            ...process.env,
            JWT_COOKIE_EXPIRES_IN: 90,
        };
    });

    beforeEach(() => {
        request = supertest(app);
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("get number of flagged puzzles", async () => {
        //Mocking user existance
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

        jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
            userID === user.userID ? Promise.resolve(user) : null
        );

        const puzzle = new Sudoku(
            {"puzzle-type":"soduku","values":[[4, null, 5, null, 7, null, 9, 6, null],[7, null, 3, 4, null, 9, null, null, 5],[null, 2, 8, null, null, 1, null, 7, 4],[1, null, 7, 8, 3, null, 4, null, 6],[null, 9, 6, 7, null, 5, null, 1, null],[2, null, 4, 1, null, 6, 7, 5, 3],[null, 7, 2, 9, 8, null, 5, null, 1],[8, null, 1, 2, 5, 7, null, 4, null],[5, null, 9, null, 1, 3, 8, 2, 7]],"solution":[[4, 1, 5, 3, 7, 8, 9, 6, 2],[7, 6, 3, 4, 2, 9, 1, 8, 5],[9, 2, 8, 5, 6, 1, 3, 7, 4],[1, 5, 7, 8, 3, 2, 4, 9, 6],[3, 9, 6, 7, 4, 5, 2, 1, 8],[2, 8, 4, 1, 9, 6, 7, 5, 3],[6, 7, 2, 9, 8, 4, 5, 3, 1],[8, 3, 1, 2, 5, 7, 6, 4, 9],[5, 4, 9, 6, 1, 3, 8, 2, 7]],"creator-id":"g26-1","checker-id":"g26-1","difficulty":1,"grid-size":9}
          );
        const testFeedback = new feedbackModel(
            {
                "puzzle-id" : puzzle._id,
                "user-id" : user._id,
                rating : 5,
                comment : "this is a comment",
                active : true,
                datePosted : now
            }
        );
        
        const ticket1 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket2 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket3 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket4 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        )
        const ticket5 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const tickets = [ticket1,ticket2, ticket3, ticket4, ticket5];

        flagged = tickets.length;

        jest.spyOn(flaggedComment, "count").mockImplementationOnce( () =>{
            return Promise.resolve(tickets.length);
        })

        const response = await request.get("/flagged-comments//active-number").set("Cookie", ["jwt=token"]);

        expect(response.statusCode).toBe(200)
        expect(response.body.status).toBe("success");
        expect(response.body.data["numOfFlaggedComments"]).toBe(5);

    });

    test("get batch of flagged", async () => {
        //Mocking user existance
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

        jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
            userID === user.userID ? Promise.resolve(user) : null
        );

        const puzzle = new Sudoku(
            {"puzzle-type":"soduku","values":[[4, null, 5, null, 7, null, 9, 6, null],[7, null, 3, 4, null, 9, null, null, 5],[null, 2, 8, null, null, 1, null, 7, 4],[1, null, 7, 8, 3, null, 4, null, 6],[null, 9, 6, 7, null, 5, null, 1, null],[2, null, 4, 1, null, 6, 7, 5, 3],[null, 7, 2, 9, 8, null, 5, null, 1],[8, null, 1, 2, 5, 7, null, 4, null],[5, null, 9, null, 1, 3, 8, 2, 7]],"solution":[[4, 1, 5, 3, 7, 8, 9, 6, 2],[7, 6, 3, 4, 2, 9, 1, 8, 5],[9, 2, 8, 5, 6, 1, 3, 7, 4],[1, 5, 7, 8, 3, 2, 4, 9, 6],[3, 9, 6, 7, 4, 5, 2, 1, 8],[2, 8, 4, 1, 9, 6, 7, 5, 3],[6, 7, 2, 9, 8, 4, 5, 3, 1],[8, 3, 1, 2, 5, 7, 6, 4, 9],[5, 4, 9, 6, 1, 3, 8, 2, 7]],"creator-id":"g26-1","checker-id":"g26-1","difficulty":1,"grid-size":9}
          );
        const testFeedback = new feedbackModel(
            {
                "puzzle-id" : puzzle._id,
                "user-id" : user._id,
                rating : 5,
                comment : "this is a comment",
                active : true,
                datePosted : now
            }
        );
        
        const ticket1 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket2 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket3 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket4 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        )
        const ticket5 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const tickets = [ticket1,ticket2, ticket3, ticket4, ticket5];

        flagged = tickets.length;

        jest.spyOn(flaggedComment, "find").mockImplementationOnce(() => flaggedComment.find({}))
        jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => mongoose.Query.prototype.sort({}))
        jest.spyOn(mongoose.Query.prototype, "skip").mockImplementationOnce(() => mongoose.Query.prototype.skip({}))
        jest.spyOn(mongoose.Query.prototype, "limit").mockImplementationOnce(() => Promise.resolve(tickets.slice(0,4)))


        
        const response = await request.get("/flagged-comments/active/skip/0").set("Cookie", ["jwt=token"]);

        console.log(response.body);

        expect(response.statusCode).toBe(200)
        expect(response.body.status).toBe("success");
        expect(response.body.data["batchSize"]).toBe(4);

    });
    test("unsuccessful flag of comment send", async () =>{
        //Mocking user existance
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

        jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
            userID === user.userID ? Promise.resolve(user) : null
        );

        const puzzle = new Sudoku(
            {"puzzle-type":"soduku","values":[[4, null, 5, null, 7, null, 9, 6, null],[7, null, 3, 4, null, 9, null, null, 5],[null, 2, 8, null, null, 1, null, 7, 4],[1, null, 7, 8, 3, null, 4, null, 6],[null, 9, 6, 7, null, 5, null, 1, null],[2, null, 4, 1, null, 6, 7, 5, 3],[null, 7, 2, 9, 8, null, 5, null, 1],[8, null, 1, 2, 5, 7, null, 4, null],[5, null, 9, null, 1, 3, 8, 2, 7]],"solution":[[4, 1, 5, 3, 7, 8, 9, 6, 2],[7, 6, 3, 4, 2, 9, 1, 8, 5],[9, 2, 8, 5, 6, 1, 3, 7, 4],[1, 5, 7, 8, 3, 2, 4, 9, 6],[3, 9, 6, 7, 4, 5, 2, 1, 8],[2, 8, 4, 1, 9, 6, 7, 5, 3],[6, 7, 2, 9, 8, 4, 5, 3, 1],[8, 3, 1, 2, 5, 7, 6, 4, 9],[5, 4, 9, 6, 1, 3, 8, 2, 7]],"creator-id":"g26-1","checker-id":"g26-1","difficulty":1,"grid-size":9}
          );
        const testFeedback = new feedbackModel(
            {
                "puzzle-id" : puzzle._id,
                "user-id" : user._id,
                rating : 5,
                comment : "this is a comment",
                active : true,
                datePosted : now
            }
        );
        
        const ticket1 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket2 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket3 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket4 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        )
        const ticket5 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const tickets = [ticket1,ticket2, ticket3, ticket4, ticket5];

        flagged = tickets.length;

        jest.spyOn(mongoose.Model.prototype, "save").mockImplementationOnce((func) =>{
            func(true)
        })

        const response = await request.post("/flagged-comments/send-ticket").set("Cookie", ["jwt=token"]).send(
            {
                "info" : {
                    textSubmitted : "i flag this puzzle",
                    feedbackID : testFeedback._id,
                    userID : user._id,
                }
            }
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.added).toBe(false);

    });
    test("successful flag of comment", async () =>{
        //Mocking user existance
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

        jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
            userID === user.userID ? Promise.resolve(user) : null
        );

        const puzzle = new Sudoku(
            {"puzzle-type":"soduku","values":[[4, null, 5, null, 7, null, 9, 6, null],[7, null, 3, 4, null, 9, null, null, 5],[null, 2, 8, null, null, 1, null, 7, 4],[1, null, 7, 8, 3, null, 4, null, 6],[null, 9, 6, 7, null, 5, null, 1, null],[2, null, 4, 1, null, 6, 7, 5, 3],[null, 7, 2, 9, 8, null, 5, null, 1],[8, null, 1, 2, 5, 7, null, 4, null],[5, null, 9, null, 1, 3, 8, 2, 7]],"solution":[[4, 1, 5, 3, 7, 8, 9, 6, 2],[7, 6, 3, 4, 2, 9, 1, 8, 5],[9, 2, 8, 5, 6, 1, 3, 7, 4],[1, 5, 7, 8, 3, 2, 4, 9, 6],[3, 9, 6, 7, 4, 5, 2, 1, 8],[2, 8, 4, 1, 9, 6, 7, 5, 3],[6, 7, 2, 9, 8, 4, 5, 3, 1],[8, 3, 1, 2, 5, 7, 6, 4, 9],[5, 4, 9, 6, 1, 3, 8, 2, 7]],"creator-id":"g26-1","checker-id":"g26-1","difficulty":1,"grid-size":9}
          );
        const testFeedback = new feedbackModel(
            {
                "puzzle-id" : puzzle._id,
                "user-id" : user._id,
                rating : 5,
                comment : "this is a comment",
                active : true,
                datePosted : now
            }
        );
        
        const ticket1 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket2 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket3 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const ticket4 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        )
        const ticket5 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
        );
        const tickets = [ticket1,ticket2, ticket3, ticket4, ticket5];

        flagged = tickets.length;

        jest.spyOn(mongoose.Model.prototype, "save").mockImplementationOnce((func) =>{
            func(false)
        })

        const response = await request.post("/flagged-comments/send-ticket").set("Cookie", ["jwt=token"]).send(
            {
                "info" : {
                    textSubmitted : "i flag this puzzle",
                    feedbackID : testFeedback._id,
                    userID : user._id,
                }
            }
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.added).toBe(true);

    });
    test("unsuccesful resolve because of invalid flag", async () => {
        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
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
          jest.spyOn(User, "findOne").mockImplementation(() =>
              {return Promise.resolve(user)}
          )

          const puzzle = new Sudoku(
            {"puzzle-type":"soduku","values":[[4, null, 5, null, 7, null, 9, 6, null],[7, null, 3, 4, null, 9, null, null, 5],[null, 2, 8, null, null, 1, null, 7, 4],[1, null, 7, 8, 3, null, 4, null, 6],[null, 9, 6, 7, null, 5, null, 1, null],[2, null, 4, 1, null, 6, 7, 5, 3],[null, 7, 2, 9, 8, null, 5, null, 1],[8, null, 1, 2, 5, 7, null, 4, null],[5, null, 9, null, 1, 3, 8, 2, 7]],"solution":[[4, 1, 5, 3, 7, 8, 9, 6, 2],[7, 6, 3, 4, 2, 9, 1, 8, 5],[9, 2, 8, 5, 6, 1, 3, 7, 4],[1, 5, 7, 8, 3, 2, 4, 9, 6],[3, 9, 6, 7, 4, 5, 2, 1, 8],[2, 8, 4, 1, 9, 6, 7, 5, 3],[6, 7, 2, 9, 8, 4, 5, 3, 1],[8, 3, 1, 2, 5, 7, 6, 4, 9],[5, 4, 9, 6, 1, 3, 8, 2, 7]],"creator-id":"g26-1","checker-id":"g26-1","difficulty":1,"grid-size":9}
          );
          const testFeedback = new feedbackModel(
            {
                "puzzle-id" : puzzle._id,
                "user-id" : user._id,
                rating : 5,
                comment : "this is a comment",
                active : true,
                datePosted : now
            }
        );
          
          const ticket4 = new flaggedComment(
            {
                feedback : testFeedback._id,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
          );

          


        jest.spyOn(flaggedComment, "findOne").mockImplementationOnce(({ }) => {
            return Promise.resolve(null)
        });

          const response = await request.post("/flagged-comments/resolve-ticket").set("Cookie", ["jwt=token"]).send(
            {
                ticketID: ticket4._id,
                message : ticket4.message,
                subject : "puzzle bad",
                isIssue : true,
                banAccount : false
            }
        );

        expect(response.statusCode).toBe(404)
        expect(response.body.status).toBe("fail");

    });
    test("successful flag resolve where commenter is banned", async () => {
        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
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
          jest.spyOn(User, "findOne").mockImplementation(() =>
              {return Promise.resolve(user)}
          )

          const puzzle = new Sudoku(
            {"puzzle-type":"soduku","values":[[4, null, 5, null, 7, null, 9, 6, null],[7, null, 3, 4, null, 9, null, null, 5],[null, 2, 8, null, null, 1, null, 7, 4],[1, null, 7, 8, 3, null, 4, null, 6],[null, 9, 6, 7, null, 5, null, 1, null],[2, null, 4, 1, null, 6, 7, 5, 3],[null, 7, 2, 9, 8, null, 5, null, 1],[8, null, 1, 2, 5, 7, null, 4, null],[5, null, 9, null, 1, 3, 8, 2, 7]],"solution":[[4, 1, 5, 3, 7, 8, 9, 6, 2],[7, 6, 3, 4, 2, 9, 1, 8, 5],[9, 2, 8, 5, 6, 1, 3, 7, 4],[1, 5, 7, 8, 3, 2, 4, 9, 6],[3, 9, 6, 7, 4, 5, 2, 1, 8],[2, 8, 4, 1, 9, 6, 7, 5, 3],[6, 7, 2, 9, 8, 4, 5, 3, 1],[8, 3, 1, 2, 5, 7, 6, 4, 9],[5, 4, 9, 6, 1, 3, 8, 2, 7]],"creator-id":"g26-1","checker-id":"g26-1","difficulty":1,"grid-size":9}
          );
          const testFeedback = new feedbackModel(
            {
                "puzzle-id" : puzzle._id,
                "user-id" : user._id,
                rating : 5,
                comment : "this is a comment",
                active : true,
                datePosted : now
            }
        );
          
          const ticket4 = new flaggedComment(
            {
                feedback : testFeedback,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
          );

          


        jest.spyOn(flaggedComment, "findOne").mockImplementationOnce(({ }) => {
            return Promise.resolve(ticket4)
        });
        jest.spyOn(mongoose.Model.prototype, "save").mockImplementation(() => {
            return Promise.resolve();
        });

          const response = await request.post("/flagged-comments/resolve-ticket").set("Cookie", ["jwt=token"]).send(
            {
                ticketID: ticket4._id,
                message : ticket4.message,
                subject : "puzzle bad",
                isIssue : true,
                banAccount : true
            }
        );

        expect(response.statusCode).toBe(200)
        expect(response.body.status).toBe("success");

        expect(user.active).toBe(false);
        expect(user).toHaveProperty("banMessage");
        
        expect(response.body).toHaveProperty("data");
    });
    test("successful flag where commenter is not banned", async () => {
        
        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
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
            jest.spyOn(User, "findOne").mockImplementation(() =>
                {return Promise.resolve(user)}
            )

            const puzzle = new Sudoku(
            {"puzzle-type":"soduku","values":[[4, null, 5, null, 7, null, 9, 6, null],[7, null, 3, 4, null, 9, null, null, 5],[null, 2, 8, null, null, 1, null, 7, 4],[1, null, 7, 8, 3, null, 4, null, 6],[null, 9, 6, 7, null, 5, null, 1, null],[2, null, 4, 1, null, 6, 7, 5, 3],[null, 7, 2, 9, 8, null, 5, null, 1],[8, null, 1, 2, 5, 7, null, 4, null],[5, null, 9, null, 1, 3, 8, 2, 7]],"solution":[[4, 1, 5, 3, 7, 8, 9, 6, 2],[7, 6, 3, 4, 2, 9, 1, 8, 5],[9, 2, 8, 5, 6, 1, 3, 7, 4],[1, 5, 7, 8, 3, 2, 4, 9, 6],[3, 9, 6, 7, 4, 5, 2, 1, 8],[2, 8, 4, 1, 9, 6, 7, 5, 3],[6, 7, 2, 9, 8, 4, 5, 3, 1],[8, 3, 1, 2, 5, 7, 6, 4, 9],[5, 4, 9, 6, 1, 3, 8, 2, 7]],"creator-id":"g26-1","checker-id":"g26-1","difficulty":1,"grid-size":9}
            );
            const testFeedback = new feedbackModel(
            {
                "puzzle-id" : puzzle._id,
                "user-id" : user._id,
                rating : 5,
                comment : "this is a comment",
                active : true,
                datePosted : now
            }
        );
            
            const ticket4 = new flaggedComment(
            {
                feedback : testFeedback,
                ticketer : user._id,
                active : true,
                datePosted : now,
                message : "bad comment",
                admin : user._id
            }
            );

            


        jest.spyOn(flaggedComment, "findOne").mockImplementationOnce(({ }) => {
            return Promise.resolve(ticket4)
        });
        jest.spyOn(mongoose.Model.prototype, "save").mockImplementation(() => {
            return Promise.resolve();
        });

            const response = await request.post("/flagged-comments/resolve-ticket").set("Cookie", ["jwt=token"]).send(
            {
                ticketID: ticket4._id,
                message : ticket4.message,
                subject : "puzzle bad",
                isIssue : true,
                banAccount : false
            }
        );

        expect(response.statusCode).toBe(200)
        expect(response.body.status).toBe("success");

        expect(user.active).toBe(true);
        expect(user).toHaveProperty("messages");
        
        expect(response.body).toHaveProperty("data");

    });

});
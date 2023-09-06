const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const flaggedPuzzle = require("../Models/FlaggedPuzzleTicket");
const Sudoku = require("../Models/Sudoku_Model");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const { use } = require("../app");
const { expectCt } = require("helmet");
const FlaggedCommentTicketModel = require("../Models/FlaggedCommentTicket");
const { create } = require("../Models/User");

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

    test("get number of flagged puzzles test", async () => {
        
        //array of flagged puzzle tickets
        tickets = [{message : "flag1", puzzle : new mongoose.Types.ObjectId(), puzzleType : "sudoku", ticketer : new mongoose.Types.ObjectId(), active : false},
        {message : "flag2", puzzle : new mongoose.Types.ObjectId(), puzzleType : "sudoku", ticketer : new mongoose.Types.ObjectId(), active : true},
        {message : "flag3", puzzle : new mongoose.Types.ObjectId(), puzzleType : "sudoku", ticketer : new mongoose.Types.ObjectId(),active : true},
        {message : "flag4", puzzle : new mongoose.Types.ObjectId(), puzzleType : "sudoku", ticketer : new mongoose.Types.ObjectId(), active : false},
        {message : "flag5", puzzle : new mongoose.Types.ObjectId(), puzzleType : "sudoku", ticketer : new mongoose.Types.ObjectId(),active : true},
        {message : "flag6", puzzle : new mongoose.Types.ObjectId(), puzzleType : "sudoku", ticketer : new mongoose.Types.ObjectId(), active : false},
        {message : "flag7", puzzle : new mongoose.Types.ObjectId(), puzzleType : "sudoku", ticketer : new mongoose.Types.ObjectId(),active : true},
        {message : "flag8", puzzle : new mongoose.Types.ObjectId(), puzzleType : "sudoku", ticketer : new mongoose.Types.ObjectId(), active : true},
        {message : "flag9", puzzle : new mongoose.Types.ObjectId(), puzzleType : "sudoku", ticketer : new mongoose.Types.ObjectId(),active : false},
        {message : "flag10", puzzle : new mongoose.Types.ObjectId(), puzzleType : "sudoku", ticketer : new mongoose.Types.ObjectId(), active : false}]

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
        )


        flagged = tickets.filter((current) => current["active"] == true).length;
        jest.spyOn(mongoose.Query.prototype, "count").mockImplementationOnce(()=>Promise.resolve(flagged));

        const response = await request.get("/flagged-puzzles/active-number").set("Cookie", ["jwt=token"]);


        expect(response.statusCode).toBe(200)
        expect(response.body.status).toBe("success");
        expect(response.body.data["numOfFlaggedPuzzles"]).toBe(5);
    });

    test("get batch of flagged puzzles", async () => {
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
        ticket1 = new flaggedPuzzle(
            {
                message : "bad puzzle",
                puzzle : puzzle,
                puzzleType : "sudoku",
                ticketer : user._id,
                admin : user._id
            }
        );
        ticket2 = new flaggedPuzzle(
            {
                message : "bad puzzle",
                puzzle : puzzle,
                puzzleType : "sudoku",
                ticketer : user._id,
                admin : user._id
            }
        );
        ticket3 = new flaggedPuzzle(
            {
                message : "bad puzzle",
                puzzle : puzzle,
                puzzleType : "sudoku",
                ticketer : user._id,
                admin : user._id
            }
        );
        ticket4 = new flaggedPuzzle(
            {
                message : "bad puzzle",
                puzzle : puzzle,
                puzzleType : "sudoku",
                ticketer : user._id,
                admin : user._id
            }
        );
        ticket5 = new flaggedPuzzle(
            {
                message : "bad puzzle",
                puzzle : puzzle,
                puzzleType : "sudoku",
                ticketer : user._id,
                admin : user._id
            }
        );
        
        //add skip and limit to Array Prototype
        Array.prototype.skip = function() {
            return this;
        }
        //array of flagged puzzle tickets
        flagged = [ticket1, ticket2, ticket3, ticket4, ticket5];

        jest.spyOn(flaggedPuzzle, "find").mockImplementationOnce(() => flaggedPuzzle.find({}))
        jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => mongoose.Query.prototype.sort({}))
        jest.spyOn(mongoose.Query.prototype, "skip").mockImplementationOnce(() => mongoose.Query.prototype.skip({}))
        jest.spyOn(mongoose.Query.prototype, "limit").mockImplementationOnce(() => Promise.resolve(flagged))


        
        const response = await request.get("/flagged-puzzles/active/skip/0").set("Cookie", ["jwt=token"]);

        console.log(response.body);

        expect(response.statusCode).toBe(200)
        expect(response.body.status).toBe("success");
        expect(response.body.data["batchSize"]).toBe(4);
    });



    test("unsuccessful flag ticket send", async () => {
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

          jest.spyOn(mongoose.Model.prototype, "save").mockImplementation((func) => {
            func(true)
        });
        
        
        const response = await request.post("/flagged-puzzles/send-ticket").set("Cookie", ["jwt=token"]).send(
            {
                "info" : {
                    textSubmitted : "i flag this puzzle",
                    puzzleID : puzzle._id,
                    userID : user._id,
                    puzzleType : "sudoku"
                }
            }
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.added).toBe(false);


    });

    test("successful flag ticket send", async () => {
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

          jest.spyOn(mongoose.Model.prototype, "save").mockImplementation((func) => {
            func(false)
        });
        
        
        const response = await request.post("/flagged-puzzles/send-ticket").set("Cookie", ["jwt=token"]).send(
            {
                "info" : {
                    textSubmitted : "i flag this puzzle",
                    puzzleID : puzzle._id,
                    userID : user._id,
                    puzzleType : "sudoku"
                }
            }
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.added).toBe(true);
        expect(response.body).toHaveProperty("ticketID");

    });

    test("unsuccessful resolve due to invalid ticket", async () => {
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

          ticket = new flaggedPuzzle(
            {
                message : "bad puzzle",
                puzzle : puzzle,
                puzzleType : "sudoku",
                ticketer : user._id,
                admin : user._id
            }
        );


        jest.spyOn(flaggedPuzzle, "findOne").mockImplementationOnce(({ }) => {
            return Promise.resolve(null)
        });

          const response = await request.post("/flagged-puzzles/resolve-ticket").set("Cookie", ["jwt=token"]).send(
            {
                ticketID: ticket._id,
                message : ticket.message,
                subject : "puzzle bad",
                isIssue : true
            }
        );

        expect(response.statusCode).toBe(404)
        expect(response.body.status).toBe("fail");
    })

    test("successful resolve of flagged ticket where is issue is true", async () => {
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

          const puzzle = new Sudoku(
            {"puzzle-type":"soduku","values":[[4, null, 5, null, 7, null, 9, 6, null],[7, null, 3, 4, null, 9, null, null, 5],[null, 2, 8, null, null, 1, null, 7, 4],[1, null, 7, 8, 3, null, 4, null, 6],[null, 9, 6, 7, null, 5, null, 1, null],[2, null, 4, 1, null, 6, 7, 5, 3],[null, 7, 2, 9, 8, null, 5, null, 1],[8, null, 1, 2, 5, 7, null, 4, null],[5, null, 9, null, 1, 3, 8, 2, 7]],"solution":[[4, 1, 5, 3, 7, 8, 9, 6, 2],[7, 6, 3, 4, 2, 9, 1, 8, 5],[9, 2, 8, 5, 6, 1, 3, 7, 4],[1, 5, 7, 8, 3, 2, 4, 9, 6],[3, 9, 6, 7, 4, 5, 2, 1, 8],[2, 8, 4, 1, 9, 6, 7, 5, 3],[6, 7, 2, 9, 8, 4, 5, 3, 1],[8, 3, 1, 2, 5, 7, 6, 4, 9],[5, 4, 9, 6, 1, 3, 8, 2, 7]],"creator-id":"g26-1","checker-id":"g26-1","difficulty":1,"grid-size":9}
          );
  
          jest.spyOn(User, "findOne").mockImplementation(() =>
              {return Promise.resolve(user)}
          )

        ticket = new flaggedPuzzle(
            {
                message : "bad puzzle",
                puzzle : puzzle,
                puzzleType : "sudoku",
                ticketer : user._id,
                admin : user._id
            }
        );

        jest.spyOn(flaggedPuzzle, "findOne").mockImplementationOnce(({ }) => {
            return Promise.resolve(ticket)
        });
        jest.spyOn(mongoose.Model.prototype, "save").mockImplementation(() => {
            return Promise.resolve(true)
        });

        
        const response = await request.post("/flagged-puzzles/resolve-ticket").set("Cookie", ["jwt=token"]).send(
            {
                ticketID: ticket._id,
                message : ticket.message,
                subject : "puzzle bad",
                isIssue : true
            }
        );

        expect(ticket.admin).toBe(user);
        expect(ticket.active).toBe(false);

        expect(puzzle.active).toBe(false);

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("success");


    });
    test("successful resolve of flagged ticket where is issue is false", async () => {
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

          const puzzle = new Sudoku(
            {"puzzle-type":"soduku","values":[[4, null, 5, null, 7, null, 9, 6, null],[7, null, 3, 4, null, 9, null, null, 5],[null, 2, 8, null, null, 1, null, 7, 4],[1, null, 7, 8, 3, null, 4, null, 6],[null, 9, 6, 7, null, 5, null, 1, null],[2, null, 4, 1, null, 6, 7, 5, 3],[null, 7, 2, 9, 8, null, 5, null, 1],[8, null, 1, 2, 5, 7, null, 4, null],[5, null, 9, null, 1, 3, 8, 2, 7]],"solution":[[4, 1, 5, 3, 7, 8, 9, 6, 2],[7, 6, 3, 4, 2, 9, 1, 8, 5],[9, 2, 8, 5, 6, 1, 3, 7, 4],[1, 5, 7, 8, 3, 2, 4, 9, 6],[3, 9, 6, 7, 4, 5, 2, 1, 8],[2, 8, 4, 1, 9, 6, 7, 5, 3],[6, 7, 2, 9, 8, 4, 5, 3, 1],[8, 3, 1, 2, 5, 7, 6, 4, 9],[5, 4, 9, 6, 1, 3, 8, 2, 7]],"creator-id":"g26-1","checker-id":"g26-1","difficulty":1,"grid-size":9}
          );
  
          jest.spyOn(User, "findOne").mockImplementation(() =>
              {return Promise.resolve(user)}
          )

        ticket = new flaggedPuzzle(
            {
                message : "bad puzzle",
                puzzle : puzzle,
                puzzleType : "sudoku",
                ticketer : user._id,
                admin : user._id
            }
        );

        jest.spyOn(flaggedPuzzle, "findOne").mockImplementationOnce(({ }) => {
            return Promise.resolve(ticket)
        });
        jest.spyOn(mongoose.Model.prototype, "save").mockImplementation(() => {
            return Promise.resolve(true)
        });

        
        const response = await request.post("/flagged-puzzles/resolve-ticket").set("Cookie", ["jwt=token"]).send(
            {
                ticketID: ticket._id,
                message : ticket.message,
                subject : "puzzle bad",
                isIssue : false
            }
        );
        

        expect(ticket.admin).toBe(user);
        expect(ticket.active).toBe(false);

        expect(puzzle.active).toBe(true);

        expect(user).toHaveProperty("messages");
        expect(user.messages[0]["subject"]).toBe("puzzle bad");
        expect(user.messages[0]["message"]).toBe(ticket.message);



        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("success");


    });

})
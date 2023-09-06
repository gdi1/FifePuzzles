const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const feedback_model = require("../Models/Feedback_Model");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const { use } = require("../app");
const { expectCt } = require("helmet");

describe("test feedback routes", () => {
    let query;
    let request;
    beforeAll(async () => {
        process.env = {
            ...process.env,
            JWT_COOKIE_EXPIRES_IN: 90,
        };
        sudoku_game_json = {"puzzle-type":"sudoku","values":[[null,null,4,9,null,null,null,3,8],[null,null,null,null,null,null,6,null,null],[2,null,null,5,null,null,null,9,null],[7,null,null,null,null,5,4,8,null],[8,null,null,null,7,null,null,null,3],[null,9,3,8,null,null,null,null,1],[null,8,null,null,null,4,null,null,6],[null,null,7,null,null,null,null,null,null],[3,1,null,null,null,8,7,null,null]],"solution":[[1,5,4,9,6,7,2,3,8],[9,3,8,1,4,2,6,5,7],[2,7,6,5,8,3,1,9,4],[7,6,1,3,9,5,4,8,2],[8,2,5,4,7,1,9,6,3],[4,9,3,8,2,6,5,7,1],[5,8,9,7,1,4,3,2,6],[6,4,7,2,3,9,8,1,5],[3,1,2,6,5,8,7,4,9]],"creator-id":"G26-63654f228e851d847a951a63","checker-id":"G26-63654f228e851d847a951a63","difficulty":80, "puzzle-id" : "test-puzzle"};
        feedback_valid = {"puzzle-id" : "test-puzzle", "user-id" : "test-user", rating : 5, comment : "good", active : true};
        feedback_invalid = {};
        query = feedback_model.find({});
    });
    beforeEach(() => {
        request = supertest(app);
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    test("successful add", async () => 
    {
        //Mocking user existance
        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        const user = new User({
            name: "Blabla",
            email: "blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass12345",
            passwordChangeDate,
            groupID: 26,
            role: "creator",
            userID: "G26-id",
            isGuest: false,
        });
        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role: "creator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
            userID === user.userID ? Promise.resolve(user) : null
        )

        jest.spyOn(feedback_model, "find").mockImplementationOnce(() => query);

        jest.spyOn(mongoose.Query.prototype, "exec")
        .mockImplementationOnce(() => Promise.resolve(feedback_valid))
        jest
        .spyOn(mongoose.Model.prototype, "save")
        .mockImplementationOnce((func) => func(false));


        const response= await request.post("/feedback/add_feedback")/*.set("Cookie", ["jwt=token"])*/.send({
            "puzzle-id" : "test-puzzle",
            "user-id" : "G26-id",
            rating : 5,
            "comment-body" : "blbllbl"
        });

        console.log(response.body);

        expect(response.body.added).toBe(true);
        expect(response.body.message).toBe("feedback added");

    });

    test("unsuccessful add puzzle", async () => {
        //Mocking user existance
        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        const user = new User({
            name: "Blabla",
            email: "blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass12345",
            passwordChangeDate,
            groupID: 26,
            role: "creator",
            userID: "G26-id",
            isGuest: false,
        });
        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role: "creator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
            userID === user.userID ? Promise.resolve(user) : null
        )

        jest.spyOn(feedback_model, "find").mockImplementationOnce(() => query);

        jest.spyOn(mongoose.Query.prototype, "exec")
        .mockImplementationOnce(() => Promise.resolve(feedback_valid))
        /*jest
        .spyOn(mongoose.Model.prototype, "save")
        .mockImplementationOnce((func) => func(true));*/


        const response= await request.post("/feedback/add_feedback")/*.set("Cookie", ["jwt=token"])*/.send({
            "puzzle-id" : "test-puzzle",
        });

        console.log(response.body);

        expect(response.body.added).toBe(false);
        expect(response.body.message).toBe("failed on server");

    });
    


    
    test("successful get comment", async () => {
        jest.spyOn(feedback_model, "find").mockImplementationOnce(() => query);

        jest.spyOn(mongoose.Query.prototype, "exec")
        .mockImplementationOnce(() => Promise.resolve(feedback_valid))

        //Getting feeedback
        console.log("getting feedback")
        const response= await request.post("/feedback/get_feedback")/*.set("Cookie", ["jwt=token"])*/.send({
            "puzzle-id" : "test-puzzle"
        });

        

        //get result from find
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("comment");
        expect(response.body).toHaveProperty("rating");
        expect(response.body).toHaveProperty("puzzle-id");
        expect(response.body).toHaveProperty("user-id");

    });

})
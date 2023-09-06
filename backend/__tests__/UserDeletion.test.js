const app = require("../app");
const supertest = require("supertest");
const User = require("../Models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

describe("Tests for deleting users", () =>{

    let query;
    let request;
    let user;

    beforeAll(() => {
        process.env = {
            ...process.env,
            JWT_COOKIE_EXPIRES_IN: 90,
          };
      
          const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
          // create mock user
          user = new User({
            name: "Blabla",
            email: "blabla@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "solver",
            groupID: 26,
            userID: "G26-id",
            isGuest: false,
          });
          query = User.findOne({});
    })

    beforeEach(() => {
        request = supertest(app);
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Successfully delete a user", async () => {
    
        // mock the functions that need access to the database
        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);
        
        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(() => query);

        jest
            .spyOn(mongoose.Query.prototype, "select")
            .mockImplementationOnce(() => Promise.resolve(user));

        jest
            .spyOn(User.prototype, "correctPassword")
            .mockImplementationOnce(() => Promise.resolve(true));

        jest
            .spyOn(User, "deleteOne")
            .mockImplementationOnce(() => Promise.resolve(true));

        /* 
        Mock function for creating jwt since this is not the purpose of the test
        Should test the code logic executed at this endpoint independently of the workability of other imports
        that the application is depdendent on, but had no contribution in their implementation
        */
        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"creator",
            iat: parseInt(now.getTime() / 1000),
        }));
        
        const response = await request
        .post("/users/delete-account")
        .set("Cookie", [`jwt=token`])
        .send({"password": "pass1234"})

        expect(response.body.status).toBe("success")
    })

    test("User isn't deleted if password is incorrect", async () => {
        // mock the functions that need access to the database
        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);
        
            jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(() => query);

        jest
            .spyOn(mongoose.Query.prototype, "select")
            .mockImplementationOnce(() => Promise.resolve(user));

        jest
            .spyOn(User.prototype, "correctPassword")
            .mockImplementationOnce(() => Promise.resolve(false));

        /* 
        Mock function for creating jwt since this is not the purpose of the test
        Should test the code logic executed at this endpoint independently of the workability of other imports
        that the application is depdendent on, but had no contribution in their implementation
        */
        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"creator",
            iat: parseInt(now.getTime() / 1000),
        }));
        
        const response = await request
        .post("/users/delete-account")
        .set("Cookie", [`jwt=token`])
        .send({"password": "pass1235"})

        expect(response.body.status).toBe("fail")
        expect(response.body.message).toBe("Incorrect password!")
    })
})
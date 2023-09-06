const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");

/**
 * Test suit checking the functionality of the endpoint allowing users to log into our webiste
 */
describe("test login", () => {
  let query;
  let user;
  let request;

  beforeAll(() => {
    process.env = {
      ...process.env,
      JWT_COOKIE_EXPIRES_IN: 90,
    };

    // create mock user
    user = new User({
      name: "Blabla",
      password: "pass1234",
      groupID: 26,
      userID: "G26-aaa",
      email: "blabla@gmail.com",
    });
    query = User.findOne({});
  });

  beforeEach(() => {
    request = supertest(app);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("successfull login", async () => {
    // mock the functions that need access to the database
    jest.spyOn(User, "findOne").mockImplementationOnce(() => query);

    jest
      .spyOn(mongoose.Query.prototype, "select")
      .mockImplementationOnce(() => Promise.resolve(user));

    jest
      .spyOn(User.prototype, "correctPassword")
      .mockImplementationOnce(() => Promise.resolve(true));

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-jwt");

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/login").send({
      email: "blabla@gmail.com",
      password: "pass1234",
    });

    // check the response is as expected
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("token");

    const cookiePair = response.header["set-cookie"][0].split("=");
    const cookieKey = cookiePair[0];
    const cookieValue = cookiePair[1].split(";")[0];

    expect(cookieKey).toBe("jwt");
    expect(cookieValue).toBeDefined();
    expect(cookieValue).toBe("hashed-jwt");
  });

  test("unsuccessfull login, no email", async () => {
    const request = supertest(app);

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/login").send({
      email: undefined,
      password: "pass1234",
    });

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Please provide email and password!");
  });

  test("unsuccessfull login, no password", async () => {
    const request = supertest(app);

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/login").send({
      email: "blabla@gmail.com",
      password: undefined,
    });

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Please provide email and password!");
  });

  test("unsuccessfull login, no user found", async () => {
    // mock the functions that need access to the database
    jest.spyOn(User, "findOne").mockImplementationOnce(() => query);

    jest
      .spyOn(mongoose.Query.prototype, "select")
      .mockImplementationOnce(() => Promise.resolve(null));

    jest
      .spyOn(User.prototype, "correctPassword")
      .mockImplementationOnce(() => Promise.resolve(true));

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/login").send({
      email: "no-user@gmail.com",
      password: "pass1234",
    });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Incorrect email or password!");
  });

  test("unsuccessfull login, user found, invalid password", async () => {
    // mock the functions that need access to the database
    jest.spyOn(User, "findOne").mockImplementationOnce(() => query);

    jest
      .spyOn(mongoose.Query.prototype, "select")
      .mockImplementationOnce(() => Promise.resolve(user));

    jest
      .spyOn(User.prototype, "correctPassword")
      .mockImplementationOnce(() => Promise.resolve(false));

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/login").send({
      email: "blabla@gmail.com",
      password: "pass1234",
    });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Incorrect email or password!");
  });
});

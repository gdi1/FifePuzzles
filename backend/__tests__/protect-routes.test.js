const app = require("../app");
const supertest = require("supertest");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");

/**
 * Test suit checking the functioanlity of the endpoint that verifies a user's token to automatically log them into their account.
 * In essesnce, this test suit demonstrates the workability of the function that guards all protected backend routes.
 */
describe("test function that protects routes", () => {
  let request;
  let token;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeAll(() => {
    process.env = {
      ...process.env,
      JWT_PRIVATE_SECRET: "megasecret1234!",
    };
  });

  beforeEach(() => {
    request = supertest(app);
  });

  test("successfull pass through", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ userID }) =>
        user.userID === userID ? Promise.resolve(user) : null
      );

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
      iat: parseInt(now.getTime() / 1000),
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .get("/users/verifyToken")
      .set("Cookie", [`jwt=token`]);

    // check the response is as expected
    expect(response.body.status).toBe("success");
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("token");

    const { user: resUser, token: resToken } = response.body.data;

    expect(resToken).toBe("token");
    expect(resUser.name).toBe(user.name);
    expect(resUser.email).toBe(user.email);
    expect(resUser.password).toBe(user.password);
    expect(resUser.passwordConfirm).toBe(user.passwordConfirm);
    expect(resUser.groupID).toBe(user.groupID);
    expect(resUser.userID).toBe(user.userID);
  });

  test("unsuccessfull pass through, user changed password recently", async () => {
    // mpock user
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate: new Date(new Date().getTime() + 1000 * 60),
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ userID }) =>
        user.userID === userID ? Promise.resolve(user) : null
      );

    const now = new Date();

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      iat: parseInt(now.getTime() / 1000),
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .get("/users/verifyToken")
      .set("Cookie", [`jwt=token`]);

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      "User recently changed password! Please log in again."
    );
  });

  test("unsuccessfull pass through, no JWT", async () => {
    // simulate making a request to the change password endpoint
    const response = await request.get("/users/verifyToken");

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      "You are not logged in! Please log in to get access."
    );
  });

  test("unsuccessfull pass through, invalid JWT", async () => {
    // simulate making a request to the change password endpoint
    const response = await request
      .get("/users/verifyToken")
      .set("Cookie", ["jwt=invalid"]);

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("jwt malformed");
  });

  test("unsuccessfull pass through, expired JWT", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
    });

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
      throw new jwt.TokenExpiredError("jwt expired");
    });

    // simulate making a request to the change password endpoint
    const response = await request
      .get("/users/verifyToken")
      .set("Cookie", [`jwt=token`]);

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("jwt expired");
  });

  test("unsuccessfull pass through, invalid JWT payload, invalid group id", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 19,
      userID: "G19-id",
      isGuest: false,
    });

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
      iat: parseInt(now.getTime() / 1000),
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .get("/users/verifyToken")
      .set("Cookie", [`jwt=${token}`]);

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid JWT payload.");
  });

  test("unsuccessfull pass through, invalid JWT payload, no display name", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
    });

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: undefined,
      groupID: user.groupID,
      userID: user.userID,
      iat: parseInt(now.getTime() / 1000),
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .get("/users/verifyToken")
      .set("Cookie", [`jwt=token`]);

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid JWT payload.");
  });

  test("unsuccessfull pass through, invalid JWT payload, no group id", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
    });

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: undefined,
      userID: user.userID,
      iat: parseInt(now.getTime() / 1000),
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .get("/users/verifyToken")
      .set("Cookie", [`jwt=token`]);

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid JWT payload.");
  });

  test("unsuccessfull pass through, invalid JWT payload, no user id", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
    });

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: undefined,
      iat: parseInt(now.getTime() / 1000),
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .get("/users/verifyToken")
      .set("Cookie", [`jwt=token`]);

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid JWT payload.");
  });

  test("unsuccessfull pass through, invalid JWT payload, not matching userID and groupID", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 25,
      userID: "G25-id",
      isGuest: true,
    });

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: 26,
      userID: user.userID,
      iat: parseInt(now.getTime() / 1000),
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .get("/users/verifyToken")
      .set("Cookie", [`jwt=token`]);

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid JWT payload.");
  });
});

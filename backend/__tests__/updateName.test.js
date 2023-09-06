const app = require("../app");
const supertest = require("supertest");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");

/**
 * Test suit checking the functioanlity of the endpoint allowing users to change their name
 */
describe("tests that users can update their name", () => {
  let request;

  beforeEach(() => {
    request = supertest(app);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("successfull name update", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass1234",
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
    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.resolve(true));

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      groupID: 26,
      userID: "G26-id",
      displayName: "Blabla",
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/update")
      .set("Cookie", [`jwt=token`])
      .send({ name: "NewName" });

    // check the response is as expected
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(user.name).toBe("NewName");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data.user.name).toBe("NewName");
  });

  test("unsuccessfull name update, no new name entered", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass1234",
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

    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.resolve(true));

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      groupID: 26,
      userID: "G26-id",
      displayName: "Blabla",
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/update")
      .set("Cookie", [`jwt=token`]);

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid new name.");
    expect(user.name).toBe("Blabla");
  });

  test("unsuccessfull name update, user is guest", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass1234",
      passwordChangeDate,
      groupID: 25,
      userID: "G25-id",
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ userID }) =>
        user.userID === userID ? Promise.resolve(user) : null
      );

    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.resolve(true));

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      groupID: 25,
      userID: "G25-id",
      displayName: "Blabla",
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/update")
      .set("Cookie", [`jwt=token`])
      .send({ name: "NewName" });

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Guest users cannot change their name.");
    expect(user.name).toBe("Blabla");
  });

  test("unsuccessfull name update, user is guest", async () => {
    // mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass1234",
      passwordChangeDate,
      groupID: 25,
      userID: "G25-id",
    });
    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ userID }) =>
        user.userID === userID ? Promise.resolve(user) : null
      );
    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.resolve(true));

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      groupID: 25,
      userID: "G25-id",
      displayName: "Blabla",
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/update")
      .set("Cookie", [`jwt=token`])
      .send({ name: "NewName" });

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Guest users cannot change their name.");
    expect(user.name).toBe("Blabla");
  });
});

const app = require("../app");
const supertest = require("supertest");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");

/**
 * Test suit checking that a guest user can log in into our website.
 */
describe("test guest validation", () => {
  let request;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeAll(() => {
    process.env = {
      ...process.env,
      JWT_SECRET: "megasecret1234!",
      JWT_EXPIRES_IN: "90d",
      JWT_G25_SECRET: "secret",
      JWT_COOKIE_EXPIRES_IN: 90,
      EMAIL: "no-reply-fife-puzzples-group26@st-andrews.ac.uk",
      RESET_URL_HOSTNAME: "cs3099user26.host.cs.st-andrews.ac.uk",
      RESET_URL: "https://<hostname>/resetPassword",
    };
  });

  beforeEach(() => {
    request = supertest(app);
  });

  test("successfully validating guest", async () => {
    // mock user
    const user = new User({
      name: "Blabla",
      groupID: 25,
      userID: "G25-id",
      isGuest: true,
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ userID }) =>
        userID === user.userID ? Promise.resolve(user) : null
      );

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
    }));

    jest.spyOn(jwt, "verify").mockImplementationOnce(() => true);
    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-jwt");

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/validateGuest")
      .send({ token: "token" });

    // check the response is as expected
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("token");
    expect(response.body.data.token).not.toBe("token");
    expect(response.body.data.token).toBe("hashed-jwt");
  });

  test("successfully validating guest, changed name", async () => {
    // mock user
    const user = new User({
      name: "Blabla",
      groupID: 25,
      userID: "G25-id",
      isGuest: true,
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ userID }) =>
        userID === user.userID ? Promise.resolve(user) : null
      );

    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.resolve(true));

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      displayName: "NewName",
      groupID: user.groupID,
      userID: user.userID,
    }));

    jest.spyOn(jwt, "verify").mockImplementationOnce(() => true);
    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-jwt");

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/validateGuest")
      .send({ token: "token" });

    // check the response is as expected
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("token");
    expect(response.body.data.token).not.toBe("token");
    expect(response.body.data.token).toBe("hashed-jwt");

    expect(user.name).not.toBe("Blabla");
    expect(user.name).toBe("NewName");
  });

  test("successfully validating guest, registering new guests", async () => {
    // mock user
    const user = new User({
      name: "Blabla",
      groupID: 25,
      userID: "G25-id",
      isGuest: true,
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ userID }) =>
        userID === user.userID ? Promise.resolve(user) : null
      );

    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.resolve(true));

    jest
      .spyOn(User, "create")
      .mockImplementationOnce((userDetails) =>
        Promise.resolve(new User({ ...userDetails }))
      );

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      displayName: "NewName",
      groupID: user.groupID,
      userID: "G25-new-id",
    }));

    jest.spyOn(jwt, "verify").mockImplementationOnce(() => true);
    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-jwt");

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/validateGuest")
      .send({ token: "token" });

    // check the response is as expected
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("token");
    expect(response.body.data.token).not.toBe("token");
    expect(response.body.data.token).toBe("hashed-jwt");
    expect(response.body.data.user.name).toBe("NewName");
  });

  test("unsuccessfully validating guest, token", async () => {
    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/validateGuest")
      .send({ token: undefined });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("No Cross Site JWT.");
  });

  test("unsuccessfully validating guest, missing name", async () => {
    // mock token
    token = jwt.sign(
      {
        displayName: undefined,
        groupID: 25,
        userID: "G25-new-id",
      },
      process.env.JWT_G25_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/validateGuest").send({ token });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid Cross Site JWT.");
  });

  test("unsuccessfully validating guest, missing userID", async () => {
    // mock token
    token = jwt.sign(
      {
        displayName: "Blabla",
        groupID: 25,
        userID: undefined,
      },
      process.env.JWT_G25_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/validateGuest").send({ token });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid Cross Site JWT.");
  });

  test("unsuccessfully validating guest, missing groupID", async () => {
    // mock token
    token = jwt.sign(
      {
        displayName: "Blabla",
        groupID: undefined,
        userID: "G25-new-id",
      },
      process.env.JWT_G25_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/validateGuest").send({ token });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid Cross Site JWT.");
  });

  test("unsuccessfully validating guest, invalid groupID", async () => {
    // mock token
    token = jwt.sign(
      {
        displayName: "Blabla",
        groupID: 10,
        userID: "G25-new-id",
      },
      process.env.JWT_G25_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/validateGuest").send({ token });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid Cross Site JWT.");
  });

  test("unsuccessfully validating guest, invalid groupID", async () => {
    // mock token
    token = jwt.sign(
      {
        displayName: "Blabla",
        groupID: 30,
        userID: "G25-new-id",
      },
      process.env.JWT_G25_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/validateGuest").send({ token });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid Cross Site JWT.");
  });

  test("unsuccessfully validating guest, groupId and userID do not match", async () => {
    // mock token
    token = jwt.sign(
      {
        displayName: "Blabla",
        groupID: 23,
        userID: "G25-new-id",
      },
      process.env.JWT_G25_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/validateGuest").send({ token });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid Cross Site JWT.");
  });

  test("unsuccessfully validating guest, groupId is 26 which means that user is not guest", async () => {
    // mock token
    token = jwt.sign(
      {
        displayName: "Blabla",
        groupID: 26,
        userID: "G26-new-id",
      },
      process.env.JWT_G25_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/validateGuest").send({ token });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid Cross Site JWT.");
  });

  test("unsuccessfully validating guest, invalid signature of jwt ", async () => {
    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      displayName: "Blabla",
      groupID: 25,
      userID: "G25-id",
    }));

    jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
      throw new jwt.JsonWebTokenError("invalid signature");
    });

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/validateGuest")
      .send({ token: "token" });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("invalid signature");
  });

  test("unsuccessfully validating guest, expired jwt ", async () => {
    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      displayName: "Blabla",
      groupID: 25,
      userID: "G25-id",
    }));

    jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
      throw new jwt.TokenExpiredError("jwt expired");
    });

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/validateGuest")
      .send({ token: "token" });

    // check the response is as expected
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("jwt expired");
  });
});

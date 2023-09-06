const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const User = require("../Models/User");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

/**
 * This test demonstrates the functionality of the two endpoints that allow users to make a request to change their password
 * and that allow to eventually reset their password.
 */
describe("test reset password", () => {
  let request;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeAll(() => {
    process.env = {
      ...process.env,
      JWT_COOKIE_EXPIRES_IN: 90,
      EMAIL: "no-reply-fife-puzzples-group26@st-andrews.ac.uk",
      RESET_URL_HOSTNAME: "cs3099user26.host.cs.st-andrews.ac.uk",
      RESET_URL: "https://<hostname>/resetPassword",
    };
  });

  beforeEach(() => {
    request = supertest(app);
  });

  test("successfull request to reset password", async () => {
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
      .mockImplementationOnce(({ email }) =>
        user.email === email ? Promise.resolve(user) : null
      );

    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.resolve(true));

    /*
    mock fuction that is used for sending emails 
    The implemenatation behind the code sending the email is external,
    so we need to perform the tests indepedently of this function's workability.
    We just assume what the expected response will be given the conditions.
    */
    jest
      .spyOn(sendEmail, "sendEmail")
      .mockImplementationOnce(() => Promise.resolve(true));

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/forgotPassword")
      .send({ email: user.email });

    // check the response is as expected
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.message).toBe("Verify your email!");
    expect(user.passwordResetToken).toBeDefined();
    expect(user.resetTokenExpiryDate).toBeDefined();
  });

  test("unsuccessfull request to reset password, no email provided", async () => {
    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/forgotPassword")
      .send({ email: undefined });

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Please provide an email.");
  });

  test("unsuccessfull request to reset password, no user found email", async () => {
    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ email }) => Promise.resolve(null));

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/forgotPassword")
      .send({ email: "blabla@gmail.com" });

    // check the response is as expected
    expect(response.statusCode).toBe(404);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe(
      "There is no user with this email address."
    );
  });

  test("successfull password reset", async () => {
    // mock user and reset token
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = await bcrypt.hash(resetToken, 12);

    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
      resetTokenExpiryDate: new Date(new Date().getTime() + 1000 * 60),
      passwordResetToken,
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ email }) =>
        email === user.email ? Promise.resolve(user) : null
      );

    jest.spyOn(User.prototype, "save").mockImplementationOnce(() => {
      console.log("This is:", this);
      return Promise.resolve(true);
    });

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-jwt");

    // simulate making a request to the change password endpoint
    const response = await request
      .patch(`/users/resetPassword/${resetToken}`)
      .send({
        email: user.email,
        password: "test1234",
        passwordConfirm: "test1234",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("token");
    expect(response.body.data.token).toBe("hashed-jwt");

    expect(user.resetTokenExpiryDate).toBeUndefined();
    expect(user.passwordResetToken).toBeUndefined();
  });

  test("unsuccessfull password reset, no email provided", async () => {
    // simulate making a request to the change password endpoint
    const response = await request
      .patch("/users/resetPassword/resetToken")
      .send({
        email: undefined,
        password: "test1234",
        passwordConfirm: "test1234",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid email address.");
  });

  test("unsuccessfull password reset, no email provided", async () => {
    // mock the functions that need access to the database
    jest.spyOn(User, "findOne").mockImplementationOnce(() => null);

    // simulate making a request to the change password endpoint
    const response = await request
      .patch("/users/resetPassword/resetToken")
      .send({
        email: "blabla@gmail.com",
        password: "test1234",
        passwordConfirm: "test1234",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(404);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid email address.");
  });

  test("unsuccessfull password reset, no user found", async () => {
    // mock the functions that need access to the database
    jest.spyOn(User, "findOne").mockImplementationOnce(() => null);

    // simulate making a request to the change password endpoint
    const response = await request
      .patch("/users/resetPassword/resetToken")
      .send({
        email: "blabla@gmail.com",
        password: "test1234",
        passwordConfirm: "test1234",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(404);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid email address.");
  });

  test("unsuccessfull password reset, no reset token / reset token expiry date", async () => {
    // mock user and reset token
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const resetToken = crypto.randomBytes(32).toString("hex");

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
      .mockImplementationOnce(({ email }) =>
        email === user.email ? Promise.resolve(user) : null
      );
    // simulate making a request to the change password endpoint
    const response = await request
      .patch(`/users/resetPassword/${resetToken}`)
      .send({
        email: user.email,
        password: "test1234",
        passwordConfirm: "test1234",
      });
    // check the response is as expected
    expect(response.statusCode).toBe(404);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe(
      "You must make a request to change your password first."
    );
  });

  test("unsuccessfull password reset, reset token expired", async () => {
    // mock user and reset token
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = await bcrypt.hash(resetToken, 12);

    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
      passwordResetToken,
      resetTokenExpiryDate: new Date(new Date().getTime() - 1000 * 60),
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ email }) =>
        email === user.email ? Promise.resolve(user) : null
      );

    jest.spyOn(User.prototype, "save").mockImplementationOnce(() => {
      return Promise.resolve(true);
    });

    // simulate making a request to the change password endpoint
    const response = await request
      .patch(`/users/resetPassword/${resetToken}`)
      .send({
        email: user.email,
        password: "test1234",
        passwordConfirm: "test1234",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(404);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe(
      "Reset token has expired. You must make another request to change your password."
    );
    expect(user.passwordResetToken).toBeUndefined();
    expect(user.resetTokenExpiryDate).toBeUndefined();
  });

  test("unsuccessfull password reset, reset tokens do not match", async () => {
    // mock user and reset token
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = await bcrypt.hash(resetToken, 12);

    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
      passwordResetToken,
      resetTokenExpiryDate: new Date(new Date().getTime() + 1000 * 60),
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ email }) =>
        email === user.email ? Promise.resolve(user) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request
      .patch("/users/resetPassword/invalidResetToken")
      .send({
        email: user.email,
        password: "test1234",
        passwordConfirm: "test1234",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(404);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid reset token.");
  });

  test("unsuccessfull password reset, reset tokens do not match", async () => {
    // mock user and reset token
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const resetToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
      passwordResetToken: "invalid-hashed-reset-token",
      resetTokenExpiryDate: new Date(new Date().getTime() + 1000 * 60),
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ email }) =>
        email === user.email ? Promise.resolve(user) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request
      .patch(`/users/resetPassword/${resetToken}`)
      .send({
        email: user.email,
        password: "test1234",
        passwordConfirm: "test1234",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(404);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid reset token.");
  });

  test("unsuccessfull password reset, validation error from mongoose schema", async () => {
    // mock user and reset token
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = await bcrypt.hash(resetToken, 12);

    const err = new mongoose.Error.ValidationError();
    err.errors = {
      passwordConfirm: {
        properties: { message: "Passwords are not the same!" },
      },
    };

    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
      isGuest: false,
      passwordResetToken,
      resetTokenExpiryDate: new Date(new Date().getTime() + 1000 * 60),
    });

    // mock the functions that need access to the database
    jest
      .spyOn(User, "findOne")
      .mockImplementationOnce(({ email }) =>
        email === user.email ? Promise.resolve(user) : null
      );

    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.reject(err));

    // simulate making a request to the change password endpoint
    const response = await request
      .patch(`/users/resetPassword/${resetToken}`)
      .send({
        email: user.email,
        password: "test1234",
        passwordConfirm: "test12345",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.messageMap.passwordConfirm).toBe(
      "Passwords are not the same!"
    );
  });
});

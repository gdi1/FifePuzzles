/**
 * Test suit for checking the functionality of the endpoint allowingl logged in users to change their password.
 */
const app = require("../app");
const supertest = require("supertest");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

describe("test that users can voluntarily change their password", () => {
  let request;
  let query;
  let user;

  beforeEach(() => {
    request = supertest(app);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeAll(() => {
    query = User.find({});
    process.env = {
      ...process.env,
      JWT_COOKIE_EXPIRES_IN: 90,
    };
  });

  /**
   * Verify that a logged in user can voluntarily change their password
   */
  test("successfull password change", async () => {
    // create mock user
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
    jest.spyOn(User, "findOne").mockImplementation(({ userID, email }) => {
      if (userID && !email) {
        if (user.userID === userID) return Promise.resolve(user);
      } else if (!userID && email) {
        if (user.email === email) return query;
      }
      return null;
    });

    jest
      .spyOn(mongoose.Query.prototype, "select")
      .mockImplementationOnce(() => user);

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

    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-token");

    jest
      .spyOn(bcrypt, "compare")
      .mockImplementationOnce((val1, val2) =>
        val1 === val2 ? Promise.resolve(true) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/changePassword")
      .set("Cookie", [`jwt=token`])
      .send({
        password: "pass1234",
        newPassword: "12345678",
        newPasswordConfirm: "12345678",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.token).toBe("hashed-token");
    expect(response.body.data).toHaveProperty("user");
  });

  test("unsuccessfull password change, password on user's record does not match the current password entered", async () => {
    // create mock user
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
    jest.spyOn(User, "findOne").mockImplementation(({ userID, email }) => {
      if (userID && !email) {
        if (user.userID === userID) return Promise.resolve(user);
      } else if (!userID && email) {
        if (user.email === email) return query;
      }
      return null;
    });

    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.resolve(true));

    jest
      .spyOn(mongoose.Query.prototype, "select")
      .mockImplementationOnce(() => user);

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

    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-token");

    jest
      .spyOn(bcrypt, "compare")
      .mockImplementationOnce((val1, val2) =>
        val1 === val2 ? Promise.resolve(true) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/changePassword")
      .set("Cookie", [`jwt=token`])
      .send({
        password: "pass123",
        newPassword: "12345678",
        newPasswordConfirm: "12345678",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Current password is not correct.");
    expect(response.body).not.toHaveProperty("data");
  });

  test("unsuccessfull password change, missing fields in the request's body", async () => {
    // create mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass1234",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
    });

    // mock the functions that need access to the database
    jest.spyOn(User, "findOne").mockImplementation(({ userID, email }) => {
      if (userID && !email) {
        if (user.userID === userID) return Promise.resolve(user);
      } else if (!userID && email) {
        if (user.email === email) return query;
      }
      return null;
    });

    jest
      .spyOn(mongoose.Query.prototype, "select")
      .mockImplementationOnce(() => user);

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

    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-token");

    jest
      .spyOn(bcrypt, "compare")
      .mockImplementationOnce((val1, val2) =>
        val1 === val2 ? Promise.resolve(true) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/changePassword")
      .set("Cookie", [`jwt=token`])
      .send({
        password: "pass1234",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("All fields are required.");
    expect(response.body).not.toHaveProperty("data");
  });

  test("unsuccessfull password change, user is guest", async () => {
    // create mock user
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
    jest.spyOn(User, "findOne").mockImplementation(({ userID, email }) => {
      if (userID && !email) {
        if (user.userID === userID) return Promise.resolve(user);
      } else if (!userID && email) {
        if (user.email === email) return query;
      }
      return null;
    });

    jest
      .spyOn(mongoose.Query.prototype, "select")
      .mockImplementationOnce(() => user);

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

    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-token");

    jest
      .spyOn(bcrypt, "compare")
      .mockImplementationOnce((val1, val2) =>
        val1 === val2 ? Promise.resolve(true) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/changePassword")
      .set("Cookie", [`jwt=token`])
      .send({
        password: "pass1234",
        newPassword: "12345678",
        newPasswordConfirm: "12345678",
      });

    // check the response is as expected
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe(
      "Guest users cannot change their password."
    );
    expect(response.body).not.toHaveProperty("data");
  });

  test("unsuccessfull password change, new password is too short", async () => {
    /*
    Create expected error that will be thrown by function from another import
    We had no involvement in the implementation of the function which will throw the error,
    so this is the reason why we mock the error as well.
     */
    const err = new mongoose.Error.ValidationError();
    err.errors.password = {
      properties: { message: "Password must have at least 8 characters!" },
    };

    // create mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass1234",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
    });

    // mock the functions that need access to the database
    jest.spyOn(User, "findOne").mockImplementation(({ userID, email }) => {
      if (userID && !email) {
        if (user.userID === userID) return Promise.resolve(user);
      } else if (!userID && email) {
        if (user.email === email) return query;
      }
      return null;
    });

    jest
      .spyOn(mongoose.Query.prototype, "select")
      .mockImplementationOnce(() => user);

    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.reject(err));

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

    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-token");

    jest
      .spyOn(bcrypt, "compare")
      .mockImplementationOnce((val1, val2) =>
        val1 === val2 ? Promise.resolve(true) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/changePassword")
      .set("Cookie", [`jwt=token`])
      .send({
        password: "pass1234",
        newPassword: "1234567",
        newPasswordConfirm: "12345678",
      });

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.password).toBe(
      "Password must have at least 8 characters!"
    );
    expect(response.body).not.toHaveProperty("data");
  });

  test("unsuccessfull password change, new password and confirmation do not match", async () => {
    /*
    Create expected error that will be thrown by function from another import
    We had no involvement in the implementation of the function which will throw the error,
    so this is the reason why we mock the error as well.
     */
    const err = new mongoose.Error.ValidationError();
    err.errors.passwordConfirm = {
      properties: { message: "Passwords are not the same!" },
    };

    // create mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass1234",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
    });

    // mock the functions that need access to the database
    jest.spyOn(User, "findOne").mockImplementation(({ userID, email }) => {
      if (userID && !email) {
        if (user.userID === userID) return Promise.resolve(user);
      } else if (!userID && email) {
        if (user.email === email) return query;
      }
      return null;
    });

    jest
      .spyOn(mongoose.Query.prototype, "select")
      .mockImplementationOnce(() => user);

    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.reject(err));

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

    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-token");

    jest
      .spyOn(bcrypt, "compare")
      .mockImplementationOnce((val1, val2) =>
        val1 === val2 ? Promise.resolve(true) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/changePassword")
      .set("Cookie", [`jwt=token`])
      .send({
        password: "pass1234",
        newPassword: "12345678",
        newPasswordConfirm: "123456789",
      });

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.passwordConfirm).toBe(
      "Passwords are not the same!"
    );
    expect(response.body).not.toHaveProperty("data");
  });

  test("unsuccessfull password change, new password and confirmation do not match", async () => {
    /*
    Create expected error that will be thrown by function from another import
    We had no involvement in the implementation of the function which will throw the error,
    so this is the reason why we mock the error as well.
     */
    const err = new mongoose.Error.ValidationError();
    err.errors = {
      passwordConfirm: {
        properties: { message: "Passwords are not the same!" },
      },
      password: {
        properties: { message: "Password must have at least 8 characters!" },
      },
    };

    // create mock user
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass1234",
      passwordChangeDate,
      groupID: 26,
      userID: "G26-id",
    });

    // mock the functions that need access to the database
    jest.spyOn(User, "findOne").mockImplementation(({ userID, email }) => {
      if (userID && !email) {
        if (user.userID === userID) return Promise.resolve(user);
      } else if (!userID && email) {
        if (user.email === email) return query;
      }
      return null;
    });

    jest
      .spyOn(mongoose.Query.prototype, "select")
      .mockImplementationOnce(() => user);

    jest
      .spyOn(User.prototype, "save")
      .mockImplementationOnce(() => Promise.reject(err));

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

    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-token");

    jest
      .spyOn(bcrypt, "compare")
      .mockImplementationOnce((val1, val2) =>
        val1 === val2 ? Promise.resolve(true) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request
      .post("/users/changePassword")
      .set("Cookie", [`jwt=token`])
      .send({
        password: "pass1234",
        newPassword: "12345678",
        newPasswordConfirm: "123456789",
      });

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.passwordConfirm).toBe(
      "Passwords are not the same!"
    );
    expect(response.body.messageMap.password).toBe(
      "Password must have at least 8 characters!"
    );
    expect(response.body).not.toHaveProperty("data");
  });
});

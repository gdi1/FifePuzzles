const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const User = require("../Models/User");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

/**
 * Test suit that checks the functionality of the endpoint that allows new users to sign up onto our website.
 */
describe("test sign up", () => {
  let request;
  beforeAll(() => {
    process.env = {
      ...process.env,
      JWT_PRIVATE_SECRET:
        "-----BEGIN RSA PRIVATE KEY-----\nMIICXgIBAAKBgQCEX4rrPAaxAhEgXo4sDQiqAbbEU7UtH7ZoGLB3rtqbzPVz83Vx\nf4Qk8Nd9zdUpV5L7CisqteVEuE231ayZnVP80wDVYzKU3b10Fgc58rdiYwhwyVIH\nuCT5Tz9Wb4jL+GKAIi1BbqUwhtR6tT1T33t4vxz1WFfEX99luJLCWonl5QIDAQAB\nAoGBAIKJASH1oJee9SqZc9PGyptzczrpXQlxc1v1tNdhC1yGYioEk/TnjXUsNyRs\n/N526I88ONM2ai85HBLD2B/nwHBgseB4f5c+HVAhUXsoHhqO8IucH5DZyyAYsvDX\n6YzJadL/ozWTfvvzRNZS0/B0cw/7fmFDf8Bf8lDJ/Br0AjMFAkEA8v1nzn8l9e8l\nD7toP0yAtFAF4S9eBwN7pMhvjhXLEWbeSof6DorDoDGMpJEu1qFRvNN808qAaf5j\n/TNFjK24AwJBAIt18gqqPIImzP72KhWmbG1UHzrA2GOVKHwuhlfP5AZ738olIiUz\nuEUANbBTx/4XbSXHIPG34GOgACyKbVXRyfcCQQCsgrvwHtUUhXQKd0LLrcSyPx3t\ngXOABzkBBEwu08oX0LCAuYkOSfYZBRSUwX4/YshlBsDYnCwPFExotr3p4muBAkAl\nXXF/KANUP78W5K97434TgMFpRXf0nmcddn2qE1od3pykFXTjkMrjOd4ooxnnWzF0\nOLj76m8lYh4J0QDgSHgbAkEArHPzYgk2wZPzOJFTjuvd+EDb9lmLbgyC5wyzP3j+\nYpmOk9e61F6ievGIh5udWaLC41nVjzBIlIXksYeHsVHPVQ==\n-----END RSA PRIVATE KEY-----",
      JWT_EXPIRES_IN: "90d",
      JWT_COOKIE_EXPIRES_IN: 90,
    };
  });

  beforeEach(() => {
    request = supertest(app);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test("successfull sign up", async () => {
    // mock the functions that need access to the database
    jest.spyOn(User, "create").mockImplementationOnce((userDetails) =>
      Promise.resolve(
        new User({
          ...userDetails,
        })
      )
    );

    /* 
    Mock function for creating jwt since this is not the purpose of the test
    Should test the code logic executed at this endpoint independently of the workability of other imports
    that the application is depdendent on, but had no contribution in their implementation
    */
    jest.spyOn(jwt, "sign").mockImplementationOnce(() => "hashed-jwt");

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/signup").send({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass1234",
    });

    // check the response is as expected
    expect(response.body.status).toBe("success");
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty("token");
    expect(response.body.data).toHaveProperty("user");

    const cookiePair = response.header["set-cookie"][0].split("=");
    const cookieKey = cookiePair[0];
    const cookieValue = cookiePair[1].split(";")[0];

    expect(cookieKey).toBe("jwt");
    expect(cookieValue).toBeDefined();
    expect(cookieValue).toBe("hashed-jwt");
  });

  test("unsuccessfull sign up, no name", async () => {
    // create mock error
    const err = new mongoose.Error.ValidationError();
    err.errors.name = {
      properties: { message: "Users must have a name!" },
    };

    // mock the functions that need access to the database
    jest
      .spyOn(User, "create")
      .mockImplementationOnce((user) =>
        user.name ? Promise.reject(err) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/signup").send({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass1234",
    });
    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.name).toBe("Users must have a name!");
  });

  test("unsuccessfull sign up, no email", async () => {
    const err = new mongoose.Error.ValidationError();
    err.errors.email = {
      properties: { message: "Users must have an email!" },
    };

    // mock the functions that need access to the database
    jest
      .spyOn(User, "create")
      .mockImplementationOnce((user) =>
        !user.email ? Promise.reject(err) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/signup").send({
      name: "Blabla",
      email: undefined,
      password: "pass1234",
      passwordConfirm: "pass1234",
    });
    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.email).toBe("Users must have an email!");
  });

  test("unsuccessfull sign up, no password", async () => {
    // create mock error
    const err = new mongoose.Error.ValidationError();
    err.errors.password = {
      properties: { message: "Please provide a password" },
    };

    // mock the functions that need access to the database
    jest
      .spyOn(User, "create")
      .mockImplementationOnce((user) =>
        !user.password ? Promise.reject(err) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/signup").send({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: undefined,
      passwordConfirm: "pass1234",
    });

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.password).toBe("Please provide a password");
  });

  test("unsuccessfull sign up, no password confirmation", async () => {
    // create mock error
    const err = new mongoose.Error.ValidationError();
    err.errors.passwordConfirm = {
      properties: { message: "Please confirm your password" },
    };

    // mock the functions that need access to the database
    jest
      .spyOn(User, "create")
      .mockImplementationOnce((user) =>
        !user.passwordConfirm ? Promise.reject(err) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/signup").send({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: undefined,
    });

    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.passwordConfirm).toBe(
      "Please confirm your password"
    );
  });

  test("unsuccessfull sign up, too short password", async () => {
    // create mock error
    const err = new mongoose.Error.ValidationError();
    err.errors.password = {
      properties: { message: "Password must have at least 8 characters!" },
    };

    // mock the functions that need access to the database
    jest
      .spyOn(User, "create")
      .mockImplementationOnce((user) =>
        user.password.length < 8 ? Promise.reject(err) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/signup").send({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass",
      passwordConfirm: "pass",
    });
    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.password).toBe(
      "Password must have at least 8 characters!"
    );
  });

  test("unsuccessfull sign up, not matching passwords", async () => {
    // create mock error
    const err = new mongoose.Error.ValidationError();
    err.errors.passwordConfirm = {
      properties: { message: "Passwords are not the same!" },
    };

    // mock the functions that need access to the database
    jest
      .spyOn(User, "create")
      .mockImplementationOnce((user) =>
        user.password !== user.passwordConfirm ? Promise.reject(err) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/signup").send({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
    });
    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.passwordConfirm).toBe(
      "Passwords are not the same!"
    );
  });

  test("unsuccessfull sign up, email already exists", async () => {
    // create mock error
    const err = new AppError(undefined, 400);
    err.keyPattern = {};
    err.keyPattern.email = true;
    err.code = 11000;

    // mock the functions that need access to the database
    jest
      .spyOn(User, "create")
      .mockImplementationOnce((user) =>
        user.email === "blabla@gmail.com" ? Promise.reject(err) : null
      );

    // simulate making a request to the change password endpoint
    const response = await request.post("/users/signup").send({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
    });
    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.email).toBe("Email already in use!");
  });

  test("unsuccessfull sign up, multiple validation errors", async () => {
    // create mock error
    const err = new mongoose.Error.ValidationError();
    err.errors = {
      passwordConfirm: {
        properties: { message: "Passwords are not the same!" },
      },
      name: { properties: { message: "Users must have a name!" } },
      password: {
        properties: { message: "Password must have at least 8 characters!" },
      },
      email: { properties: { message: "Users must have an email!" } },
    };

    // mock the functions that need access to the database
    jest
      .spyOn(User, "create")
      .mockImplementationOnce((user) =>
        !user.email &&
        !user.name &&
        user.password.length < 8 &&
        user.password !== user.passwordConfirm
          ? Promise.reject(err)
          : null
      );
    // simulate making a request to the change password endpoint
    const response = await request.post("/users/signup").send({
      name: undefined,
      email: undefined,
      password: "pass",
      passwordConfirm: "pass12345",
    });
    // check the response is as expected
    expect(response.body.status).toBe("fail");
    expect(response.statusCode).toBe(400);
    expect(response.body.messageMap.email).toBe("Users must have an email!");
    expect(response.body.messageMap.name).toBe("Users must have a name!");
    expect(response.body.messageMap.password).toBe(
      "Password must have at least 8 characters!"
    );
    expect(response.body.messageMap.passwordConfirm).toBe(
      "Passwords are not the same!"
    );
  });
});

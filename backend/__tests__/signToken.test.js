const User = require("../Models/User");
const AppError = require("../utils/appError");
const { signToken } = require("../Controllers/authController");
const jwt = require("jsonwebtoken");

/**
 * This test suit checks the functionality of the function that takes a user record as parameter
 * and instead returns a signed JWT whose payload contains the userID, groupID adn name of the user passed as a paramanter.
 */
describe("test function creating signed jwt", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeAll(() => {
    process.env = {
      ...process.env,
      JWT_PRIVATE_SECRET:
        "-----BEGIN RSA PRIVATE KEY-----\nMIICXgIBAAKBgQCEX4rrPAaxAhEgXo4sDQiqAbbEU7UtH7ZoGLB3rtqbzPVz83Vx\nf4Qk8Nd9zdUpV5L7CisqteVEuE231ayZnVP80wDVYzKU3b10Fgc58rdiYwhwyVIH\nuCT5Tz9Wb4jL+GKAIi1BbqUwhtR6tT1T33t4vxz1WFfEX99luJLCWonl5QIDAQAB\nAoGBAIKJASH1oJee9SqZc9PGyptzczrpXQlxc1v1tNdhC1yGYioEk/TnjXUsNyRs\n/N526I88ONM2ai85HBLD2B/nwHBgseB4f5c+HVAhUXsoHhqO8IucH5DZyyAYsvDX\n6YzJadL/ozWTfvvzRNZS0/B0cw/7fmFDf8Bf8lDJ/Br0AjMFAkEA8v1nzn8l9e8l\nD7toP0yAtFAF4S9eBwN7pMhvjhXLEWbeSof6DorDoDGMpJEu1qFRvNN808qAaf5j\n/TNFjK24AwJBAIt18gqqPIImzP72KhWmbG1UHzrA2GOVKHwuhlfP5AZ738olIiUz\nuEUANbBTx/4XbSXHIPG34GOgACyKbVXRyfcCQQCsgrvwHtUUhXQKd0LLrcSyPx3t\ngXOABzkBBEwu08oX0LCAuYkOSfYZBRSUwX4/YshlBsDYnCwPFExotr3p4muBAkAl\nXXF/KANUP78W5K97434TgMFpRXf0nmcddn2qE1od3pykFXTjkMrjOd4ooxnnWzF0\nOLj76m8lYh4J0QDgSHgbAkEArHPzYgk2wZPzOJFTjuvd+EDb9lmLbgyC5wyzP3j+\nYpmOk9e61F6ievGIh5udWaLC41nVjzBIlIXksYeHsVHPVQ==\n-----END RSA PRIVATE KEY-----",
      JWT_PUBLIC_SECRET:
        "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCEX4rrPAaxAhEgXo4sDQiqAbbE\nU7UtH7ZoGLB3rtqbzPVz83Vxf4Qk8Nd9zdUpV5L7CisqteVEuE231ayZnVP80wDV\nYzKU3b10Fgc58rdiYwhwyVIHuCT5Tz9Wb4jL+GKAIi1BbqUwhtR6tT1T33t4vxz1\nWFfEX99luJLCWonl5QIDAQAB\n-----END PUBLIC KEY-----",
      JWT_NOT_SECRET:
        "-----BEGIN RSA PRIVATE KEY-----\nMIICXgIBAAKBgQCEX4rrPAapAhEgXo4sDQiqAbbEU7UtH7ZoGLB3rtqbzPVz83Vx\nf4Qk8Nd9zdUpV5L7CisqteVEuE231ayZnVP80wDVYzKU3b10Fgc58rdiYwhwyVIH\nuCT5Tz9Wb4jL+GKAIi1BbqUwhtR6tT1T33t4vxz1WFfEX99luJLCWonl5QIDAQAB\nAoGBAIKJASH1oJee9SqZc9PGyptzczrpXQlxc1v1tNdhC1yGYioEk/TnjXUsNyRs\n/N526I88ONM2ai85HBLD2B/nwHBgseB4f5c+HVAhUXsoHhqO8IucH5DZyyAYsvDX\n6YzJadL/ozWTfvvzRNZS0/B0cw/7fmFDf8Bf8lDJ/Br0AjMFAkEA8v1nzn8l9e8l\nD7toP0yAtFAF4S9eBwN7pMhvjhXLEWbeSof6DorDoDGMpJEu1qFRvNN808qAaf5j\n/TNFjK24AwJBAIt18gqqPIImzP72KhWmbG1UHzrA2GOVKHwuhlfP5AZ738olIiUz\nuEUANbBTx/4XbSXHIPG34GOgACyKbVXRyfcCQQCsgrvwHtUUhXQKd0LLrcSyPx3t\ngXOABzkBBEwu08oX0LCAuYkOSfYZBRSUwX4/YshlBsDYnCwPFExotr3p4muBAkAl\nXXF/KANUP78W5K97434TgMFpRXf0nmcddn2qE1od3pykFXTjkMrjOd4ooxnnWzF0\nOLj76m8lYh4J0QDgSHgbAkEArHPzYgk2wZPzOJFTjuvd+EDb9lmLbgyC5wyzP3j+\nYpmOk9e61F6ievGIh5udWaLC41nVjzBIlIXksYeHsVHPVQ==\n-----END RSA PRIVATE KEY-----",

      JWT_EXPIRES_IN: "90d",
    };
  });

  test("successfull creation of signed jwt, with all payload data as expected", () => {
    // create mock error
    const error = new AppError("Invalid JWT payload.", 400);

    // mock user
    const user = new User({
      name: "Blabla",
      password: "pass1234",
      groupID: 26,
      userID: "G26-aaa",
      email: "blabla@gmail.com",
    });

    expect(() => {
      // proceed to sucessfully create a signed JWT using the private keys and the user data
      const token = signToken(user);

      // proceed to decode the token
      const decoded = jwt.decode(token);

      // make sure payload is there
      if (!decoded) {
        throw error;
      }
      // make sure the payload contains expected data
      const { groupID, userID, displayName: name } = decoded;
      if (
        !groupID ||
        !name ||
        !userID ||
        groupID !== user.groupID ||
        userID !== user.userID ||
        name !== user.name
      ) {
        throw error;
      }
      // verify the token's signature using the public key
      jwt.verify(token, process.env.JWT_PRIVATE_SECRET, {
        algorithms: ["RS256"],
      });
      //expect all process to be successful
    }).not.toThrow();
  });

  test("successfull creation of signed jwt, but with missing payload data", () => {
    // create mock error
    const error = new AppError("Invalid JWT payload.", 400);

    // mock user
    const user = {
      name: "Blabla",
      password: "pass1234",
      userID: "G25-aaa",
      email: "blabla@gmail.com",
    };

    expect(() => {
      // proceed to sucessfully create a signed JWT using the private keys and the user data
      const token = signToken(user);
      // proceed to decode the token
      const decoded = jwt.decode(token);
      // make sure payload is there
      if (!decoded) {
        throw error;
      }
      // next validation step will fail because payload data is non-existent
      const { groupID, userID, displayName: name } = decoded;
      if (
        !groupID ||
        !name ||
        !userID ||
        groupID !== user.groupID ||
        userID !== user.userID ||
        name !== user.name
      ) {
        // throw error to signal invalid payload data
        throw error;
      }
      // this code is not executed
      jwt.verify(token, process.env.JWT_PRIVATE_SECRET, {
        algorithms: ["RS256"],
      });
      // expect the process above to fail and throw the expected error.
    }).toThrow(error);
  });

  test("successfull creation of signed jwt, cannot use other public key for decryption", () => {
    // create mock error
    const error = new AppError("Invalid JWT payload.", 400);

    // mock user
    const user = {
      name: "Blabla",
      password: "pass1234",
      userID: "G25-aaa",
      groupID: 25,
      email: "blabla@gmail.com",
    };

    expect(() => {
      // proceed to sucessfully create a signed JWT using the private keys and the user data
      const token = signToken(user);
      // proceed to decode the token
      const decoded = jwt.decode(token);
      // make sure payload is there
      if (!decoded) {
        throw error;
      }
      // make sure the payload contains expected data
      const { groupID, userID, displayName: name } = decoded;
      if (
        !groupID ||
        !name ||
        !userID ||
        groupID !== user.groupID ||
        userID !== user.userID ||
        name !== user.name
      ) {
        throw error;
      }
      // next step will fail because we try to use other public key for verifying the token's sginate
      jwt.verify(token, process.env.JWT_NOT_SECRET, {
        algorithms: ["RS256"],
      });
      //expect process above to fail and throw a JsonWebTokenError error.
    }).toThrow(jwt.JsonWebTokenError);
  });
});

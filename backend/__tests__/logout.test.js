const app = require("../app");
const supertest = require("supertest");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");

/**
 * Test suit checking the functionality of the endpoint allowing users to log out of our webiste
 */
describe("test logout", () => {
  let request;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    request = supertest(app);
  });

  test("successfull logout", async () => {
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
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      groupID: 26,
      userID: "G26-id",
      displayName: "Blabla",
    }));

    // simulate making a request to the change password endpoint
    const response = await request
      .get("/users/logout")
      .set("Cookie", [`jwt=token`]);

    // check the response is as expected
    const cookiePair = response.header["set-cookie"][0].split("=");
    const cookieKey = cookiePair[0];
    const cookieValue = cookiePair[1].split(";")[0];

    expect(cookieKey).toBe("jwt");
    expect(cookieValue).toBe("loggedout");
  });
});

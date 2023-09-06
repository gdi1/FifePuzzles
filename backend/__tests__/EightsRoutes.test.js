const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const eightsModel = require("../Models/Eights_Puzzle_Model");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

describe("Test Eights Routes", () => {
  let query;
  let request;
  let eightsPuzzle;
  let eightsJSON;
  let invalidEightsPuzzle;
  let invalidEightsJSON;
  let invalidEightsJSONFormat;

  beforeAll(async () => {
    process.env = {
      ...process.env,
      JWT_COOKIE_EXPIRES_IN: 90,
    };
    eightsPuzzle = new eightsModel({
      "puzzle-type": "eights_puzzle",
      "values": [[1, 2, 3], [4, 5, 6], [7, null, 8]],
      "creator-id": "G26-63654f228e851d847a951a63",
      "difficulty": 80
    })
    eightsJSON = {
      "puzzle-type": "eights_puzzle",
      "values": [[1, 2, 3], [4, 5, 6], [7, null, 8]],
      "creator-id": "G26-63654f228e851d847a951a63",
      "difficulty": 80
    }
    invalidEightsPuzzle = new eightsModel({
      "puzzle-type": "eights_puzzle",
      "values": [[2, 1, 3], [4, 5, 6], [7, 8, null]],
      "creator-id": "G26-63654f228e851d847a951a63",
      "difficulty": 80
    })
    invalidEightsJSON = {
      "puzzle-type": "eights_puzzle",
      "values": [[2, 1, 3], [4, 5, 6], [7, 8, null]],
      "creator-id": "G26-63654f228e851d847a951a63",
      "difficulty": 80
    }
    invalidEightsJSONFormat = {
      "puzzle-type": "8s_puzzle",
      "values": [[1, 2, 3], [4, "a", 6], [7, null, 8]],
      "creator-id": "G26-63654f228e851d847a951a63",
      "difficulty": 80
    }
    query = eightsModel.find({})
  });

  beforeEach(() => {
    request = supertest(app)
  })

  afterEach(() => {
    jest.restoreAllMocks();
  })

  test("Successful get hard puzzle", async () => {

    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));

    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    //Mocking find in order to not communicate with db
    jest.spyOn(eightsModel, "aggregate").mockImplementationOnce(() => Promise.resolve([{ eights_puzzle: eightsPuzzle }]));

    const response = await request.post("/eights_puzzle/get_eights_puzzle/").set("Cookie", ["jwt=token"]).send({
      difficulty: "hard"
    });
    expect(response.body.found).toBe(true)
    expect(response.body).toHaveProperty("game")
    expect(response.body.game).toHaveProperty("puzzle-type")
    expect(response.body.game).toHaveProperty("creator-id")
    expect(response.body.game).toHaveProperty("difficulty")
    expect(response.body.game).toHaveProperty("active")
    expect(response.body.game).toHaveProperty("values")
    expect(response.body.game.active).toBe(true)

  });
  test("Successful get easy puzzle", async () => {

    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));

    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    //Mocking find in order to not communicate with db
    jest.spyOn(eightsModel, "aggregate").mockImplementationOnce(() => Promise.resolve([{ eights_puzzle: eightsPuzzle }]));

    const response = await request.post("/eights_puzzle/get_eights_puzzle/").set("Cookie", ["jwt=token"]).send({
      difficulty: "easy"
    });
    expect(response.body.found).toBe(true)
    expect(response.body).toHaveProperty("game")
    expect(response.body.game).toHaveProperty("puzzle-type")
    expect(response.body.game).toHaveProperty("creator-id")
    expect(response.body.game).toHaveProperty("difficulty")
    expect(response.body.game).toHaveProperty("active")
    expect(response.body.game).toHaveProperty("values")
    expect(response.body.game.active).toBe(true)

  });
  test("Successful get medium puzzle", async () => {

    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));

    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    //Mocking find in order to not communicate with db
    jest.spyOn(eightsModel, "aggregate").mockImplementationOnce(() => Promise.resolve([{ eights_puzzle: eightsPuzzle }]));

    const response = await request.post("/eights_puzzle/get_eights_puzzle/").set("Cookie", ["jwt=token"]).send({
      difficulty: "medium"
    });
    expect(response.body.found).toBe(true)
    expect(response.body).toHaveProperty("game")
    expect(response.body.game).toHaveProperty("puzzle-type")
    expect(response.body.game).toHaveProperty("creator-id")
    expect(response.body.game).toHaveProperty("difficulty")
    expect(response.body.game).toHaveProperty("active")
    expect(response.body.game).toHaveProperty("values")
    expect(response.body.game.active).toBe(true)

  });
  test("Successful add", async () => {

    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    //Mocking user existance
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));


    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      userID: "G26-id"
    }))

    //Mocking find in order to not communicate with db
    jest.spyOn(eightsModel, "find").mockImplementationOnce(() => query);

    //Getting no result from find
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([]));

    //Mocking that save was done with no errors
    jest
      .spyOn(mongoose.Model.prototype, "save")
      .mockImplementationOnce((func) => func(false));

    //Sending request with valid puzzle
    const response = await request.post("/eights_puzzle/add_eights_puzzle/").set("Cookie", ["jwt=token"]).send(
      {
        "puzzle-type": "eights_puzzle",
        "values": eightsJSON.values,
        "creator-id": user.userID,
      })

    expect(response.body.puzzle_exists).toBe(false);
    expect(response.body.added).toBe(true);
    expect(response.body.message).toBe("Upload successfull.");
    expect(response.body).toHaveProperty("new_puzzle")
  }, 10000);

  test("Unsuccessful add due to user being a solver", async () => {
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    //Mocking user existance
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "solver",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));


    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      userID: "G26-id"
    }))

    //Mocking find in order to not communicate with db
    jest.spyOn(eightsModel, "find").mockImplementationOnce(() => query);

    //Getting no result from find
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([]));

    //Mocking that save was done with no errors
    jest
      .spyOn(mongoose.Model.prototype, "save")
      .mockImplementationOnce((func) => func(false));

    //Sending request with valid puzzle
    const response = await request.post("/eights_puzzle/add_eights_puzzle/").set("Cookie", ["jwt=token"]).send(
      {
        "puzzle-type": "eights_puzzle",
        "values": eightsJSON.values,
        "creator-id": user.userID,
      })

    expect(response.body.message).toBe("You do not have permission to perform this action");
  }, 10000);

  test("Unsuccessful add due to puzzle already existing", async () => {

    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    //Mocking user existance
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));


    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      userID: "G26-id"
    }))

    //Mocking find in order to not communicate with db
    jest.spyOn(eightsModel, "find").mockImplementationOnce(() => query);

    //Getting no result from find
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([eightsPuzzle]));

    //Mocking that save was done with no errors
    jest
      .spyOn(mongoose.Model.prototype, "save")
      .mockImplementationOnce((func) => func(false));

    //Sending request with valid puzzle
    const response = await request.post("/eights_puzzle/add_eights_puzzle/").set("Cookie", ["jwt=token"]).send(
      {
        "puzzle-type": "eights_puzzle",
        "values": eightsJSON.values,
        "creator-id": user.userID,
      })
    console.log(response.body);
    expect(response.body.puzzle_exists).toBe(true);
    expect(response.body.added).toBe(false);
    expect(response.body.message).toBe("Such puzzle already exists");
  }, 10000);

  test("unsuccessful add due to puzzle being invalid", async () => {
    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));


    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      userID: "G26-ID"
    }))

    //Mocking find in order to not communicate with db
    jest.spyOn(eightsModel, "find").mockImplementationOnce(() => query);

    //Getting info that puzzle doesn't exist
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([]));


    const response = await request.post("/eights_puzzle/add_eights_puzzle/").set("Cookie", ["jwt=token"]).send(
      {
        "puzzle-type": "eights_puzzle",
        "values": invalidEightsJSON.values,
        "creator-id": user.userID,
      })
    expect(response.body.puzzle_exists).toBe(false);
    expect(response.body.added).toBe(false);
    expect(response.body.message).toBe("This puzzle is unsolvable");
  }, 100000);

  test("unsuccessfull add from file, invalid content 1", async () => {
    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));


    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      groupID: "G26-ID"
    }))

    //Passing invalid content
    const response = await request.post("/eights_puzzle/add_8s_puzzle_from_upload/").set("Cookie", ["jwt=token"]).send(
      {
        puzzle_file: {
          "puzzle-type": "eights_puzzle",
          "values": eightsPuzzle.values,
          "creator-id": user.userID,
          "difficulty": 80,
        }
      })
    console.log(response.body);
    expect(response.body.puzzle_exists).toBe(false);
    expect(response.body.added).toBe(false);
    expect(response.body.message).toBe('File contents are invalid.');
  }, 10000);

  test("unsuccessfull add from file, invalid content 2", async () => {
    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));


    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      groupID: "G26-ID"
    }))

    //Passing invalid content
    const response = await request.post("/eights_puzzle/add_8s_puzzle_from_upload/").set("Cookie", ["jwt=token"]).send(
      {
        puzzle_file: {
          "puzzle-type": "8s_puzzle",
          "values": invalidEightsJSONFormat.values,
          "creator-id": user.userID,
          "difficulty": 80,
        }
      })
    console.log(response.body);
    expect(response.body.puzzle_exists).toBe(false);
    expect(response.body.added).toBe(false);
    expect(response.body.message).toBe('File contents are invalid.');
  }, 10000);

  test("unsuccessfull add from file, puzzle already exists", async () => {
    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));


    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      groupID: "G26-ID"
    }))

    //Mocking find in order to not communicate with db
    jest.spyOn(eightsModel, "find").mockImplementationOnce(() => query);

    //Getting no result from find
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([eightsPuzzle]));

    //Mocking that save was done with no errors
    jest
      .spyOn(mongoose.Model.prototype, "save")
      .mockImplementationOnce((func) => func(false));

    jest.spyOn(eightsModel, "find").mockImplementationOnce(() => query);
    //Getting puzzle
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([eightsPuzzle]));

    //Passing invalid content
    const response = await request.post("/eights_puzzle/add_8s_puzzle_from_upload/").set("Cookie", ["jwt=token"]).send(
      {
        puzzle_file: {
          "puzzle-type": "8s_puzzle",
          "values": eightsJSON.values,
          "creator-id": user.userID,
          "difficulty": 80,
        }
      })
    console.log(response.body);
    expect(response.body.puzzle_exists).toBe(true);
    expect(response.body.added).toBe(false);
    expect(response.body.message).toBe("Such puzzle already exists");
  }, 10000);

  test("successfull add from file", async () => {
    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));


    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      groupID: "G26-ID"
    }))

    //Mocking find in order to not communicate with db
    jest.spyOn(eightsModel, "find").mockImplementationOnce(() => query);

    //Getting info that puzzle exists
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([]));

    jest
      .spyOn(mongoose.Model.prototype, "save")
      .mockImplementationOnce((prop) => prop(false));

    //Passing invalid content
    const response = await request.post("/eights_puzzle/add_8s_puzzle_from_upload/").set("Cookie", ["jwt=token"]).send(
      {
        puzzle_file: {
          "puzzle-type": "8s_puzzle",
          "values": eightsPuzzle.values,
          "creator-id": user.userID,
          "difficulty": 5,
        }
      })
    console.log(response.body);
    expect(response.body.puzzle_exists).toBe(false);
    expect(response.body.added).toBe(true);
    expect(response.body).toHaveProperty('new_puzzle')
  }, 10000);

  test("Get the next move for an eights puzzle", async () => {

    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));


    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      groupID: "G26-ID"
    }))

    const response = await request
      .post("/eights_puzzle/get_next_move")
      .set("Cookie", ["jwt=token"])
      .send({
        puzzle_state: [[1, 2, 3], [4, 5, 6], [7, null, 8]]
      })

    expect(response.body.x).toBe(2)
    expect(response.body.y).toBe(2)
  })

  test("Get the difficulty of a puzzle", async () => {
    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
    const user = new User({
      name: "Blabla",
      email: "blabla@gmail.com",
      password: "pass1234",
      passwordConfirm: "pass12345",
      passwordChangeDate,
      groupID: 26,
      role: "creator",
      userID: "G26-id",
      isGuest: false,
    });
    const now = new Date();
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      displayName: user.name,
      groupID: user.groupID,
      userID: user.userID,
      role: "creator",
      iat: parseInt(now.getTime() / 1000),
    }));


    jest.spyOn(User, "findOne").mockImplementationOnce(({ userID }) =>
      userID === user.userID ? Promise.resolve(user) : null
    )

    jest.spyOn(jwt, "decode").mockImplementationOnce(() => ({
      groupID: "G26-ID"
    }))

    const response = await request
      .post("/eights_puzzle/get_difficulty")
      .set("Cookie", ["jwt=token"])
      .send({
        puzzle_state: [[1, 2, 3], [4, 5, 6], [7, null, 8]]
      })

    expect(response.body.difficulty).toBe(1)
  })
})
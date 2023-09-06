const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const sudoku_model = require("../Models/Sudoku_Model");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const { use } = require("../app");
// jest.useFakeTimers('legacy')
describe("test sudoku routes", () => {
  let query;
  let request;
  let sudoku_game;
  let sudoku_game_json;
  let sudoku_game_invalid;
  let sudoku_game_invalid_json;
  let sudoku_game_invalid_content_json1;
  beforeAll(async () => {
    process.env = {
      ...process.env,
      JWT_COOKIE_EXPIRES_IN: 90,
    };
    sudoku_game = new sudoku_model({ "puzzle-type": "sudoku", "values": [[0, 0, 4, 9, 0, 0, 0, 3, 8], [0, 0, 0, 0, 0, 0, 6, 0, 0], [2, 0, 0, 5, 0, 0, 0, 9, 0], [7, 0, 0, 0, 0, 5, 4, 8, 0], [8, 0, 0, 0, 7, 0, 0, 0, 3], [0, 9, 3, 8, 0, 0, 0, 0, 1], [0, 8, 0, 0, 0, 4, 0, 0, 6], [0, 0, 7, 0, 0, 0, 0, 0, 0], [3, 1, 0, 0, 0, 8, 7, 0, 0]], "solution": [[1, 5, 4, 9, 6, 7, 2, 3, 8], [9, 3, 8, 1, 4, 2, 6, 5, 7], [2, 7, 6, 5, 8, 3, 1, 9, 4], [7, 6, 1, 3, 9, 5, 4, 8, 2], [8, 2, 5, 4, 7, 1, 9, 6, 3], [4, 9, 3, 8, 2, 6, 5, 7, 1], [5, 8, 9, 7, 1, 4, 3, 2, 6], [6, 4, 7, 2, 3, 9, 8, 1, 5], [3, 1, 2, 6, 5, 8, 7, 4, 9]], "creator-id": "G26-63654f228e851d847a951a63", "checker-id": "G26-63654f228e851d847a951a63", "difficulty": 80 });
    sudoku_game_json = { "puzzle-type": "sudoku", "values": [[0, 0, 4, 9, 0, 0, 0, 3, 8], [0, 0, 0, 0, 0, 0, 6, 0, 0], [2, 0, 0, 5, 0, 0, 0, 9, 0], [7, 0, 0, 0, 0, 5, 4, 8, 0], [8, 0, 0, 0, 7, 0, 0, 0, 3], [0, 9, 3, 8, 0, 0, 0, 0, 1], [0, 8, 0, 0, 0, 4, 0, 0, 6], [0, 0, 7, 0, 0, 0, 0, 0, 0], [3, 1, 0, 0, 0, 8, 7, 0, 0]], "solution": [[1, 5, 4, 9, 6, 7, 2, 3, 8], [9, 3, 8, 1, 4, 2, 6, 5, 7], [2, 7, 6, 5, 8, 3, 1, 9, 4], [7, 6, 1, 3, 9, 5, 4, 8, 2], [8, 2, 5, 4, 7, 1, 9, 6, 3], [4, 9, 3, 8, 2, 6, 5, 7, 1], [5, 8, 9, 7, 1, 4, 3, 2, 6], [6, 4, 7, 2, 3, 9, 8, 1, 5], [3, 1, 2, 6, 5, 8, 7, 4, 9]], "creator-id": "G26-63654f228e851d847a951a63", "checker-id": "G26-63654f228e851d847a951a63", "difficulty": 80 }
    sudoku_game_invalid = new sudoku_model({ "puzzle-type": "sudoku", "values": [[0, 0, 4, 9, 0, 0, 0, 3, 8], [0, 0, 0, 0, 0, 0, 6, 0, 0], [2, 0, 0, 5, 0, 0, 0, 9, 0], [7, 0, 0, 0, 0, 5, 4, 8, 0], [8, 0, 0, 0, 7, 0, 0, 0, 3], [0, 9, 3, 8, 0, 0, 0, 0, 1], [0, 8, 0, 0, 0, 4, 0, 0, 6], [0, 0, 7, 0, 0, 0, 0, 0, 0], [3, 1, 0, 0, 0, 8, 7, 0, 0]], "solution": [[1, 5, 4, 9, 6, 7, 2, 3, 8], [9, 3, 8, 1, 4, 2, 6, 5, 7], [2, 7, 6, 5, 8, 3, 1, 9, 4], [7, 6, 1, 3, 9, 5, 4, 8, 2], [8, 2, 5, 4, 7, 1, 9, 6, 3], [4, 9, 3, 8, 2, 6, 5, 7, 1], [5, 8, 9, 7, 1, 4, 3, 2, 6], [6, 4, 7, 2, 3, 9, 8, 1, 5], [3, 1, 2, 6, 5, 8, 7, 4, 9]], "creator-id": "G26-63654f228e851d847a951a63", "checker-id": "G26-63654f228e851d847a951a63", "difficulty": 80 });
    sudoku_game_invalid_json = { "puzzle-type": "sudoku", "values": [[0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 9, 0], [7, 0, 0, 0, 0, 0, 4, 8, 0], [8, 0, 0, 0, 7, 0, 0, 0, 3], [0, 9, 3, 8, 0, 0, 0, 0, 1], [0, 8, 0, 0, 0, 4, 0, 0, 6], [0, 0, 7, 0, 0, 0, 0, 0, 0], [3, 1, 0, 0, 0, 8, 7, 0, 0]], "solution": [[1, 5, 4, 9, 6, 7, 2, 3, 8], [9, 3, 8, 1, 4, 2, 6, 5, 7], [2, 7, 6, 5, 8, 3, 1, 9, 4], [7, 6, 1, 3, 9, 5, 4, 8, 2], [8, 2, 5, 4, 7, 1, 9, 6, 3], [4, 9, 3, 8, 2, 6, 5, 7, 1], [5, 8, 9, 7, 1, 4, 3, 2, 6], [6, 4, 7, 2, 3, 9, 8, 1, 5], [3, 1, 2, 6, 5, 8, 7, 4, 9]], "creator-id": "G26-63654f228e851d847a951a63", "checker-id": "G26-63654f228e851d847a951a63", "difficulty": 80 };
    sudoku_game_invalid_content_json1 = { "puzzle-type": "sudoku", "values": [["a", 0, 4, 9, 0, 0, 0, 3, 8], [0, 0, 0, 0, 0, 0, 6, 0, 0], [2, 0, 0, 5, 0, 0, 0, 9, 0], [7, 0, 0, 0, 0, 5, 4, 8, 0], [8, 0, 0, 0, 7, 0, 0, 0, 3], [0, 9, 3, 8, 0, 0, 0, 0, 1], [0, 8, 0, 0, 0, 4, 0, 0, 6], [0, 0, 7, 0, 0, 0, 0, 0, 0], [3, 1, 0, 0, 0, 8, 7, 0, 0]], "solution": [[1, 5, 4, 9, 6, 7, 2, 3, 8], [9, 3, 8, 1, 4, 2, 6, 5, 7], [2, 7, 6, 5, 8, 3, 1, 9, 4], [7, 6, 1, 3, 9, 5, 4, 8, 2], [8, 2, 5, 4, 7, 1, 9, 6, 3], [4, 9, 3, 8, 2, 6, 5, 7, 1], [5, 8, 9, 7, 1, 4, 3, 2, 6], [6, 4, 7, 2, 3, 9, 8, 1, 5], [3, 1, 2, 6, 5, 8, 7, 4, 9]], "creator-id": "G26-63654f228e851d847a951a63", "checker-id": "G26-63654f228e851d847a951a63", "difficulty": 80 }
    query = sudoku_model.find({})

  });

  beforeEach(() => {
    request = supertest(app);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  //Checking that it is possible to get route
  test("successfull get hard puzzle", async () => {
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
    jest.spyOn(sudoku_model, "aggregate").mockImplementationOnce(() => Promise.resolve([{ sudoku: sudoku_game }]));

    //Getting puzzle
    const response = await request.post("/sudoku/get_sudoku_puzzle/").set("Cookie", ["jwt=token"]).send({
      difficulty: "hard"
    });

    console.log(response.body);
    expect(response.body.found).toBe(true)
    expect(response.body).toHaveProperty("game")
    expect(response.body.game).toHaveProperty("puzzle-type")
    expect(response.body.game).toHaveProperty("creator-id")
    expect(response.body.game).toHaveProperty("difficulty")
    expect(response.body.game).toHaveProperty("active")
    expect(response.body.game).toHaveProperty("values")
    expect(response.body.game).toHaveProperty("solution")
    expect(response.body.game.active).toBe(true)
  });
  test("successfull get easy puzzle", async () => {
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
    jest.spyOn(sudoku_model, "aggregate").mockImplementationOnce(() => Promise.resolve([{ sudoku: sudoku_game }]));

    //Getting puzzle
    const response = await request.post("/sudoku/get_sudoku_puzzle/").set("Cookie", ["jwt=token"]).send({
      difficulty: "easy"
    });

    console.log(response.body);
    expect(response.body.found).toBe(true)
    expect(response.body).toHaveProperty("game")
    expect(response.body.game).toHaveProperty("puzzle-type")
    expect(response.body.game).toHaveProperty("creator-id")
    expect(response.body.game).toHaveProperty("difficulty")
    expect(response.body.game).toHaveProperty("active")
    expect(response.body.game).toHaveProperty("values")
    expect(response.body.game).toHaveProperty("solution")
    expect(response.body.game.active).toBe(true)
  });
  test("successfull get medium puzzle", async () => {
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
    jest.spyOn(sudoku_model, "aggregate").mockImplementationOnce(() => Promise.resolve([{ sudoku: sudoku_game }]));

    //Getting puzzle
    const response = await request.post("/sudoku/get_sudoku_puzzle/").set("Cookie", ["jwt=token"]).send({
      difficulty: "medium"
    });

    console.log(response.body);
    expect(response.body.found).toBe(true)
    expect(response.body).toHaveProperty("game")
    expect(response.body.game).toHaveProperty("puzzle-type")
    expect(response.body.game).toHaveProperty("creator-id")
    expect(response.body.game).toHaveProperty("difficulty")
    expect(response.body.game).toHaveProperty("active")
    expect(response.body.game).toHaveProperty("values")
    expect(response.body.game).toHaveProperty("solution")
    expect(response.body.game.active).toBe(true)
  });
  //Testing creation of puzzle
  test("successfull add", async () => {
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
    jest.spyOn(sudoku_model, "find").mockImplementationOnce(() => query);

    //Getting no result from find
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([]));

    //Mocking that save was done with no errors
    jest
      .spyOn(mongoose.Model.prototype, "save")
      .mockImplementationOnce((func) => func(false));

    //Sending request with valid puzzle
    const response = await request.post("/sudoku/add_sudoku_puzzle/").set("Cookie", ["jwt=token"]).send(
      {
        "puzzle-type": "sudoku",
        "values": sudoku_game_json.values,
        "solution": sudoku_game_json.solution,
        "creator-id": user.userID,
      })
    expect(response.body.puzzle_exists).toBe(false);
    expect(response.body.added).toBe(true);
    expect(response.body.message).toBe("Upload successfull.");
    expect(response.body).toHaveProperty("new_puzzle")

  }, 10000);
  // //Testing puzzle creation failure because of inappropriate role
  test("unsuccessfull add , invalid role", async () => {
    //Mocking user existance
    const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
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
      userID: "G26-ID"
    }))

    const response = await request.post("/sudoku/add_sudoku_puzzle/").set("Cookie", ["jwt=token"]).send(
      {
        "puzzle-type": "sudoku",
        "values": sudoku_game_json.values,
        "solution": sudoku_game_json.solution,
        "creator-id": user.userID,
        "checker-id": user.userID,
      })
    console.log(response.body);
    expect(response.body.message).toBe("You do not have permission to perform this action");

  }, 10000);

  //Testing puzzle creation failure when puzzle exists
  test("unsuccessfull add, puzzle exists", async () => {
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
    jest.spyOn(sudoku_model, "find").mockImplementationOnce(() => query);

    //Getting an array that contains such puzzle
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([sudoku_game]));


    const response = await request.post("/sudoku/add_sudoku_puzzle/").set("Cookie", ["jwt=token"]).send(
      {
        "puzzle-type": "sudoku",
        "values": sudoku_game_json.values,
        "solution": sudoku_game_json.solution,
        "creator-id": user.userID,
        "checker-id": user.userID,
      })
    console.log(response.body);
    expect(response.body.puzzle_exists).toBe(true);
    expect(response.body.added).toBe(false);
    expect(response.body.message).toBe("Such puzzle already exists");

  }, 10000);

  // //Testing puzzle creation failure because puzzle didn't pass DFS
  test("unsuccessfull add, invalid puzzle", async () => {
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
    jest.spyOn(sudoku_model, "find").mockImplementationOnce(() => query);

    //Getting info that puzzle doesn't exist
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([]));


    const response = await request.post("/sudoku/add_sudoku_puzzle/").set("Cookie", ["jwt=token"]).send(
      {
        "puzzle-type": "sudoku",
        "values": sudoku_game_invalid_json.values,
        "solution": sudoku_game_invalid_json.solution,
        "creator-id": user.userID,
        "checker-id": user.userID,
      })
    console.log(response.body);
    expect(response.body.puzzle_exists).toBe(false);
    expect(response.body.added).toBe(false);
    expect(response.body.message).toBe("The sudoku is invalid");
  }, 10000);

  // //Testing puzzle creation from upload failure, because the content is invalid
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
    const response = await request.post("/sudoku/add_sudoku_puzzle_from_upload/").set("Cookie", ["jwt=token"]).send(
      {
        puzzle_file: {
          "puzzle-type": "sudoku",
          "values": sudoku_game_invalid_content_json1.values,
          "solution": sudoku_game_invalid_content_json1.solution,
          "creator-id": user.userID,
          "checker-id": user.userID,
          "difficulty": sudoku_game_invalid_content_json1,
        }
      })
    console.log(response.body);
    expect(response.body.puzzle_exists).toBe(false);
    expect(response.body.added).toBe(false);
    expect(response.body.message).toBe('File contents are invalid.');
  }, 10000);

  // //Testing puzzle creation from upload failure, because the puzzle exists
  test("unsuccessfull add from file, puzzle exists", async () => {
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
    jest.spyOn(sudoku_model, "find").mockImplementationOnce(() => query);

    //Getting info that puzzle exists
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([sudoku_game]));
    jest.spyOn(sudoku_model, "find").mockImplementationOnce(() => query);
    //Getting puzzle
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([sudoku_game]));

    //Sending valid puzzle
    const response = await request.post("/sudoku/add_sudoku_puzzle_from_upload/").set("Cookie", ["jwt=token"]).send(
      {
        puzzle_file: {
          "puzzle-type": "sudoku",
          "values": sudoku_game_json.values,
          "solution": sudoku_game_json.solution,
          "creator-id": user.userID,
          "checker-id": user.userID,
          "difficulty": sudoku_game_json.difficulty,
        }
      })
    expect(response.body.puzzle_exists).toBe(true);
    expect(response.body.added).toBe(false);
    expect(response.body.message).toBe("Such puzzle already exists");
    expect(response.body).toHaveProperty("new_puzzle")

  }, 10000);

  // //Testing successful puzzle creation from upload 
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
      userID: "G26-ID"
    }))

    //Mocking find in order to not communicate with db
    jest.spyOn(sudoku_model, "find").mockImplementationOnce(() => query);

    //Getting info that puzzle exists
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([]));

    //Saving with no errors.
    jest
      .spyOn(mongoose.Model.prototype, "save")
      .mockImplementationOnce((prop) => prop(false));

    const response = await request.post("/sudoku/add_sudoku_puzzle_from_upload/").set("Cookie", ["jwt=token"]).send(
      {
        puzzle_file: {
          "puzzle-type": "sudoku",
          "values": sudoku_game_json.values,
          "solution": sudoku_game_json.solution,
          "creator-id": user.userID,
          "checker-id": user.userID,
          "difficulty": sudoku_game_json.difficulty,
        }
      })
    console.log(response.body)
    expect(response.body.puzzle_exists).toBe(false);
    expect(response.body.added).toBe(true);
    expect(response.body).toHaveProperty('new_puzzle')

  }, 10000);
});


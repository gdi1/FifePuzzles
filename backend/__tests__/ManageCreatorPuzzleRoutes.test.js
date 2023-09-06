const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const sudoku_model = require("../Models/Sudoku_Model");
const eightsModel = require("../Models/Eights_Puzzle_Model");
const hashiModel = require("../Models/Hashi_Model");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const feedback_model = require("../Models/Feedback_Model");
const puzzleSolvedModel = require("../Models/PuzzleSolved");
const { expectCt } = require("helmet");
const h1 = 11;
const h2 = 12;
const v1 = 21;
const v2 = 22;

describe("Test routes for getting created puzzles", () => {

  let querySudoku;
  let queryEights;
  let queryHashi;
  let request;
  let sudoku_game;
  let sudoku_game_json;
  let eightsPuzzle;
  let hashiPuzzle;
  let hashiJSON;
  let eightsJSON;
  let neededSudokuOuts = [
    {
      sudokus: {
        _id: new mongoose.Types.ObjectId("641845bafeba741f9939d668"),
        'puzzle-type': 'sudoku',
        values: [Array],
        solution: [Array],
        'creator-id': 'G26-63654f96ee567b68df8fa288',
        difficulty: 1,
        active: true,
        __v: 0
      },
      feedbacks: [],
      puzzlesolveds: []
    }
  ]

  let neededHashiOuts = [
    {
      hashis: {
        _id: new mongoose.Types.ObjectId("640a1f9a6a4880c00c6e2c8a"),
        'puzzle-type': 'sudoku',
        values: [Array],
        solution: [Array],
        'creator-id': 'G26-63654f96ee567b68df8fa288',
        difficulty: 1,
        active: true,
        __v: 0
      },
      feedbacks: [],
      puzzlesolveds: []
    }
  ]

  let neededEightsOuts = [
    {
      eights_puzzles: {
        _id: new mongoose.Types.ObjectId("641871f2a0dcec74250715f9"),
        'puzzle-type': '8s_puzzle',
        values: [Array],
        'creator-id': 'G26-63654f96ee567b68df8fa288',
        difficulty: 2,
        active: true,
        __v: 0
      },
      feedbacks: [],
      puzzlesolveds: []
    }
  ]

  beforeAll(async () => {
    process.env = {
      ...process.env,
      JWT_COOKIE_EXPIRES_IN: 90,
    };
    sudoku_game = new sudoku_model({ "puzzle-type": "sudoku", "values": [[0, 0, 4, 9, 0, 0, 0, 3, 8], [0, 0, 0, 0, 0, 0, 6, 0, 0], [2, 0, 0, 5, 0, 0, 0, 9, 0], [7, 0, 0, 0, 0, 5, 4, 8, 0], [8, 0, 0, 0, 7, 0, 0, 0, 3], [0, 9, 3, 8, 0, 0, 0, 0, 1], [0, 8, 0, 0, 0, 4, 0, 0, 6], [0, 0, 7, 0, 0, 0, 0, 0, 0], [3, 1, 0, 0, 0, 8, 7, 0, 0]], "solution": [[1, 5, 4, 9, 6, 7, 2, 3, 8], [9, 3, 8, 1, 4, 2, 6, 5, 7], [2, 7, 6, 5, 8, 3, 1, 9, 4], [7, 6, 1, 3, 9, 5, 4, 8, 2], [8, 2, 5, 4, 7, 1, 9, 6, 3], [4, 9, 3, 8, 2, 6, 5, 7, 1], [5, 8, 9, 7, 1, 4, 3, 2, 6], [6, 4, 7, 2, 3, 9, 8, 1, 5], [3, 1, 2, 6, 5, 8, 7, 4, 9]], "creator-id": "G26-id", "difficulty": 80 });
    sudoku_game_json = { "puzzle-type": "sudoku", "values": [[0, 0, 4, 9, 0, 0, 0, 3, 8], [0, 0, 0, 0, 0, 0, 6, 0, 0], [2, 0, 0, 5, 0, 0, 0, 9, 0], [7, 0, 0, 0, 0, 5, 4, 8, 0], [8, 0, 0, 0, 7, 0, 0, 0, 3], [0, 9, 3, 8, 0, 0, 0, 0, 1], [0, 8, 0, 0, 0, 4, 0, 0, 6], [0, 0, 7, 0, 0, 0, 0, 0, 0], [3, 1, 0, 0, 0, 8, 7, 0, 0]], "solution": [[1, 5, 4, 9, 6, 7, 2, 3, 8], [9, 3, 8, 1, 4, 2, 6, 5, 7], [2, 7, 6, 5, 8, 3, 1, 9, 4], [7, 6, 1, 3, 9, 5, 4, 8, 2], [8, 2, 5, 4, 7, 1, 9, 6, 3], [4, 9, 3, 8, 2, 6, 5, 7, 1], [5, 8, 9, 7, 1, 4, 3, 2, 6], [6, 4, 7, 2, 3, 9, 8, 1, 5], [3, 1, 2, 6, 5, 8, 7, 4, 9]], "creator-id": "G26-id", "difficulty": 80 };
    eightsPuzzle = new eightsModel({
      "puzzle-type": "eights_puzzle",
      "values": [[1, 2, 3], [4, 5, 6], [7, null, 8]],
      "creator-id": "G26-id",
      "difficulty": 80
    })
    eightsJSON = {
      "puzzle-type": "eights_puzzle",
      "values": [[1, 2, 3], [4, 5, 6], [7, null, 8]],
      "creator-id": "G26-id",
      "difficulty": 80
    }
    hashiPuzzle = new hashiModel({
      "puzzle-type": "hashi",
      "values": [[4, 0, 6, 0, 3], [0, 0, 0, 1, 0], [4, 0, 3, 0, 0], [0, 0, 0, 0, 1], [2, 0, 0, 2, 0]],
      "solution": [[4, h2, 6, h2, 3], [v2, 0, v2, 1, v1], [4, h1, 3, v1, v1], [v1, 0, 0, v1, 1], [2, h1, h1, 2, 0]],
      "creator-id": "G26-id",
      "difficulty": "hard"
    })
    hashiJSON = {
      "puzzle-type": "hashi",
      "values": [[4, 0, 6, 0, 3], [0, 0, 0, 1, 0], [4, 0, 3, 0, 0], [0, 0, 0, 0, 1], [2, 0, 0, 2, 0]],
      "solution": [[4, h2, 6, h2, 3], [v2, 0, v2, 1, v1], [4, h1, 3, v1, v1], [v1, 0, 0, v1, 1], [2, h1, h1, 2, 0]],
      "creator-id": "G26-id",
      "difficulty": "hard"
    }
    querySudoku = sudoku_model.find({});
    queryEights = eightsModel.find({});
    queryHashi = hashiModel.find({});
  });

  beforeEach(() => {
    request = supertest(app);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Get created sudoku puzzle", async () => {

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
      groupID: 26
    }))

    //Mocking find in order to not communicate with db
    jest.spyOn(sudoku_model, "find").mockImplementationOnce(() => querySudoku);

    //Getting an array that contains such puzzle
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([sudoku_game]));

    jest.spyOn(sudoku_model, "aggregate").mockImplementationOnce(() => querySudoku);

    const response = await request.post("/created_puzzles/get_created_sudokus/").set("Cookie", ["jwt=token"]).send(
      {
        "current_length": 0
      }
    )

    console.log(response.body);
  })

  test("Get created eights puzzle", async () => {

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
      groupID: 26
    }))

    //Mocking find in order to not communicate with db
    jest.spyOn(eightsModel, "find").mockImplementationOnce(() => queryEights);

    //Getting an array that contains such puzzle
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([eightsPuzzle]));

    //Mocking that save was done with no errors
    jest
      .spyOn(mongoose.Model.prototype, "save")
      .mockImplementationOnce((func) => func(false));

    jest.spyOn(eightsModel, "aggregate").mockImplementationOnce(() => queryEights);

    const response = await request.post("/created_puzzles/get_created_eights_puzzles/").set("Cookie", ["jwt=token"]).send(
      {
        "current_length": 0
      }
    )

    console.log(response.body);
  })

  test("Get created hashi puzzles", async () => {

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
      groupID: 26
    }))

    //Mocking find in order to not communicate with db
    jest.spyOn(hashiModel, "find").mockImplementationOnce(() => queryHashi);

    //Getting an array that contains such puzzle
    jest
      .spyOn(mongoose.Query.prototype, "exec")
      .mockImplementationOnce(() => Promise.resolve([hashiPuzzle]));

    jest.spyOn(hashiModel, "aggregate").mockImplementationOnce(() => queryHashi);

    const response = await request.post("/created_puzzles/get_created_hashi_puzzles/").set("Cookie", ["jwt=token"]).send(
      {
        "current_length": 0
      }
    )

    console.log(response.body);
  })
  test("delete created eights puzzle", async () => {
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
      groupID: 26,
      userID: "G26-63654f96ee567b68df8fa288"
    }))

    jest.spyOn(eightsModel, "aggregate").mockImplementationOnce(() => {
      return Promise.resolve(neededEightsOuts)
    })

    jest.spyOn(feedback_model, "deleteMany").mockImplementationOnce(() => { Promise.resolve() })
    jest.spyOn(puzzleSolvedModel, "deleteMany").mockImplementationOnce(() => { Promise.resolve() })
    jest.spyOn(eightsModel, "deleteOne").mockImplementationOnce(() => { Promise.resolve() })
    const response = await request.post("/created_puzzles/delete_created_eights_puzzle/").set("Cookie", ["jwt=token"]).send(
      {
        "sudoku_id": "641871f2a0dcec74250715f9"
      }
    )
    console.log(response.body)
    expect(response.body.status).toBe("success")
    expect(response.body.message).toBe('Successfully deleted!')

  })

  test("delete created sudoku puzzle", async () => {
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
      groupID: 26,
      userID: "G26-63654f96ee567b68df8fa288"
    }))

    jest.spyOn(sudoku_model, "aggregate").mockImplementationOnce(() => {
      return Promise.resolve(neededSudokuOuts)
    })

    jest.spyOn(feedback_model, "deleteMany").mockImplementationOnce(() => { Promise.resolve() })
    jest.spyOn(puzzleSolvedModel, "deleteMany").mockImplementationOnce(() => { Promise.resolve() })
    jest.spyOn(sudoku_model, "deleteOne").mockImplementationOnce(() => { Promise.resolve() })
    const response = await request.post("/created_puzzles/delete_created_sudoku/").set("Cookie", ["jwt=token"]).send(
      {
        "sudoku_id": "641845bafeba741f9939d668"
      }
    )
    console.log(response.body)
    expect(response.body.status).toBe("success")
    expect(response.body.message).toBe('Successfully deleted!')

  })
  test("delete created hashi puzzle", async () => {
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
      groupID: 26,
      userID: "G26-63654f96ee567b68df8fa288"
    }))

    jest.spyOn(hashiModel, "aggregate").mockImplementationOnce(() => {
      return Promise.resolve(neededHashiOuts)
    })

    jest.spyOn(feedback_model, "deleteMany").mockImplementationOnce(() => { Promise.resolve() })
    jest.spyOn(puzzleSolvedModel, "deleteMany").mockImplementationOnce(() => { Promise.resolve() })
    jest.spyOn(hashiModel, "deleteOne").mockImplementationOnce(() => { Promise.resolve() })
    const response = await request.post("/created_puzzles/delete_created_hashi_puzzle/").set("Cookie", ["jwt=token"]).send(
      {
        "sudoku_id": "640a1f9a6a4880c00c6e2c8a"
      }
    )
    console.log(response.body)
    expect(response.body.status).toBe("success")
    expect(response.body.message).toBe('Successfully deleted!')

  })
})
const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const sudoku_model = require("../Models/Sudoku_Model");
const eightsModel = require("../Models/Eights_Puzzle_Model");
const hashiModel = require("../Models/Hashi_Model");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const { expectCt } = require("helmet");
const h1 = 11;
const h2 = 12;
const v1 = 21;
const v2 = 22;

describe("Test routes for getting solved puzzles", () => {


  let request;
  let sudoku_game;
  let sudokus_out;
  let hashi_out;
  let eights_out;
  beforeAll(async () => {
    process.env = {
      ...process.env,
      JWT_COOKIE_EXPIRES_IN: 90,
    };

    sudokus_out = [
      {
        sudokus: {
          _id: new mongoose.Types.ObjectId("63fe3b062c5c198ca075b2c6"),
          'puzzle-type': 'sudoku',
          values: [Array],
          solution: [Array],
          'creator-id': 'G26-63654f96ee567b68df8fa288',
          difficulty: 3,
          active: true,
          __v: 0
        },
        date_solved: new Date("2023 - 03 - 09T00: 00: 00.000Z"),
        average_rating: 5
      }
    ]
    eights_out = [
      {
        eights_puzzles: {
          _id: new mongoose.Types.ObjectId("63d2dd1c858c044745596a68"),
          'puzzle-type': '8s_puzzle',
          values: [Array],
          'creator-id': 'G26-63d03e097c18bdc5d95a3e2e',
          difficulty: 7,
          __v: 0,
          active: true
        },
        date_solved: new Date("2023 - 03 - 02T00: 00: 00.000Z"),
        average_rating: 5
      },
      {
        eights_puzzles: {
          _id: new mongoose.Types.ObjectId("63d2ed7a27fe23a49f850b2c"),
          'puzzle-type': '8s_puzzle',
          values: [Array],
          'creator-id': 'G26-63d03e097c18bdc5d95a3e2e',
          difficulty: 10,
          __v: 0,
          active: false
        },
        date_solved: new Date("2023 - 03 - 02T00: 00: 00.000Z"),
        average_rating: 2
      },
      {
        eights_puzzles: {
          _id: new mongoose.Types.ObjectId("63d2ed7a27fe23a49f850b2c"),
          'puzzle-type': '8s_puzzle',
          values: [Array],
          'creator-id': 'G26-63d03e097c18bdc5d95a3e2e',
          difficulty: 10,
          __v: 0,
          active: false
        },
        date_solved: new Date("2023 - 03 - 02T00: 00: 00.000Z"),
        average_rating: 2
      },
      {
        eights_puzzles: {
          _id: new mongoose.Types.ObjectId("63d2eea1d0beafa29609b9c4"),
          'puzzle-type': '8s_puzzle',
          values: [Array],
          'creator-id': 'G26-63d03e097c18bdc5d95a3e2e',
          difficulty: 3,
          __v: 0,
          active: false
        },
        date_solved: new Date("2023 - 03 - 01T00: 00: 00.000Z"),
        average_rating: 4
      }
    ]
    hashi_out = [
      {
        hashis: {
          _id: new mongoose.Types.ObjectId("640a1f356a4880c00c6e2c65"),
          'puzzle-type': 'hashi',
          values: [Array],
          solution: [Array],
          'creator-id': 'G26-63654f96ee567b68df8fa288',
          difficulty: 1,
          active: true,
          __v: 0
        },
        date_solved: new Date("2023 - 03 - 09T00: 00: 00.000Z"),
        average_rating: 1
      },
      {
        hashis: {
          _id: new mongoose.Types.ObjectId("63f25db56b13a08719eeeccc"),
          'puzzle-type': 'hashi',
          values: [Array],
          solution: [Array],
          'creator-id': 'G26-63d03e097c18bdc5d95a3e2e',
          difficulty: 9,
          active: true,
          __v: 0
        },
        date_solved: new Date("2023 - 03 - 02T00: 00: 00.000Z"),
        average_rating: 3.75
      },
      {
        hashis: {
          _id: new mongoose.Types.ObjectId("63f25db56b13a08719eeeccc"),
          'puzzle-type': 'hashi',
          values: [Array],
          solution: [Array],
          'creator-id': 'G26-63d03e097c18bdc5d95a3e2e',
          difficulty: 9,
          active: true,
          __v: 0
        },
        date_solved: new Date("2023 - 03 - 02T00: 00: 00.000Z"),
        average_rating: 3.75
      },
      {
        hashis: {
          _id: new mongoose.Types.ObjectId("63f25f676b13a08719eeed2a"),
          'puzzle-type': 'hashi',
          values: [Array],
          solution: [Array],
          'creator-id': 'G26-63d03e097c18bdc5d95a3e2e',
          difficulty: 5,
          active: true,
          __v: 0
        },
        date_solved: new Date("2023 - 03 - 02T00: 00: 00.000Z"),
        average_rating: 3.5
      }
    ]

  });

  beforeEach(() => {
    request = supertest(app);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("get solved sudokus", async () => {
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

    console.log(user)
    jest.spyOn(User, "find").mockImplementationOnce(() => {
      return Promise.resolve([user])
    })

    jest.spyOn(sudoku_model, "aggregate").mockImplementationOnce(() => Promise.resolve(sudokus_out));

    const response = await request.post("/solved-puzzles-for-solvers/get_solved_sudokus/").set("Cookie", ["jwt=token"]).send(
      {
        "current_length": 0
      }
    )
    expect(response.body).toHaveProperty("puzzles_solved")
    expect(response.body.puzzles_solved[0]).toHaveProperty("sudokus")
    expect(response.body.puzzles_solved[0]).toHaveProperty("date_solved")
    expect(response.body.puzzles_solved[0]).toHaveProperty("average_rating")
    expect(response.body.puzzles_solved[0].sudokus).toHaveProperty("puzzle-type")
    expect(response.body.puzzles_solved[0].sudokus).toHaveProperty("values")
    expect(response.body.puzzles_solved[0].sudokus).toHaveProperty("solution")
    expect(response.body.puzzles_solved[0].sudokus).toHaveProperty("active")
    expect(response.body.puzzles_solved[0].sudokus).toHaveProperty("difficulty")
    expect(response.body.puzzles_solved[0].sudokus).toHaveProperty("creator-id")

  })

  test("get solved hashis", async () => {
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

    jest.spyOn(User, "find").mockImplementationOnce(() => {
      return Promise.resolve([user])
    })

    jest.spyOn(hashiModel, "aggregate").mockImplementationOnce(() => Promise.resolve(hashi_out));

    const response = await request.post("/solved-puzzles-for-solvers/get_solved_hashi_puzzles/").set("Cookie", ["jwt=token"]).send(
      {
        "current_length": 0
      }
    )

    expect(response.body).toHaveProperty("puzzles_solved")
    expect(response.body.puzzles_solved[0]).toHaveProperty("hashis")
    expect(response.body.puzzles_solved[0]).toHaveProperty("date_solved")
    expect(response.body.puzzles_solved[0]).toHaveProperty("average_rating")
    expect(response.body.puzzles_solved[0].hashis).toHaveProperty("puzzle-type")
    expect(response.body.puzzles_solved[0].hashis).toHaveProperty("values")
    expect(response.body.puzzles_solved[0].hashis).toHaveProperty("solution")
    expect(response.body.puzzles_solved[0].hashis).toHaveProperty("active")
    expect(response.body.puzzles_solved[0].hashis).toHaveProperty("difficulty")
    expect(response.body.puzzles_solved[0].hashis).toHaveProperty("creator-id")

  })

  test("get solved eights_puzzles", async () => {
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

    jest.spyOn(User, "find").mockImplementationOnce(() => {
      return Promise.resolve([user])
    })

    jest.spyOn(eightsModel, "aggregate").mockImplementationOnce(() => Promise.resolve(eights_out));

    const response = await request.post("/solved-puzzles-for-solvers/get_solved_eights_puzzles/").set("Cookie", ["jwt=token"]).send(
      {
        "current_length": 0
      }
    )

    expect(response.body).toHaveProperty("puzzles_solved")
    expect(response.body.puzzles_solved[0]).toHaveProperty("eights_puzzles")
    expect(response.body.puzzles_solved[0]).toHaveProperty("date_solved")
    expect(response.body.puzzles_solved[0]).toHaveProperty("average_rating")
    expect(response.body.puzzles_solved[0].eights_puzzles).toHaveProperty("puzzle-type")
    expect(response.body.puzzles_solved[0].eights_puzzles).toHaveProperty("values")
    expect(response.body.puzzles_solved[0].eights_puzzles).toHaveProperty("active")
    expect(response.body.puzzles_solved[0].eights_puzzles).toHaveProperty("difficulty")
    expect(response.body.puzzles_solved[0].eights_puzzles).toHaveProperty("creator-id")

  })

})
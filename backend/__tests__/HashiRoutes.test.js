const app = require("../app");
const supertest = require("supertest");
const mongoose = require("mongoose");
const hashiModel = require("../Models/Hashi_Model");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const h1 = 11;
const h2 = 12;
const v1 = 21;
const v2 = 22;

describe("Test Hashi Routes", () => {

    let query;
    let request;
    let hashiPuzzle;
    let hashiJSON;
    let invalidHashiPuzzle;
    let invalidHashiJSON;
    let invalidHashiJSONFormat;

    beforeAll(async () => {
        process.env = {
            ...process.env,
            JWT_COOKIE_EXPIRES_IN: 90,
        };
        hashiPuzzle = new hashiModel({
            "puzzle-type": "hashi",
            "values": [[4, 0, 6, 0, 3], [0, 0, 0, 1, 0], [4, 0, 3, 0, 0], [0, 0, 0, 0, 1], [2, 0, 0, 2, 0]],
            "solution": [[4, h2, 6, h2, 3], [v2, 0, v2, 1, v1], [4, h1, 3, v1, v1], [v1, 0, 0, v1, 1], [2, h1, h1, 2, 0]],
            "creator-id": "G26-63654f228e851d847a951a63",
            "difficulty": "80"
        })
        hashiJSON = { "puzzle-type": "hashi", "values": [[null, 1, null, null, 3, null, 2], [2, null, null, 3, null, 2, null], [null, null, 1, null, 2, null, 2], [2, null, null, null, null, 4, null], [null, null, null, 4, null, null, 3], [5, null, 5, null, 3, null, null], [null, null, null, 2, null, 3, null], [4, null, 7, null, 4, null, null], [null, null, null, null, null, null, 2], [3, null, 5, null, null, 2, null]], "solution": [[null, 1, 11, 11, 3, 11, 2], [2, 11, 11, 3, 21, 2, 21], [21, null, 1, 22, 2, 22, 2], [2, null, 21, 22, 21, 4, 21], [21, null, 21, 4, 21, 22, 3], [5, 12, 5, 22, 3, 22, 22], [22, null, 22, 2, 22, 3, 22], [4, 11, 7, 12, 4, 21, 22], [21, null, 22, null, null, 21, 2], [3, 12, 5, 11, 11, 2, null]], "creator-id": "g26-1", "checker-id": "g26-1", "difficulty": 1 }
        invalidHashiPuzzle = new hashiModel({
            "puzzle-type": "hashi",
            "values": [[2, 0, 0, 0, 2], [0, 0, 0, 0, 0], [4, 0, 3, 0, 4]],
            "solution": [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
            "creator-id": "G26-63654f228e851d847a951a63",
            "difficulty": "80"
        })
        invalidHashiJSON = {
            "puzzle-type": "hashi",
            "values": [[2, 0, 0, 0, 2], [0, 0, 0, 0, 0], [4, 0, 3, 0, 4]],
            "solution": [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
            "creator-id": "G26-63654f228e851d847a951a63",
            "difficulty": "80"
        }
        invalidHashiJSONFormat = {
            "puzzle-type": "hashi",
            "values": [[4, 0, 6, 0, 3], [0, 0, 0, 1, 0], [4, 0, "a", 0, 0], [0, 0, 0, 0, 1], [2, 0, 0, 2, 0]],
            "solution": [[4, h2, 6, h2, 3], [v2, 0, v2, 1, v1], [4, h1, "a", v1, v1], [v1, 0, 0, v1, 1], [2, h1, h1, 2, 0]],
            "creator-id": "G26-63654f228e851d847a951a63",
            "difficulty": "80"
        }
        query = hashiModel.find({})
    })

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
        jest.spyOn(hashiModel, "aggregate").mockImplementationOnce(() => Promise.resolve([{ hashi: hashiPuzzle }]));

        const response = await request.post("/hashi/get_hashi_puzzle/").set("Cookie", ["jwt=token"]).send({
            difficulty: "hard"
        });
        console.log(response.body)
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
        jest.spyOn(hashiModel, "aggregate").mockImplementationOnce(() => Promise.resolve([{ hashi: hashiPuzzle }]));

        const response = await request.post("/hashi/get_hashi_puzzle/").set("Cookie", ["jwt=token"]).send({
            difficulty: "medium"
        });
        console.log(response.body)
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
        jest.spyOn(hashiModel, "aggregate").mockImplementationOnce(() => Promise.resolve([{ hashi: hashiPuzzle }]));

        const response = await request.post("/hashi/get_hashi_puzzle/").set("Cookie", ["jwt=token"]).send({
            difficulty: "easy"
        });
        console.log(response.body)
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
        jest.spyOn(hashiModel, "find").mockImplementationOnce(() => query);

        //Getting no result from find
        jest
            .spyOn(mongoose.Query.prototype, "exec")
            .mockImplementationOnce(() => Promise.resolve([]));

        //Mocking that save was done with no errors
        jest
            .spyOn(mongoose.Model.prototype, "save")
            .mockImplementationOnce((func) => func(false));

        //Sending request with valid puzzle
        const response = await request.post("/hashi/add_hashi_puzzle/").set("Cookie", ["jwt=token"]).send(
            {
                "puzzle-type": "hashi_puzzle",
                "values": hashiJSON.values,
                "solution": hashiJSON.solution,
                "creator-id": user.userID,
            })

        console.log(response.body);
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
        jest.spyOn(hashiModel, "find").mockImplementationOnce(() => query);

        //Getting no result from find
        jest
            .spyOn(mongoose.Query.prototype, "exec")
            .mockImplementationOnce(() => Promise.resolve([]));

        //Mocking that save was done with no errors
        jest
            .spyOn(mongoose.Model.prototype, "save")
            .mockImplementationOnce((func) => func(false));

        //Sending request with valid puzzle
        const response = await request.post("/hashi/add_hashi_puzzle/").set("Cookie", ["jwt=token"]).send(
            {
                "puzzle-type": "hashi_puzzle",
                "values": hashiJSON.values,
                "solution": hashiJSON.solution,
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
        jest.spyOn(hashiModel, "find").mockImplementationOnce(() => query);

        //Getting no result from find
        jest
            .spyOn(mongoose.Query.prototype, "exec")
            .mockImplementationOnce(() => Promise.resolve([hashiPuzzle]));

        //Mocking that save was done with no errors
        jest
            .spyOn(mongoose.Model.prototype, "save")
            .mockImplementationOnce((func) => func(false));

        //Sending request with valid puzzle
        const response = await request.post("/hashi/add_hashi_puzzle/").set("Cookie", ["jwt=token"]).send(
            {
                "puzzle-type": "hashi_puzzle",
                "values": hashiJSON.values,
                "solution": hashiJSON.solution,
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
        jest.spyOn(hashiModel, "find").mockImplementationOnce(() => query);

        //Getting info that puzzle doesn't exist
        jest
            .spyOn(mongoose.Query.prototype, "exec")
            .mockImplementationOnce(() => Promise.resolve([]));

        console.log("Starting")
        const response = await request.post("/hashi/add_hashi_puzzle/").set("Cookie", ["jwt=token"]).send(
            {
                "puzzle-type": "hashi_puzzle",
                "values": invalidHashiJSON.values,
                "solution": invalidHashiJSON.solution,
                "creator-id": user.userID,
            })
        expect(response.body.puzzle_exists).toBe(false);
        expect(response.body.added).toBe(false);
        expect(response.body.message).toBe("The hashi doesn't have a solution");
    }, 10000);

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
        const response = await request.post("/hashi/add_hashi_from_upload/").set("Cookie", ["jwt=token"]).send(
            {
                puzzle_file: {
                    "puzzle-type": "eights_puzzle",
                    "values": hashiJSON.values,
                    "solution": hashiJSON.solution,
                    "creator-id": user.userID
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
        const response = await request.post("/hashi/add_hashi_from_upload/").set("Cookie", ["jwt=token"]).send(
            {
                puzzle_file: {
                    "puzzle-type": "hashi",
                    "values": invalidHashiJSONFormat.values,
                    "solution": invalidHashiJSONFormat.solution,
                    "creator-id": user.userID,
                }
            })

        expect(response.body.puzzle_exists).toBe(false);
        expect(response.body.added).toBe(false);
        expect(response.body.message).toBe('File contents are invalid.');
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
        jest.spyOn(hashiModel, "find").mockImplementationOnce(() => query);

        //Getting info that puzzle exists
        jest
            .spyOn(mongoose.Query.prototype, "exec")
            .mockImplementationOnce(() => Promise.resolve([]));

        jest
            .spyOn(mongoose.Model.prototype, "save")
            .mockImplementationOnce((prop) => prop(false));

        //Passing invalid content
        const response = await request.post("/hashi/add_hashi_from_upload/").set("Cookie", ["jwt=token"]).send(
            {
                puzzle_file: {
                    "puzzle-type": "hashi",
                    "values": hashiJSON.values,
                    "solution": hashiJSON.solution,
                    "creator-id": user.userID,
                }
            })
        console.log(response.body);
        expect(response.body.puzzle_exists).toBe(false);
        expect(response.body.added).toBe(true);
        expect(response.body).toHaveProperty('new_puzzle')
    }, 10000);
})
const app = require("../app");
const supertest = require("supertest");
const User = require("../Models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Sudoku = require("../Models/Sudoku_Model");
const Hashi = require("../Models/Hashi_Model");
const PuzzleSolved = require("../Models/PuzzleSolved");
const UserCount = require("../Models/UserCount");
const PromotionRequest = require("../Models/PromotionRequest");

describe("Tests for promoting user", () => {

    beforeEach(() => {
        request = supertest(app);
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Send a promotion request", async() => {
        
        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "solver",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"solver",
            iat: parseInt(now.getTime() / 1000),
        }));

        const promotionRequest = new PromotionRequest({
            user: user._id,
            message: "Please promote me for this test",
            datePosted: now
        })

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        jest.spyOn(PromotionRequest, "find").mockImplementationOnce(() => PromotionRequest.find({}))
        jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([]))
        jest.spyOn(PromotionRequest, "create").mockImplementationOnce(() => Promise.resolve(promotionRequest))

        const response = await request
            .post("/promotion-requests/send-promotion-request")
            .set("Cookie", ["jwt=token"])
            .send({
                "message": promotionRequest.message
            })

        expect(response.body.status).toBe("success");
        expect(response.body.data.message).toBe("Promotion request send successfully!")
        expect(response.body.data.promRequest.user.toString()).toBe(user._id.toString())
    })

    test("Try to make a promotion request when the last one was more than 30 days ago", async() => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "solver",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"solver",
            iat: parseInt(now.getTime() / 1000),
        }));

        const promotionRequest = new PromotionRequest({
            user: user._id,
            message: "Please promote me for this test",
            datePosted: now
        })

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        let last3Months = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 89).setHours(
                0,
                0,
                0,
                0
            )
        );

        let oldPromotion = new PromotionRequest({
            user: user.userID,
            message: "Please promote me for this test",
            datePosted: last3Months
        })

        jest.spyOn(PromotionRequest, "find").mockImplementationOnce(() => PromotionRequest.find({}))
        jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([oldPromotion]))
        jest.spyOn(PromotionRequest, "create").mockImplementationOnce(() => Promise.resolve(promotionRequest))

        const response = await request
            .post("/promotion-requests/send-promotion-request")
            .set("Cookie", ["jwt=token"])
            .send({
                "message": promotionRequest.message
            })

        expect(response.body.status).toBe("success");
        expect(response.body.data.message).toBe("Promotion request send successfully!")
        expect(response.body.data.promRequest.user.toString()).toBe(user._id.toString())
    })

    test("Try to send a promotion request before 30 days have passed since the last one", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "solver",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"solver",
            iat: parseInt(now.getTime() / 1000),
        }));

        const promotionRequest = new PromotionRequest({
            user: user._id,
            message: "Please promote me for this test",
            datePosted: now
        })

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        let lastWeek = new Date(
            new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7).setHours(
                0,
                0,
                0,
                0
            )
        );

        let oldPromotion = new PromotionRequest({
            user: user.userID,
            message: "Please promote me for this test",
            datePosted: lastWeek
        })

        jest.spyOn(PromotionRequest, "find").mockImplementationOnce(() => PromotionRequest.find({}))
        jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => Promise.resolve([oldPromotion]))
        jest.spyOn(PromotionRequest, "create").mockImplementationOnce(() => Promise.resolve(promotionRequest))

        const response = await request
            .post("/promotion-requests/send-promotion-request")
            .set("Cookie", ["jwt=token"])
            .send({
                "message": promotionRequest.message
            })

        expect(response.body.status).toBe("fail");
        expect(response.body.message).toBe("Must wait 30 days since last request!")
    })

    test("Get the number of active promotion requests", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        jest.spyOn(PromotionRequest, "count").mockImplementationOnce(() => Promise.resolve(4))

        const response = await request
            .get("/promotion-requests/active-number")
            .set("Cookie", ["jwt=token"])

        expect(response.body.status).toBe("success");
        expect(response.body.data.numberOfPromRequests).toBe(4)
    })

    test("Get a batch of promotion requests", async () => {
        
        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);


        let promotionRequest1 = new PromotionRequest({
            user: new mongoose.Types.ObjectId(),
            message: "First prom message",
            active: true,
            verdict: "undecided",
            datePosted: Date.now()
        })
        let promotionRequest2 = new PromotionRequest({
            user: new mongoose.Types.ObjectId(),
            message: "Second prom message",
            active: true,
            verdict: "undecided",
            datePosted: Date.now()
        })
        let promotionRequest3 = new PromotionRequest({
            user: new mongoose.Types.ObjectId(),
            message: "Third prom message",
            active: true,
            verdict: "undecided",
            datePosted: Date.now()
        })
        let promotionRequest4 = new PromotionRequest({
            user: new mongoose.Types.ObjectId(),
            message: "Fourth prom message",
            active: true,
            verdict: "undecided",
            datePosted: Date.now()
        })

        jest.spyOn(PromotionRequest, "find").mockImplementationOnce(() => PromotionRequest.find({}))
        jest.spyOn(mongoose.Query.prototype, "populate").mockImplementationOnce(() => mongoose.Query.prototype.populate(""))
        jest.spyOn(mongoose.Query.prototype, "sort").mockImplementationOnce(() => mongoose.Query.prototype.sort({}))
        jest.spyOn(mongoose.Query.prototype, "skip").mockImplementationOnce(() => mongoose.Query.prototype.skip({}))
        jest.spyOn(mongoose.Query.prototype, "limit").mockImplementationOnce(() => Promise.resolve([promotionRequest1, promotionRequest2, promotionRequest3, promotionRequest4]))

        const response = await request
            .get("/promotion-requests/active/skip/2")
            .set("Cookie", ["jwt=token"])

        expect(response.body.status).toBe("success")
        expect(response.body.data.batchSize).toBe(4)
        expect(response.body.data.promRequests.length).toBe(4)
    })

    test("Accept a promotion request", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        const userToPromote = new User({
            name: "promotee",
            email: "promotee@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "solver",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            messages: [],
            _id: new mongoose.Types.ObjectId()
        });

        const messageSent = Date.now()
        const promotedUser = new User({
            name: "promotee",
            email: "promotee@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "creator",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            messages: [{
                message: "you have been promoted",
                subject: "Promotion for a test",
                sentAt: messageSent
            }],
            numberOfNewMessages: 1,
            _id: userToPromote._id
        })

        const promRequest = new PromotionRequest({
            user: userToPromote._id,
            message: "Promote me for test",
            active: true,
            verdict: "undecided",
            dateResolved: null,
            admin: null,
            _id: new mongoose.Types.ObjectId()
        })

        const newPromRequest = new PromotionRequest({
            user: userToPromote._id,
            message: "Promote me for test",
            active: false,
            verdict: "accepted",
            dateResolved: new Date(),
            admin: user._id,
            _id: promRequest._id
        })

        jest.spyOn(PromotionRequest, "findOne").mockImplementationOnce(({_id}) => promRequest._id.toString() === _id.toString() ? Promise.resolve(promRequest) : null)
        jest.spyOn(User, "findOne").mockImplementationOnce(({_id}) => userToPromote._id.toString() === _id.toString() ? Promise.resolve(userToPromote) : null);
        jest.spyOn(PromotionRequest.prototype, "save").mockImplementationOnce(() => Promise.resolve(newPromRequest));
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(promotedUser));

        const response = await request
            .post("/promotion-requests/resolve-promotion-request")
            .set("Cookie", ["jwt=token"])
            .send({
                promID: promRequest._id,
                verdict: "accepted",
                message: "you have been promoted",
                subject: "Promotion for a test"
            })

        expect(response.body.status).toBe("success")
        expect(response.body.data.updatedPromRequest.verdict).toBe("accepted")
        expect(response.body.data.updatedPromRequest.active).toBe(false)
        expect(response.body.data.updatedPromRequest.admin.toString()).toBe(user._id.toString())
        expect(response.body.data.updatedUser.role).toBe("creator")
        expect(response.body.data.updatedUser.messages.length).toBe(1)
    })

    test("Reject a promotion request", async() => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        const userToPromote = new User({
            name: "promotee",
            email: "promotee@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "solver",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            messages: [],
            _id: new mongoose.Types.ObjectId()
        });

        const messageSent = Date.now()
        const promotedUser = new User({
            name: "promotee",
            email: "promotee@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "solver",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            messages: [{
                message: "you have not been promoted",
                subject: "reject promotion for a test",
                sentAt: messageSent
            }],
            numberOfNewMessages: 1,
            _id: userToPromote._id
        })

        const promRequest = new PromotionRequest({
            user: userToPromote._id,
            message: "Promote me for test",
            active: true,
            verdict: "undecided",
            dateResolved: null,
            admin: null,
            _id: new mongoose.Types.ObjectId()
        })

        const newPromRequest = new PromotionRequest({
            user: userToPromote._id,
            message: "Promote me for test",
            active: false,
            verdict: "rejected",
            dateResolved: new Date(),
            admin: user._id,
            _id: promRequest._id
        })

        jest.spyOn(PromotionRequest, "findOne").mockImplementationOnce(({_id}) => promRequest._id.toString() === _id.toString() ? Promise.resolve(promRequest) : null)
        jest.spyOn(User, "findOne").mockImplementationOnce(({_id}) => userToPromote._id.toString() === _id.toString() ? Promise.resolve(userToPromote) : null);
        jest.spyOn(PromotionRequest.prototype, "save").mockImplementationOnce(() => Promise.resolve(newPromRequest));
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(promotedUser));

        const response = await request
            .post("/promotion-requests/resolve-promotion-request")
            .set("Cookie", ["jwt=token"])
            .send({
                promID: promRequest._id,
                verdict: "rejected",
                message: "you have not been promoted",
                subject: "reject promotion for a test"
            })

        expect(response.body.status).toBe("success")
        expect(response.body.data.updatedPromRequest.verdict).toBe("rejected")
        expect(response.body.data.updatedPromRequest.active).toBe(false)
        expect(response.body.data.updatedPromRequest.admin.toString()).toBe(user._id.toString())
        expect(response.body.data.updatedUser.role).toBe("solver")
        expect(response.body.data.updatedUser.messages.length).toBe(1)
    })

    test("Try to resolve a promotion request that doesn't exist", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        const userToPromote = new User({
            name: "promotee",
            email: "promotee@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "solver",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            messages: [],
            _id: new mongoose.Types.ObjectId()
        });

        const messageSent = Date.now()
        const promotedUser = new User({
            name: "promotee",
            email: "promotee@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "solver",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            messages: [{
                message: "you have not been promoted",
                subject: "reject promotion for a test",
                sentAt: messageSent
            }],
            numberOfNewMessages: 1,
            _id: userToPromote._id
        })

        const promRequest = new PromotionRequest({
            user: userToPromote._id,
            message: "Promote me for test",
            active: true,
            verdict: "undecided",
            dateResolved: null,
            admin: null,
            _id: new mongoose.Types.ObjectId()
        })

        const newPromRequest = new PromotionRequest({
            user: userToPromote._id,
            message: "Promote me for test",
            active: false,
            verdict: "rejected",
            dateResolved: new Date(),
            admin: user._id,
            _id: promRequest._id
        })

        jest.spyOn(PromotionRequest, "findOne").mockImplementationOnce(({_id}) => promRequest._id.toString() === _id.toString() ? Promise.resolve(promRequest) : null)
        jest.spyOn(User, "findOne").mockImplementationOnce(({_id}) => userToPromote._id.toString() === _id.toString() ? Promise.resolve(userToPromote) : null);
        jest.spyOn(PromotionRequest.prototype, "save").mockImplementationOnce(() => Promise.resolve(newPromRequest));
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(promotedUser));

        const response = await request
            .post("/promotion-requests/resolve-promotion-request")
            .set("Cookie", ["jwt=token"])
            .send({
                promID: new mongoose.Types.ObjectId(),
                verdict: "rejected",
                message: "you have not been promoted",
                subject: "reject promotion for a test"
            })

        expect(response.body.status).toBe("fail")
        expect(response.body.message).toBe("There is no promotion request with this id")
    })

    test("Try to resolve a promotion request with an invalid user", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const user = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
          _id: new mongoose.Types.ObjectId()
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        const userToPromote = new User({
            name: "promotee",
            email: "promotee@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "solver",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            messages: [],
            _id: new mongoose.Types.ObjectId()
        });

        const messageSent = Date.now()
        const promotedUser = new User({
            name: "promotee",
            email: "promotee@gmail.com",
            password: "pass1234",
            passwordConfirm: "pass1234",
            passwordChangeDate,
            role: "solver",
            groupID: 26,
            userID: "G26-id2",
            isGuest: false,
            messages: [{
                message: "you have not been promoted",
                subject: "reject promotion for a test",
                sentAt: messageSent
            }],
            numberOfNewMessages: 1,
            _id: userToPromote._id
        })

        const promRequest = new PromotionRequest({
            user: new mongoose.Types.ObjectId(),
            message: "Promote me for test",
            active: true,
            verdict: "undecided",
            dateResolved: null,
            admin: null,
            _id: new mongoose.Types.ObjectId()
        })

        const newPromRequest = new PromotionRequest({
            user: promRequest.user,
            message: "Promote me for test",
            active: false,
            verdict: "rejected",
            dateResolved: new Date(),
            admin: user._id,
            _id: promRequest._id
        })

        jest.spyOn(PromotionRequest, "findOne").mockImplementationOnce(({_id}) => promRequest._id.toString() === _id.toString() ? Promise.resolve(promRequest) : null)
        jest.spyOn(User, "findOne").mockImplementationOnce(({_id}) => userToPromote._id.toString() === _id.toString() ? Promise.resolve(userToPromote) : null);
        jest.spyOn(PromotionRequest.prototype, "save").mockImplementationOnce(() => Promise.resolve(newPromRequest));
        jest.spyOn(User.prototype, "save").mockImplementationOnce(() => Promise.resolve(promotedUser));

        const response = await request
            .post("/promotion-requests/resolve-promotion-request")
            .set("Cookie", ["jwt=token"])
            .send({
                promID: promRequest._id,
                verdict: "rejected",
                message: "you have not been promoted",
                subject: "reject promotion for a test"
            })

        expect(response.body.status).toBe("fail")
        expect(response.body.message).toBe("There is no user associated with this promotion request")
    })
})
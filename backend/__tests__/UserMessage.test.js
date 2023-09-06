const app = require("../app");
const supertest = require("supertest");
const User = require("../Models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

describe("Tests for user messages", () => {

    let query;
    let request;

    beforeAll(() => {
        process.env = {
            ...process.env,
            JWT_COOKIE_EXPIRES_IN: 90,
          };
          query = User.findOne({});
    })

    beforeEach(() => {
        request = supertest(app);
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Read a single message for a user", async () => {

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
          messages: [
              {
                  subject: "Test message 1",
                  message: "Message for testing 1",
                  sentAt: passwordChangeDate,
                  seen: false
              }
          ],
          isGuest: false,
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"creator",
            iat: parseInt(now.getTime() / 1000),
        }));

        // mock the functions that need access to the database
        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(() => query);

        jest
            .spyOn(mongoose.Query.prototype, "sort")
            .mockImplementationOnce(() => Promise.resolve(user));

        jest
            .spyOn(User.prototype, "save")
            .mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .patch("/users/set-messages-as-seen")
            .set("Cookie", [`jwt=token`])

        expect(response.body.data.message).toBe("Messages updated successfully")
        expect(response.body.data.messages[0].message).toBe("Message for testing 1")
        expect(response.body.data.messages[0].seen).toBe(true)
    })

    test("Read multiple messages for a user", async () => {
    
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
          messages: [
              {
                    subject: "Test message 1",
                    message: "Message for testing 1",
                    sentAt: passwordChangeDate,
                    seen: false
              },
              {
                    subject: "Test message 2",
                    message: "Message for testing 2",
                    sentAt: passwordChangeDate,
                    seen: false 
              }
          ],
          isGuest: false,
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"creator",
            iat: parseInt(now.getTime() / 1000),
        }));

        // mock the functions that need access to the database
        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(() => query);

        jest
            .spyOn(mongoose.Query.prototype, "sort")
            .mockImplementationOnce(() => Promise.resolve(user));

        jest
            .spyOn(User.prototype, "save")
            .mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .patch("/users/set-messages-as-seen")
            .set("Cookie", [`jwt=token`])

        expect(response.body.data.message).toBe("Messages updated successfully")
        expect(response.body.data.messages[0].message).toBe("Message for testing 1")
        expect(response.body.data.messages[0].seen).toBe(true)
        expect(response.body.data.messages[1].message).toBe("Message for testing 2")
        expect(response.body.data.messages[1].seen).toBe(true)
    })

    test("Handle a user with no unread messages", async () => {

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
          messages: [
              {
                  subject: "Test message 1",
                  message: "Message for testing 1",
                  sentAt: passwordChangeDate,
                  seen: true
              }
          ],
          isGuest: false,
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"creator",
            iat: parseInt(now.getTime() / 1000),
        }));

        // mock the functions that need access to the database
        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(() => query);

        jest
            .spyOn(mongoose.Query.prototype, "sort")
            .mockImplementationOnce(() => Promise.resolve(user));

        jest
            .spyOn(User.prototype, "save")
            .mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .patch("/users/set-messages-as-seen")
            .set("Cookie", [`jwt=token`])

        expect(response.body.data.message).toBe("Messages updated successfully")
        expect(response.body.data.messages[0].message).toBe("Message for testing 1")
        expect(response.body.data.messages[0].seen).toBe(true)
    })

    test("Handle a user with both unread and read messages", async () => {
    
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
          messages: [
              {
                    subject: "Test message 1",
                    message: "Message for testing 1",
                    sentAt: passwordChangeDate,
                    seen: false
              },
              {
                    subject: "Test message 2",
                    message: "Message for testing 2",
                    sentAt: passwordChangeDate,
                    seen: true
              }
          ],
          isGuest: false,
        });

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: user.name,
            groupID: user.groupID,
            userID: user.userID,
            role:"creator",
            iat: parseInt(now.getTime() / 1000),
        }));

        // mock the functions that need access to the database
        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            user.userID === userID ? Promise.resolve(user) : null);

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(() => query);

        jest
            .spyOn(mongoose.Query.prototype, "sort")
            .mockImplementationOnce(() => Promise.resolve(user));

        jest
            .spyOn(User.prototype, "save")
            .mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .patch("/users/set-messages-as-seen")
            .set("Cookie", [`jwt=token`])

        expect(response.body.data.message).toBe("Messages updated successfully")
        expect(response.body.data.messages[0].message).toBe("Message for testing 1")
        expect(response.body.data.messages[0].seen).toBe(true)
        expect(response.body.data.messages[1].message).toBe("Message for testing 2")
        expect(response.body.data.messages[1].seen).toBe(true)
    })

    test("Administrator is able to send a message to another user", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const sender = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
        });

        const reciever = new User({
            name: "Recieve",
            email: "recieve@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "solver",
            groupID: 26,
            userID: "G26-id2",
            messages: [],
            isGuest: false   
        })

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: sender.name,
            groupID: sender.groupID,
            userID: sender.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            sender.userID === userID ? Promise.resolve(sender) : null);

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ _id }) => reciever.userID === _id ? Promise.resolve(reciever) : null);

        jest
            .spyOn(User.prototype, "save")
            .mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .post("/users/send-message")
            .set("Cookie", [`jwt=token`])
            .send({
                "userID": "G26-id2",
                "message": "Test send message content",
                "subject": "test send message"
            })
        
        expect(response.body.status).toBe("success");
        expect(response.body.data.user.numberOfNewMessages).toBe(1)
        expect(response.body.data.user.messages[0].seen).toBe(false)
        expect(response.body.data.user.messages[0].subject).toBe("test send message")
    })

    test("Can handle trying to send a messgae to a nonexistant user", async () => {

        const passwordChangeDate = new Date(new Date().getTime() - 1000 * 60);
        // create mock user
        const sender = new User({
          name: "Blabla",
          email: "blabla@gmail.com",
          password: "pass1234",
          passwordConfirm: "pass1234",
          passwordChangeDate,
          role: "administrator",
          groupID: 26,
          userID: "G26-id",
          isGuest: false,
        });

        const reciever = new User({
            name: "Recieve",
            email: "recieve@gmail.com",
            password: "pass5678",
            passwordConfirm: "pass5678",
            passwordChangeDate,
            role: "solver",
            groupID: 26,
            userID: "G26-id2",
            messages: [],
            isGuest: false   
        })

        const now = new Date();
        jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
            displayName: sender.name,
            groupID: sender.groupID,
            userID: sender.userID,
            role:"administrator",
            iat: parseInt(now.getTime() / 1000),
        }));

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ userID }) =>
            sender.userID === userID ? Promise.resolve(sender) : null);

        jest
            .spyOn(User, "findOne")
            .mockImplementationOnce(({ _id }) => reciever.userID === _id ? Promise.resolve(reciever) : null);

        jest
            .spyOn(User.prototype, "save")
            .mockImplementationOnce(() => Promise.resolve(true));

        const response = await request
            .post("/users/send-message")
            .set("Cookie", [`jwt=token`])
            .send({
                "userID": "G26-id3",
                "message": "Test send message content",
                "subject": "test send message"
            })
        
        expect(response.body.status).toBe("fail");
        expect(response.body.message).toBe("Could not find user")
    })
})
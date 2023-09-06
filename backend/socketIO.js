const authController = require("./Controllers/authController");
const PromotionRequest = require("./Models/PromotionRequest");
const FlaggedPuzzleTicket = require("./Models/FlaggedPuzzleTicket");
const FlaggedCommentTicket = require("./Models/FlaggedCommentTicket");
const User = require("./Models/User");
const socketio = require("socket.io");
const userCountController = require("./Controllers/userCountController");

const createSocketIO = (server) => {
  const io = socketio(server, {
    cors: {
      origin: [
        "http://0.0.0.0:3000",
        "http://localhost:3001",
        "http://localhost:3003",
        "http://0.0.0.0:35187",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:35187",
        "http://localhost:3000",
        "http://localhost:35187",
        "http://138.251.176.101:3000",
        "https://cs3099user26.host.cs.st-andrews.ac.uk/",
      ],
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    console.log("New connection");
    try {
      socket.use(async ([event, ...args], next) => {
        console.log("inside middleware");
        await authController.verifyToken(socket);
        next();
      });

      await authController.verifyToken(socket);
      const { user } = socket;
      const todaysUserCount = userCountController.addNewUser(user);

      socket.join("all-users");
      io.in("all-users").emit(
        "message",
        `New user in all-users room, total number of users now on platform is ${
          io.sockets.adapter.rooms.get("all-users").size
        }`
      );
      socket.join(`${user.role}s`);
      io.in(`${user.role}s`).emit("message", "New socket entered shared room");
      io.in("administrators").emit(
        "current-number-of-users",
        io.sockets.adapter.rooms.get("all-users").size
      );

      socket.join(`${socket.user._id}`);
      io.in(`${socket.user._id}`).emit(
        "message",
        "Socket entered its own private room"
      );

      // console.log("User asscoated with socket is: ", socket.user);

      socket.on("disconnect", (message) => {
        console.log(message);
        console.log("Courier client has disconnected from their main channel");
        socket.leave("all-users");
        socket.leave(`${user.role}s`);
        socket.leave(`${socket.user._id}`);
        if (io.sockets.adapter.rooms.get("all-users") !== undefined)
          io.in("administrators").emit(
            "current-number-of-users",
            io.sockets.adapter.rooms.get("all-users").size
          );
      });
      socket.on("message", (message) => {
        console.log(socket.user.name);
        console.log(user.name);
        console.log("Received message: ", message);
      });

      if (user.role === "administrator") {
        socket.on("send-message", async (data) => {
          console.log("Receivede message data:", data);
          const { userID } = data;

          const userToSendMessage = await User.findOne({ _id: userID });
          if (userToSendMessage) {
            io.in(`${userToSendMessage._id}`).emit(
              "new-message",
              userToSendMessage.messages[0]
            );
          }
        });
        socket.on("ban-account", async (data) => {
          const { userID } = data;
          console.log("received ban details", data);
          let userBanned = undefined;
          if (userID.includes("-")) {
            userBanned = await User.findOne({ userID: userID });
          } else {
            userBanned = await User.findOne({ _id: userID });
          }

          console.log(userBanned);
          if (!userBanned.active) {
            io.in(`${userBanned._id}`).emit(
              "user-banned",
              userBanned.banMessage
            );
          }
        });
        socket.on("resolved-new-flagged-puzzle-ticket", async (data) => {
          console.log("Received data", data);
          const { ticketID, hasMessage, isIssue } = data;

          const flaggedPuzzleTicket = await FlaggedPuzzleTicket.findOne({
            _id: ticketID,
          });
          if (flaggedPuzzleTicket) {
            console.log("Sending to other administrators");
            socket.in("administrators").emit("remove-flagged-puzzle-ticket", {
              ticketID,
            });

            if (hasMessage) {
              let userToSendMessage;
              if (isIssue) {
                userToSendMessage = await User.findOne({
                  userID: flaggedPuzzleTicket.puzzle["creator-id"],
                });
              } else {
                userToSendMessage = await User.findOne({
                  _id: flaggedPuzzleTicket.ticketer,
                });
              }
              io.in(`${userToSendMessage._id}`).emit(
                "new-message",
                userToSendMessage.messages[0]
              );
            }
          }
        });

        socket.on("resolved-new-flagged-comment-ticket", async (data) => {
          console.log("Received data about resolved commment", data);
          const { ticketID, hasMessage, isIssue } = data;

          const flaggedCommentTicket = await FlaggedCommentTicket.findOne({
            _id: ticketID,
          });
          if (flaggedCommentTicket) {
            console.log("Sending to other administrators");
            socket.in("administrators").emit("remove-flagged-comment-ticket", {
              ticketID,
            });

            if (hasMessage) {
              let userToSendMessage;
              if (isIssue) {
                if (
                  flaggedCommentTicket.feedback["user-id"] &&
                  flaggedCommentTicket.feedback["user-id"].includes("-")
                ) {
                  userToSendMessage = await User.findOne({
                    userID: flaggedCommentTicket.feedback["user-id"],
                  });
                } else {
                  userToSendMessage = await User.findOne({
                    _id: flaggedCommentTicket.feedback["user-id"],
                  });
                }
              } else {
                userToSendMessage = await User.findOne({
                  _id: flaggedCommentTicket.ticketer,
                });
              }
              io.in(`${userToSendMessage._id}`).emit(
                "new-message",
                userToSendMessage.messages[0]
              );
            }
          }
        });

        socket.on("resolved-new-promotion-request", async (data) => {
          console.log("Received data", data);

          const { promID, hasMessage } = data;
          const promotionRequest = await PromotionRequest.findOne({
            _id: promID,
            admin: socket.user._id,
          }).populate("user");

          console.log(promotionRequest);
          console.log("User associated with req is :", promotionRequest.user);
          console.log("LAst message is:", promotionRequest.user.messages[0]);

          if (promotionRequest) {
            console.log("Sending to other administrators");
            io.in("administrators").emit("remove-promotion-request", {
              promID: promotionRequest._id,
            });

            if (promotionRequest.verdict === "accepted") {
              io.in(`${promotionRequest.user._id}`).emit("update-role", {
                role: "creator",
                lastMessage: hasMessage
                  ? promotionRequest.user.messages[0]
                  : undefined,
              });
            } else if (promotionRequest.verdict === "rejected") {
              if (hasMessage) {
                socket
                  .in(`${promotionRequest.user._id}`)
                  .emit("new-message", promotionRequest.user.messages[0]);
              }
            }
          }
        });

        socket.on("send-new-message", async (data) => {
          console.log("Received data", data);

          const { userID } = data;
          const userToSendMessage = await User.findOne({ _id: userID });
          const lastMessage = userToSendMessage.messages[0];

          io.in(`${userID}`).emit("new-message", lastMessage);
        });
      } else if (user.role === "creator" || user.role === "solver") {
        if (user.role === "solver") {
          socket.on("new-promotion-request", async (data) => {
            console.log("Received data", data);
            console.log("Inside new promotion request");

            const newPromotionRequest = await PromotionRequest.findOne({
              _id: data.promID,
            }).populate("user");

            if (newPromotionRequest)
              io.in("administrators").emit(
                "new-promotion-request",
                newPromotionRequest
              );
          });
        }
      }
      socket.on("new-flagged-comment", async (data) => {
        console.log("Received new flagged comment data:", data);
        const { ticketID } = data;

        const flaggedCommentTicket = await FlaggedCommentTicket.findOne({
          _id: ticketID,
        });
        if (flaggedCommentTicket)
          io.in("administrators").emit(
            "new-flagged-comment",
            flaggedCommentTicket
          );
      });

      socket.on("new-flagged-puzzle", async (data) => {
        console.log("Received new flagged puzzle data:", data);
        const { ticketID } = data;

        const flaggedPuzzleTicket = await FlaggedPuzzleTicket.findOne({
          _id: ticketID,
        });
        if (flaggedPuzzleTicket)
          io.in("administrators").emit(
            "new-flagged-puzzle",
            flaggedPuzzleTicket
          );
      });
    } catch (e) {
      console.log(e);
      console.log("Authentication of user failed. Disconnecting socket now...");
      socket.disconnect();
    }
  });
};

module.exports = createSocketIO;

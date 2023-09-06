const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");
const createSocketIO = require("./socketIO");
const PuzzleSolved = require("./Models/PuzzleSolved");

dotenv.config({ path: "./config.env" });

const port = process.env.PORT;
const DB = process.env.DB_URL;
const DATABASE_URL = process.env.DATABASE_URL;

//Connecting to database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(async () => {
    console.log("DB connection successful!");
    //on sucessfull connection, start server.
    const server = app.listen(port, async () => {
      console.log(`App running on port ${port}...`);
    });
    createSocketIO(server);
    /*let now = new Date(new Date().setHours(0, 0, 0, 0));
    const puzzleSolved = await PuzzleSolved.create({
      date: now,
      user: "63cf09e0f0cbeba9a7af0dc1",
      puzzle: "63d6bf08488760e987c70e6e",
      puzzleType: "eights_puzzle",
    });*/
    /*let now = Date.now();
    const newFeedback = await Feedback.create({
      "puzzle-id": "63d6bf08488760e987c70e6e",
      "user-id": "63cf09e0f0cbeba9a7af0dc1",
      rating: 2,
      comment: "Worst puzzle ever",
      datePosted: now,
    });
    now = Date.now();
    const ticket = await FlaggedCommentTicket.create({
      feedback: newFeedback._id,
      ticketer: "63cf09e0f0cbeba9a7af0dc1",
      datePosted: now,
      message: "Worst comment ever",
    });
    console.log(ticket);*/
    /*const now = Date.now();
    const a = await FlaggedPuzzleTicket.create({
      message: "blabla",
      puzzle: "63d6bf08488760e987c70e6e",
      puzzleType: "eights_puzzle",
      ticketer: "63d2d5c999f722737b3b4a25",
      datePosted: now,
    });

    console.log(a);*/
    //

    /*const wss = new WebSocketServer({ port: 22714 });
    wss.on("connection", (ws) => {
      console.log("New connection");
      ws.on("message", function (message) {
        console.log("Received from client: %s", message);
      });
      ws.send("Server received from client: ");
    });*/
  })
  .catch((err) => {
    console.log(err);
  });

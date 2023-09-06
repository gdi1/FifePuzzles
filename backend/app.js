const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRouter = require("./Routes/userRouter");
const promotionRequestsRouter = require("./Routes/promotionRequestsRouter");
const flaggedPuzzlesRouter = require("./Routes/flaggedPuzzlesRouter");
const sudokuRouter = require("./Routes/SudokuRouter");
const errorController = require("./Controllers/errorController");
const manage_puzzles_creator_router = require("./Routes/ManagePuzzlesCreatorRouter");
const eights_puzzle_router = require("./Routes/EightsPuzzleRouter");
const feedback_router = require("./Routes/Feedback");
const flaggedCommentsRouter = require("./Routes/flaggedCommentsRouter");
const userCountRouter = require("./Routes/userCountRouter");
const solvedPuzzlesRouter = require("./Routes/SolvedPuzzlesRouter");
const hashi_router = require("./Routes/HashiRouter");
const manage_puzzles_solved_router = require("./Routes/ManagePuzzlesSolvedRouter");

const app = express();

app.use(helmet());

// allow CORS
app.use(
  cors({
    origin: [
      "http://0.0.0.0:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://0.0.0.0:35187",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:35187",
      "http://localhost:3000",
      "http://localhost:35187",
      "http://138.251.176.101:3000",
      "https://cs3099user26.host.cs.st-andrews.ac.uk/",
    ],
    // allow request to come with credentials
    credentials: true,
    preflightContinue: false,
  })
);

/* 
Set limiter for number of requests coming from an IP address in a short period of time.
This is mainly tries to combat any attempt to bring the server down by overwhelming it 
with too many requests in a short period of time.
*/
/*const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});*/
//app.use("/api", limiter);
//app.use("/", limiter);

// Parsing incoming request body as json.
app.use(express.json({ limit: "10kb" }));

// Doing data sanitization to avoid any attempt of NoSQL query injection
app.use(mongoSanitize());

// Doing data sanitization against XSS
app.use(xss());

// Allowing the server to be able to parse cookies such that the can be accessed in a neat way, i.e. req.cookies
app.use(cookieParser());

// Serving static files (not in use as of right now, might be eventually used for serving photos)
//app.use(express.static(`${__dirname}/public`));

// Setting routers.
app.use("/promotion-requests", promotionRequestsRouter);
app.use("/users", userRouter);

app.use("/sudoku", sudokuRouter);
app.use("/hashi", hashi_router);
app.use("/created_puzzles", manage_puzzles_creator_router);
app.use("/eights_puzzle", eights_puzzle_router);
app.use("/flagged-puzzles", flaggedPuzzlesRouter);
app.use("/feedback", feedback_router);
app.use("/flagged-comments", flaggedCommentsRouter);
app.use("/user-counts", userCountRouter);
app.use("/solved-puzzles", solvedPuzzlesRouter);
app.use("/solved-puzzles-for-solvers", manage_puzzles_solved_router);

// settign the middleware that is immedately reached in case an error is thrown by a previous middleware function
app.use(errorController);

module.exports = app;

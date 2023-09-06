const express = require("express");
const userController = require("./../Controllers/userController");
const authController = require("./../Controllers/authController");

const router = express.Router();

/*
The following are all the routes that have to do with users / registration.
*/
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPasswordRequest);
router.patch("/resetPassword/:resetToken", authController.resetPassword);
router.post("/validateGuest", authController.validateGuest);
//router.post("/", userController.createUser);

// this middleware ensure that the following routes are protected such that they can only be accessed by logged in users.
router.use(authController.protect);
router.get("/logout", authController.logout);
router.post("/update", userController.updateUser);
router.post("/changePassword", authController.changePassword);
/*router.post(
  "/request-promotion",
  authController.restrictTo("solver"),
  userController.sendPromotionRequest
);
router.get(
  "/active-promotion-requests/batch/:batch",
  authController.restrictTo("administrator"),
  userController.getPromotionRequests
);
router.get(
  "/active-promotion-requests/skip/:skip",
  authController.restrictTo("administrator"),
  userController.getPromotionRequestsSkip
);
router.get(
  "/active-promotion-requests-number",
  authController.restrictTo("administrator"),
  userController.getPromotionRequestsNumber
);*/
router.post("/delete-account", userController.deleteAccount);
/*router.post(
  "/resolve-promotion-request",
  authController.restrictTo("administrator"),
  userController.resolvePromotionRequest
);*/

router.patch("/set-messages-as-seen", userController.setMessagesAsSeen);
router.get("/verifyToken", (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
      token: req.cookies.jwt,
    },
  });
});

router
  .route("/puzzle")
  .get(authController.restrictTo("administrator"), userController.getPuzzle);

router
  .route("/recent-searched-users")
  .get(
    authController.restrictTo("administrator"),
    userController.getRecentSearchedUsers
  );

router
  .route("/recent-searched-puzzles")
  .get(
    authController.restrictTo("administrator"),
    userController.getRecentSearchedPuzzles
  );

router
  .route("/toggle-puzzle-status")
  .post(
    authController.restrictTo("administrator"),
    userController.togglePuzzleStatus
  );

router
  .route("/resolve-ban")
  .post(
    authController.restrictTo("administrator"),
    userController.resolveBanAccount
  );

router
  .route("/send-message")
  .post(
    authController.restrictTo("administrator"),
    userController.sendMessageUser
  );

router
  .route("/number-of-solvers-puzzle")
  .post(
    authController.restrictTo("administrator"),
    userController.getNumberOfSolversForPuzzle
  );

router
  .route("/:id")
  .get(authController.restrictTo("administrator"), userController.getUser);

module.exports = router;

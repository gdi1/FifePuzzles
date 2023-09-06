const User = require("./../Models/User");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const sendEmail = require("./../utils/sendEmail");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/**
 *
 * @param {*} user the user whose data is being sent through the payload
 * @returns the jwt with the required payload data and signed with the group's private key
 */
exports.signToken = (user) => {
  // get user data that will be stored inside the payload
  const { name: displayName, userID, groupID } = user;
  //console.log(process.env.JWT_PRIVATE_SECRET);

  // create the signed web token
  return jwt.sign(
    { displayName, userID, groupID },
    process.env.JWT_PRIVATE_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
      algorithm: "RS256",
    }
  );
};

/**
 *
 * @param {*} user the user whose data is being sent through the payload
 * @param {*} statusCode status code for the response
 * @param {*} res the response object
 * @param {*} isAnotherUser boolean variable indicating if the cookie storing the jwt token should be overridden or not (i.e. this has to do with cross-site authentication)
 */
const createSendToken = (user, statusCode, res, isAnotherUser = false) => {
  // create signed jwt
  const token = exports.signToken(user);

  if (!isAnotherUser) {
    //store newly created jwt as cookie on the response object
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
  }

  // make sure to remove the password from the output
  user.password = undefined;

  //send response
  res.status(statusCode).json({
    status: "success",
    data: {
      user,
      token,
    },
  });
};

/**
 * Function to validate the request of a guest user to access our website.
 */
exports.validateGuest = catchAsync(async (req, res, next) => {
  // get token from body
  const { token } = req.body;
  console.log("Here");

  // make sure there is a token in the body
  if (!token) {
    // return error with appropriate error message if not
    return next(new AppError("No Cross Site JWT.", 401));
  }

  // decode token's payload
  const payload = jwt.decode(token);

  //if not payload, return error
  if (!payload) {
    return next(new AppError("Invalid Cross Site JWT."));
  }

  // get expected fields stored inside the payload
  const { userID, groupID, displayName: name } = payload;
  console.log(userID, groupID, name);

  // validate payload data
  if (
    !userID ||
    !groupID ||
    !name ||
    groupID === 26 ||
    groupID < 20 ||
    groupID > 29 ||
    parseInt(userID.substring(1, 3)) !== groupID
  ) {
    // if validation fails, return error
    return next(new AppError("Invalid Cross Site JWT.", 401));
  }

  // use the decoded groupID to fetch the public key of the corresponding group to verify the token's signature
  const decoded = jwt.verify(token, process.env[`JWT_G${groupID}_SECRET`], {
    algorithms: ["RS256"],
  });

  // fetch guest user from our database using its unique userID
  let currentGuest = await User.findOne({ userID });

  // if user already in our database (i.e. it is not the first time accessing our website)
  if (currentGuest) {
    if (!currentGuest.active) {
      res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
      return res.status(401).json({
        status: "banned-account",
        data: {
          subject: currentGuest.banMessage.subject,
          message: currentGuest.banMessage.message,
        },
      });
    }
    console.log("Guest exists");
    /* 
    compare the name from the payload and the one stored in our database and if they differ,
    it means the user has recently changed their name on the website they are registered.
    */
    if (name && currentGuest.name !== name) {
      // updates user's name to keep database consistent
      currentGuest.name = name;
      await currentGuest.save();
    }

    // if guest user is coming for the first time to our website,
  } else {
    console.log("Guest is being created");
    // add new guest user to our database
    currentGuest = await User.create({
      name,
      userID,
      groupID,
      email: undefined,
    });
  }
  // create jwt signed with our group's private key and send it back to the client-side
  createSendToken(currentGuest, 200, res);
});

/**
 * Function for registering new users.
 */
exports.signup = catchAsync(async (req, res, next) => {
  // get expected fields from the sign up form
  const { name, email, password, passwordConfirm } = req.body;

  /* 
  Create new user. This function might fails, because of the validations done behind the scenes by the imposed mongoose schema.
  The schema will block the creation of a new user if e.q. the two passwords differ, there is no email, there is no name etc.
  */
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  // if the creation is successfull, send signed jwt abck to client-side to give access to protected routes.
  createSendToken(user, 201, res);
});

/**
 * Function to log in an already registered user.
 */
exports.login = catchAsync(async (req, res, next) => {
  console.log("Hereeee");
  const { email, password, isAnotherUser } = req.body;

  // check if the user has entered a password and an email
  if (!email || !password) {
    // if not, return error immediately
    return next(new AppError("Please provide email and password!", 400));
  }
  // fetch user from the database
  const user = await User.findOne({ email }).select("+password");

  /*
  if no user is found or if there is an user with the specified email 
  but the hashed password stored inside the database does not match the entered password, return error immediately
  */
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password!", 401));
  }

  if (!user.active) {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    return res.status(401).json({
      status: "banned-account",
      data: {
        subject: user.banMessage.subject,
        message: user.banMessage.message,
      },
    });
  }

  // if log in is successfull, send token back to client to give access to protected routes.
  createSendToken(user, 200, res, isAnotherUser);
});

/**
 * Function used for protecting backend routes
 */
exports.protect = catchAsync(async (req, res, next) => {
  // tries to get the jwt stored as a cookie on the current request
  const token = req.cookies.jwt;

  //if no token, return error immediately
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  /*
  verify the token by using the group's public key, 
  i.e. this ensures that the token has indeed been encrypted with the group's private key
  */
  const decoded = jwt.verify(token, process.env.JWT_PUBLIC_SECRET, {
    algorithms: ["RS256"],
  });

  // if payload is malformed, return error immediately
  if (!decoded) {
    return next(new AppError("Invalid JWT payload.", 401));
  }
  // retrieve expected fields from the payload
  const { userID, groupID, displayName: name, iat } = decoded;

  // validate payload data
  if (
    !userID ||
    !groupID ||
    !name ||
    groupID < 20 ||
    groupID > 29 ||
    parseInt(userID.substring(1, 3)) !== groupID
  ) {
    // if validation fails, return error immediately
    return next(new AppError("Invalid JWT payload.", 401));
  }

  // fetch user from teh database using its unique userID
  const currentUser = await User.findOne({ userID });
  // if no user is found, return error immediately
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  if (!currentUser.active) {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    return res.status(401).json({
      status: "banned-account",
      data: {
        subject: currentUser.banMessage.subject,
        message: currentUser.banMessage.message,
      },
    });
  }

  /*
  if user is found, make sure it is not a guest and in that case,
  check if they changed their password more recent than the token's creation time.
  In that case, invalidate the token and return an error immediately.
  */
  if (!currentUser.isGuest && currentUser.changedPasswordAfter(iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  /*
  Attach the user the data to the request such that
  subsequent middleware functions are aware of what user the request corresponds to 
  */
  req.user = currentUser;
  /*
  make sure to call the next middleware function 
  (i.e. otherwise the request will be stuck here and noresponse will be send back to the client) 
  */
  next();
});

/**
 * This function is used for restricting access to certain routes to just the specified user roles.
 * @param  {...any} roles the user roles that are allowed to access the subsequent middleware functions.
 * @returns returns a function that check if the current user's role is within those that are allowed, in which case the next middleware function is called
 */
exports.restrictTo = (...roles) => {
  // makes use of closure to have access to the outer function's variables
  return (req, res, next) => {
    /*
    if the current user's role is not within those specified, 
    then immediately return error without allowing the user to access the subsequent protected middleware functions 
    */
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    // call next middleware function to let user to move forward with their request processing
    next();
  };
};

/**
 * Function to log out a user from their account
 * @param {*} req the request object
 * @param {*} res the response object
 */
exports.logout = (req, res) => {
  /*
  override the cookie that stores the current user's valid jwt inside the browser to a default value, i.e. "loggedout",
  which will always fail during jwt validation.
   */
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  // send response back to client stating that their logout was successful
  res.status(200).json({ status: "success" });
};

/**
 * Function handling "forgot password" requests.
 */
exports.forgotPasswordRequest = catchAsync(async (req, res, next) => {
  // get the email of the user who has forgooten their password and wants to change it
  const { email } = req.body;

  // if there is no email the request's body, return error immediately
  if (!email) {
    return next(new AppError("Please provide an email.", 400));
  }

  // fetch user corresponding to specified email
  const user = await User.findOne({ email });

  // if no user is found, return error immediately
  if (!user) {
    return next(new AppError("There is no user with this email address.", 404));
  }

  // generate random token for resetting the password
  const resetToken = crypto.randomBytes(32).toString("hex");
  // hash the token and store it on the current user's record.
  user.passwordResetToken = await bcrypt.hash(resetToken, 12);
  // set expiration date for the reset token, i.e. 10 minutes
  user.resetTokenExpiryDate = new Date(new Date().getTime() + 1000 * 60 * 10);
  // save the hashed token and the expiration date on the user's record
  await user.save();

  //generate URL used for reseting the password
  const resetURL = `${process.env.RESET_URL.replace(
    "<hostname>",
    process.env.REST_URL_HOSTNAME
  )}/${resetToken}`;

  const text = `Forgot or want to reset your password? Use the following link to reset your password: ${resetURL}.\nIf you did not request to change your password, ignore this email.`;

  // send mail to the user's email address
  // the mail will contain inside its body the URL the user will have to follow to change their password.
  await sendEmail.sendEmail({
    to: email,
    subject: "Password Reset Request",
    text,
  });
  // send response back to client that the email has been successfully sent
  res.status(200).json({
    status: "success",
    data: {
      message: "Verify your email!",
    },
  });
});

/**
 * Function used for resetting a user's password
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  // get the email address, the new password and the confirmation of the new password
  const { email, password, passwordConfirm } = req.body;

  // get reset token
  const { resetToken } = req.params;

  // if there is no email address, return error immediately
  if (!email) {
    return next(new AppError("Invalid email address.", 400));
  }

  // fetch user from the database corresponding to the specified email address
  const user = await User.findOne({ email });
  // if no user is found, return error immediately
  if (!user) {
    return next(new AppError("Invalid email address.", 404));
  }

  // make sure the user has actually made a reequest to cahnge their password, if not return error immediately
  if (!user.resetTokenExpiryDate || !user.passwordResetToken) {
    return next(
      new AppError(
        "You must make a request to change your password first.",
        404
      )
    );
  }

  // get current time
  const now = new Date();
  /*
  verify the reset token's expiration date has already passed,
  then erase the reset token and its expiration date from the user's record 
  and return error immediately
  */
  if (user.resetTokenExpiryDate.getTime() < now.getTime()) {
    user.resetTokenExpiryDate = undefined;
    user.passwordResetToken = undefined;
    await user.save();
    return next(
      new AppError(
        "Reset token has expired. You must make another request to change your password.",
        404
      )
    );
  }

  /*
  Compare the reset token brought by the client with the hashed version stored on the current user's record.
  If they do not match, return error immediately 
  */
  if (!(await bcrypt.compare(resetToken, user.passwordResetToken))) {
    return next(new AppError("Invalid reset token.", 404));
  }

  // update new password
  user.password = password;
  /* 
  Update confirmation password.
  If the two passwords do not match, then the imposed mongoose schema will throw a validation error.
  (i.e. this is the reason why I do not check that the two passwords are the same here)
  */
  user.passwordConfirm = passwordConfirm;
  // delete the reset token and its expiration date from the user's record.
  user.passwordResetToken = undefined;
  user.resetTokenExpiryDate = undefined;

  // save changes
  await user.save();

  // send token to client to allow them to access protected routes afterwards.
  createSendToken(user, 200, res);
});

/**
 * Function for changing user's password. This is used when the user did not forget their current password,
 * but they voluntarily want to change it.
 */
exports.changePassword = catchAsync(async (req, res, next) => {
  // user has to enter their current password and the new one two times.
  const { password, newPassword, newPasswordConfirm } = req.body;
  // if not all fields have been entered, then return error immediately
  if (!password || !newPassword || !newPasswordConfirm) {
    return next(new AppError("All fields are required.", 400));
  }
  /* 
  if the user is a guest, they should not be able to access this route so return error immediately
  The front end will usually block guest users from actually accessing this route, 
  but in case they mess around with the front end code the backend code will still block them.
  */
  if (req.user.isGuest) {
    return next(new AppError("Guest users cannot change their password.", 400));
  }
  // fetch user from the database that corresponds to the specified email address, making sure to include their password in the result
  const user = await User.findOne({ email: req.user.email }).select(
    "+password"
  );

  //if no user is found, return an error immediately
  if (!user) {
    return next(new AppError("User not found.", 400));
  }

  // if user is found, make sure the hashed password on their record corresponds to the one they entered
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Current password is not correct.", 400));
  }

  // change their password with the new one
  user.password = newPassword;
  /*
  Update the confirmation password as well. Once again, The code does not check if the passwords match
  because the validation mechanism done by the imposed mongoose schema will do this bit for us. 
  */
  user.passwordConfirm = newPasswordConfirm;
  //save changes
  await user.save();
  /*
  Need to send new token to client even though they had a valid token stored as cookie in the browser.
  The reason for doing this is bacause now they have changed their password more recently 
  than the creation time of the currently stored token within the browser. 
  This means that the validation of their current token will fail this check  and so a new token is sent
  to override the existing one.
  */
  createSendToken(user, 200, res);
});

const parseCookie = (str) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});

exports.verifyToken = async (socket) => {
  const cookies = parseCookie(socket.request.headers.cookie);

  const token = cookies.jwt;

  const decoded = jwt.verify(token, process.env.JWT_PUBLIC_SECRET, {
    algorithms: ["RS256"],
  });

  // if payload is malformed, return error immediately
  if (!decoded) {
    return next(new AppError("Invalid JWT payload.", 401));
  }
  // retrieve expected fields from the payload
  const { userID, groupID, displayName: name, iat } = decoded;

  // validate payload data
  if (
    !userID ||
    !groupID ||
    !name ||
    groupID < 20 ||
    groupID > 29 ||
    parseInt(userID.substring(1, 3)) !== groupID
  ) {
    // if validation fails, return error immediately
    return next(new AppError("Invalid JWT payload.", 401));
  }

  // fetch user from teh database using its unique userID
  const currentUser = await User.findOne({ userID });
  // if no user is found, return error immediately
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  /*
  if user is found, make sure it is not a guest and in that case,
  check if they changed their password more recent than the token's creation time.
  In that case, invalidate the token and return an error immediately.
  */
  if (!currentUser.isGuest && currentUser.changedPasswordAfter(iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  /*
  Attach the user the data to the request such that
  subsequent middleware functions are aware of what user the request corresponds to 
  */
  socket.user = currentUser;
};

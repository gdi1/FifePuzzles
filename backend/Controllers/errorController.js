const AppError = require("./../utils/appError");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

/**
 * @param {} error the error that has been thrown by the mongoose schema
 */
const handleUserValidationFail = (err) => {
  const keys = Object.keys(err.errors);
  let message = "";
  let messageMap = {};

  // parse all the errors and store their message and the field they correspond to in a suitable structure.
  for (let key in keys) {
    const error = err.errors[keys[key]];
    message += error.properties.message + "\n";
    messageMap[keys[key]] = error.properties.message;
  }

  // create new operational error whose message will contain all the gathered error messages
  err = new AppError(message, 400);

  /*
  Attach to this error the structures containing the error messages and their corresponding fields.
  These structures are used by the front end to render the error messages in a nice format.
  */
  err.keys = keys;
  err.messageMap = messageMap;

  return err;
};

/**
 * @param {} error thrown by the mongodb server complaining about duplicate keys
 */
const handleDuplicateKey = (err) => {
  let message = "";
  let keys = [];
  let messageMap = {};

  // if the mongodb is complaining about duplicate emails, store custom error message
  if (err.keyPattern.email) {
    message += "Email already in use!";
    keys.push("email");
    messageMap.email = "Email already in use!";
  }

  // if the mongodb is complaining about duplicate userIDs, store custom error message
  if (err.keyPattern.userID) {
    message += "User ID already in use!";
    keys.push("userID");
    messageMap.userID = "User ID already in use!";
  }

  // create new operational error whose message will contain all the gathered error messages
  err = new AppError(message, 400);
  /*
  Attach to this error the structures containing the error messages and their corresponding fields.
  These structures are used by the front end to render the error messages in a nice format.
  */
  err.keys = keys;
  err.messageMap = messageMap;

  return err;
};

/**
 * @param {} error the error that is of type either JsonWebTokenError or TokenExpiredError
 */
const handleJWTError = (err) => {
  // extract the message field from the error
  const { message } = err;
  // create new operation error with the extracted error message, while also setting the response status code to be 401.
  return new AppError(message, 401);
};

const sendError = (err, res) => {
  /* 
  if the error is operational, it means that we have dealt with it 
  and that we have been able to extract the custom error messages
  and we can feed them to the client-sde to be displayed.
  */
  if (err.isOperational) {
    console.log(err.message);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      keys: err.keys,
      messageMap: err.messageMap,
    });
    /* 
    if error is not operational, then it means that is an unexpected error
    that we haven't dealt in any way so respond back with a default error format.
    */
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

/**
 * Function used as the error handling middleware during the processing of any request.
 * @param {*} err the error thrown by any of the previous middlewares
 * @param {*} req the request object
 * @param {*} res the response object
 * @param {*} next uesd for callind the next middleware
 */
module.exports = (err, req, res, next) => {
  // if err has now status code set, then default it to 500
  err.statusCode = err.statusCode || 500;
  // if error has now status set, then default it to "error"
  err.status = err.status || "error";

  console.log(err);
  /*
  if err is a mongoose validation error, then use handleUserValidationFail() 
  to extract the custom error message
  */
  if (err instanceof mongoose.Error.ValidationError) {
    console.log("here");
    err = handleUserValidationFail(err);

    /* 
    if the error's code is 11000, it means that the error is thrown by mongodb server 
    complaining about a duplicate key. Use handleDuplicateKey() function to find out about what 
    field it is complaining to be able to display custom error messages on the client side.
    */
  } else if (err.code === 11000) {
    err = handleDuplicateKey(err);

    /*
    if the errors have to do with an invalid jwt, 
    then use handleJWTError() to extract the custom error message 
    */
  } else if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.TokenExpiredError
  ) {
    err = handleJWTError(err);
  }
  // send the error to the client side.
  sendError(err, res);
};

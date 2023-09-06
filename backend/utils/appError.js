/**
 * Custom erorr class
 */
class AppError extends Error {
  /**
   *
   * @param {*} message the message corresponding to the error thrown
   * @param {*} statusCode the status code associated with the error
   */
  constructor(message, statusCode) {
    super(message);
    // set the associated status code
    this.statusCode = statusCode;
    // set custom status on the error (i.e. used in front end for distinguising between errors)
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // set the error to be operational to distinguish between program errors and other types of server errors.
    this.isOperational = true;
  }
}
// export custom error.
module.exports = AppError;

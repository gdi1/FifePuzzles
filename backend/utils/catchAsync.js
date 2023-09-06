/* 
This helper function si used through out the AutController.js file to help improve quality.
What the function does is to take another functino as a parameter, which is supposed to be an async function,
and then to return another function which accepts three parameters (i.e. the function returned will be used as middleware)
and inside its body it consumes the specified async function. 
Note that when catching an error, the next function is called with the parameter set to the error that was jsut thrown
such that ExpressJS will immediately know to skip subsequent middleware functions until it reaches an error handling middleware function.
The main reason for this function was because middleware functions cannot be async functions. 
Moreover, I prefer the async/await syntax for consuming promises, instead of using then()/catch().
*/
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

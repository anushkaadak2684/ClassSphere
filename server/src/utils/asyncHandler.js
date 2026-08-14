/**
 * Higher-order function to wrap async express route handlers
 * and catch unhandled promise rejections.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

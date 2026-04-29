/**
 * asyncHandler — wraps async Express route handlers.
 * Forwards any thrown error to Express's next(error) chain.
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

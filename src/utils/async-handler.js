function asyncHandler(requestHandler) {
  return function (req, res, next) {
    try {
      Promise.resolve(requestHandler(req, res, next)).catch(function (err) {
        next(err);
      });
    } catch (err) {
      next(err);
    }
  };
}

export { asyncHandler };

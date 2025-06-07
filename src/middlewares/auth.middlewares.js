import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

const isLoggedIn = asyncHandler((req, res, next) => {
  const jwtToken = req.cookies?.access_token;

  if (!jwtToken) {
    return res.status(400).json(new ApiError(400, "Authentication failed"));
  }

  const decodedData = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET);

  req.user = decodedData;

  next();
});

export { isLoggedIn };

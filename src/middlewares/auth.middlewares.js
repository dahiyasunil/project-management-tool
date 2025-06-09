import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

const isLoggedIn = asyncHandler((req, res, next) => {
  const jwtToken = req.cookies?.access_token;

  if (!jwtToken) {
    throw new ApiError(400, "Invalid access token");
  }

  try {
    const decodedData = jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decodedData;
    next();
  } catch (err) {
    console.error(err);
    throw new ApiError(401, "Invalid or Expired access token");
  }
});

export { isLoggedIn };

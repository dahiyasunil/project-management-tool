import { ApiResponse } from "../utils/api-response.js";

function healthCheck(req, res) {
  return res
    .status(200)
    .json(new ApiResponse(200, { message: "Server is running" }));
}

export { healthCheck };

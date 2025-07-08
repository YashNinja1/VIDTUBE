import {ApiResponse} from "../utils/Apiresponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
  const response = new ApiResponse("Server is running smoothly", 200);
  return res.status(response.statusCode).json(response);
});
export {healthCheck};

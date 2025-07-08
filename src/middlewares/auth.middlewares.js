import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js";
import {ApiResponse} from "../utils/Apiresponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return new ApiResponse(401, null, "Unauthorized: No access token provided");
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?.id).select(
      "-passsword -refreshToken"
    );
    if (!user) {
      return new ApiResponse(401, null, "Unauthorized: User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    return new ApiResponse(401, null, "Unauthorized: Invalid access token");
  }
});

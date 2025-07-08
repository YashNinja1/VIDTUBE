import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import {uploadImage, deleteImage} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  // Logic for registering a user
  const {fullname, username, email, password} = req.body;

  // Validate input
  if (!username || !email || !password || !fullname) {
    return res.status(400).json({message: "All fields are required"});
  }

  const avatarpath = req.files?.avatar[0]?.path; // Get the uploaded avatar file path
  const coverImagepath = req.files?.coverImage[0]?.path; // Get the uploaded cover image file path
  let avatar = "";

  avatar = await uploadImage(avatarpath);

  let coverImage = "";

  coverImage = await uploadImage(coverImagepath);

  User.findOne({
    $or: [{username}, {email}],
  }).then((existingUser) => {
    if (existingUser) {
      if (avatar) {
        deleteImage(avatar.public_id); // Clean up the uploaded avatar file
      }
      if (coverImage) {
        deleteImage(coverImage.public_id);
      } // Clean up the uploaded cover image file
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }
  });

  try {
    const user = await User.create({
      username: username.toLowerCase(),
      email,
      fullname,
      avatar: avatar.url, // Store the URL of the uploaded avatar
      coverImage: coverImage?.url, // Store the URL of the uploaded cover image
      password,
    });
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiResponse(404, "Something went wrong");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    throw new Error("Error creating user");
  }
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    return {accessToken, refreshToken};
  } catch (error) {
    throw new ApiResponse(500, null, "Error generating tokens");
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const {email, username, password} = req.body;
  if (!email && !username && !password) {
    return res
      .status(400)
      .json({message: "Email, username and password all fields are required"});
  }
  const user = await User.findOne({
    $or: [{email}, {username}],
  });
  if (!user) {
    throw new ApiResponse(404, null, "User not found");
  }

  const passwordCheck = await user.comparePassword(password);
  if (!passwordCheck) {
    return res.status(400).json({message: "Invalid credentials"});
  }
  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(
    user._id
  );

  // select the user without password and refreshToken
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!loggedInUser) {
    return res.status(404).json({message: "User not found"});
  }

  const options = {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      refreshToken: undefined, // Clear the refresh token
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearcookie("refreshToken", "", options)
    .clearcookie("accessToken", "", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({message: "No refresh token provided"});
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res.status(404).json({message: "Invalid refresh token"});
    }
    if (user?.refreshToken !== incomingRefreshToken) {
      return res.status(403).json({message: "Invalid refresh token"});
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    const {accessToken, refreshToken: newRefreshToken} =
      generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          {accessToken, refreshToken: newRefreshToken},
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    return res.status(500).json({message: "Error refreshing access token"});
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const {currentPassword, newPassword} = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return res.status(400).json({message: "Current password is incorrect"});
  }
  user.password = newPassword;
  await user.save({validateBeforeSave: false});

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current user retrieved successfully")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const {fullname, email} = req.body;
  if (!fullname || !email) {
    return res.status(400).json({message: "Fullname and email are required"});
  }
  const user = User.findByIdAndUpdate(req.user?._id, {
    $set: {
      fullname,
      email,
    },
  }).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    return res.status(400).json({message: "Avatar file is required"});
  }
  const avatar = await uploadImage(avatarLocalPath);
  if (!avatar.url) {
    return res.status(500).json({message: "Error uploading avatar"});
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {$set: {avatar: avatar.url}},
    {new: true}
  ).select("-password -refreshToken");
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    return res.status(400).json({message: "Cover image file is required"});
  }
  const coverImage = await uploadImage(coverImageLocalPath);
  if (!coverImage.url) {
    return res.status(500).json({message: "Error uploading cover image"});
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {$set: {coverImage: coverImage.url}},
    {new: true}
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
};

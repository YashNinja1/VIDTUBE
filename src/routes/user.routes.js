import {Router} from "express";
import {
  registerUser,
  logoutUser,
  loginUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js";
import {verifyJWT} from "../middlewares/auth.middlewares.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    }, // Upload a single avatar image
    {
      name: "coverImage",
      maxCount: 1,
    }, // Upload a single cover image
  ]),
  registerUser // Controller function to handle user registration
);

router.route("/logout").post(verifyJWT, logoutUser); // Route for user logout, protected by JWT verification

router.route("/login").post(loginUser); // Route for user login

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/watch-history").get(verifyJWT, getWatchHistory);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateAccountDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAccountDetails);
export default router;

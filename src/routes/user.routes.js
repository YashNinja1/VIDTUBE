import {Router} from "express";
import {registerUser, logoutUser} from "../controllers/user.controller.js";
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

export default router;
// This file defines the user-related routes for the application.
// It imports the necessary modules and the user controller, then sets up a route for user registration.

import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      required: true,
      index: true,
    },
    avatar: {
      type: String, // URL to the avatar image
      required: true,
    },
    coverImage: {
      type: String, // URL to the cover image
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {timestamps: true}
);

userSchema.pre("save", async function (next) {
  // Hash the password before saving
  if (this.isModified("password")) {
    const saltRounds = 10;
    bcrypt.hash(this.password, saltRounds, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};

userSchema.methods.generateAccessToken = function () {
  // Generate an access token
  return jwt.sign(
    {
      userId: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET, // Access token secret from environment variables
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Access token expires in  minutes
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  // Generate a refresh token
  return jwt.sign(
    {userId: this._id},
    process.env.REFRESH_TOKEN_SECRET, // Refresh token secret from environment variables
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Refresh token expires in 7 days
    }
  );
};

export const User = mongoose.model("User", userSchema);

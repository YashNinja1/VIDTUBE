import mongoose from "mongoose";
const {Schema} = mongoose;

const likeSchema = new Schema(
  {
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment", // Assuming you have a Comment model
      required: false, // Optional, if likes can be on videos without comments
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet", // Assuming you have a Tweet model
      required: false, // Optional, if likes can be on videos without tweets
    },
  },
  {timestamps: true}
);

export const Like = mongoose.model("Like", likeSchema);

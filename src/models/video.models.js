import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensure each video file is unique
    },
    thumbnail: {
      type: String, // URL to the thumbnail image
      required: true,
    },
    title: {
      type: String, // Title of the video
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isPublished: {
      type: Boolean,
      default: true, // Default to true, meaning the video is published
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {timestamps: true}
);
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);

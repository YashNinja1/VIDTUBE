import mongoose from "mongoose";
const {Schema} = mongoose;

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, //owner of the subscription
      ref: "User",
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId, //to whom the user is subscribing
      ref: "User",
      required: true,
    },
  },
  {timestamps: true}
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

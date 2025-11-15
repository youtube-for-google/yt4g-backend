import mongoose, { Schema, model } from "mongoose";

const likeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
});

export const Like = model("Like", likeSchema);

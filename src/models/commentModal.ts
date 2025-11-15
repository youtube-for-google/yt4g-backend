import mongoose, { Schema, model } from "mongoose";

const commentSchema = new Schema({
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
});

export const Comment = model("Comment", commentSchema);

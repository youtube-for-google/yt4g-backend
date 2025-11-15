import mongoose, { Schema, model } from "mongoose";

const videoSchema = new Schema({
  title: { type: String, required: true },
  channel: { type: String, required: true },
  views: { type: Number, default: 0 },
  cat: { type: String, required: true },
  thumbnail: { type: String, required: true },
});

export const Video = model("Video", videoSchema);

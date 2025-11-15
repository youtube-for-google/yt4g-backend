import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  avatar: String,
});

export const User = model("User", userSchema);

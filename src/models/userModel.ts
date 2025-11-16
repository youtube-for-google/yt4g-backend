import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    // Common OAuth fields
    name: { type: String, required: true },
    email: { type: String }, // often returned by provider
    avatar: { type: String }, // from Google profile.photos
    provider: { type: String }, // e.g., 'google', 'github'
    providerId: { type: String, unique: true }, // provider's unique user id
  },
  { timestamps: true }
);

export const User = model("User", userSchema);

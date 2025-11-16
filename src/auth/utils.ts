import jwt from "jsonwebtoken";
import { Document } from "mongoose";

import crypto from "crypto";

/**
 * Shape of token payload we embed
 */
interface TokenPayload {
  id: string;
  name: string;
}

const SECRET = process.env.JWT_SECRET || "yt4g_dev_secret";

/**
 * Issue a JWT for a given user document.
 * Accepts any Mongoose document containing _id/name.
 */
export function signToken(
  user: Document & { id?: string; _id?: any; name?: string }
) {
  const payload: TokenPayload = {
    id: user.id ?? String(user._id),
    name: user.get?.("name") ?? (user as any).name ?? "User",
  };
  return jwt.sign(payload, SECRET, { expiresIn: "15m" }); // short‑lived access token
}

/**
 * Verify and decode a JWT.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Reusable random refresh token generator
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

import jwt from "jsonwebtoken";
import { Document } from "mongoose";

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
 */
export function signToken(user: Document & { id: string; name: string }) {
  const payload: TokenPayload = {
    id: user.id,
    name: user.get("name"),
  };
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
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

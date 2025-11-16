import jwt from "jsonwebtoken";
import { verifyToken } from "./utils";
import { User } from "../models/userModel";

const SECRET = process.env.JWT_SECRET || "yt4g_dev_secret";

export async function authMiddleware(req: any, _res: any, next: any) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return next();

  try {
    // verifyToken is your safe wrapper around jwt.verify
    const decoded: any = verifyToken(token) || jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch (err) {
    console.warn("Invalid token:", err);
  }
  next();
}

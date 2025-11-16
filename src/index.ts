import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "./auth/passport";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { json } from "body-parser";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { videoTypeDefs, videoResolvers } from "./schema/video";
import { userTypeDefs, userResolvers } from "./schema/user";
import { commentTypeDefs, commentResolvers } from "./schema/comment";
import { likeTypeDefs, likeResolvers } from "./schema/like";

import { generateRefreshToken, signToken } from "./auth/utils"; // your JWT helper

import { authMiddleware } from "./auth/middleware";

import cookieParser from "cookie-parser";

import { User } from "./models/userModel";

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB Atlas");

    // --- GraphQL schema construction ---
    const typeDefs = [
      `#graphql
        type Query { _empty: String }
        type Mutation { _empty: String }
      `,
      videoTypeDefs,
      userTypeDefs,
      commentTypeDefs,
      likeTypeDefs,
    ];

    const resolvers = [
      videoResolvers,
      userResolvers,
      commentResolvers,
      likeResolvers,
    ];

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:4000";

    // --- Express app baseline ---
    const app = express();
    app.use(cors({ origin: CLIENT_URL, credentials: true }));
    app.use(json());

    // --- Enable cookie parsing ---
    app.use(cookieParser());

    // --- Plug-in the auth req.user before reaching Apollo ---
    app.use(authMiddleware);

    // --- Session + Passport wiring ---
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "yt4g_secret",
        resave: false,
        saveUninitialized: false,
      })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    // --- OAuth endpoints ---
    app.get(
      "/api/auth/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get(
      "/api/auth/callback/google",
      passport.authenticate("google", { failureRedirect: "/" }),
      async (req, res) => {
        const user = req.user as any;

        // Short‑lived Access Token
        const accessToken = signToken(user); // keep your expiry ~15 min inside signToken()

        // Long‑lived Refresh Token
        const refreshToken = generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();

        // Send Refresh Token as secure, httpOnly cookie
        res.cookie("rt", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        // Redirect back to the shell with access token
        const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:4000";
        res.redirect(`${CLIENT_URL}/?token=${accessToken}`);
      }
    );

    // --- Health checkup route for future container orchestration ---
    app.get("/health", (_req, res) => res.send("OK"));

    // --- Refresh route action ---
    app.post("/api/auth/refresh", async (req, res) => {
      const refreshToken = req.cookies.rt;
      if (!refreshToken)
        return res.status(401).json({ error: "No refresh token" });

      const user = await User.findOne({ refreshToken });
      if (!user)
        return res.status(403).json({ error: "Invalid refresh token" });

      const newAccess = signToken(user);
      res.json({ accessToken: newAccess });
    });

    // --- Logout actions ---
    app.post("/api/auth/logout", async (req, res) => {
      const token = req.cookies.rt;
      if (token) {
        await User.updateOne(
          { refreshToken: token },
          { $unset: { refreshToken: "" } }
        );
      }
      res.clearCookie("rt");
      res.sendStatus(204);
    });

    // --- Apollo integration with Express ---
    const apolloServer = new ApolloServer({
      schema,
    });

    await apolloServer.start();

    app.use(
      "/graphql",
      expressMiddleware(apolloServer, {
        context: async ({ req }) => ({
          user: (req as any).user || null,
        }),
      })
    );

    const PORT = Number(process.env.PORT) || 4000;
    app.listen(PORT, () =>
      console.log(` Server ready at http://localhost:${PORT}/graphql`)
    );
  } catch (err) {
    console.error("Error starting server:", err);
  }
}

startServer();

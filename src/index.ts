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

import { signToken } from "./auth/utils"; // your JWT helper

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
      (req, res) => {
        const token = signToken(req.user as any);
        const redirectUrl = `${CLIENT_URL}/?token=${token}`;
        res.redirect(redirectUrl);
      }
    );

    // --- Health checkup route for future container orchestration ---
    app.get("/health", (_req, res) => res.send("OK"));

    // --- Apollo integration with Express ---
    const apolloServer = new ApolloServer({
      schema,
    });

    await apolloServer.start();
    app.use("/graphql", expressMiddleware(apolloServer));

    const PORT = Number(process.env.PORT) || 4000;
    app.listen(PORT, () =>
      console.log(` Server ready at http://localhost:${PORT}/graphql`)
    );
  } catch (err) {
    console.error("Error starting server:", err);
  }
}

startServer();
